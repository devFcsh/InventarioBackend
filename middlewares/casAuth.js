import passport from 'passport';
import session from 'express-session';
import crypto from 'crypto';
import axios from 'axios';
import { DOMParser } from 'xmldom';

// 1) Configuración de sesión
export const sessionMiddleware = session({
  secret:
    process.env.SESSION_SECRET ||
    "clave-secreta-cas-espol-2024-ultra-segura-fixed",
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
  name: "cas.session.id",
  genid: () => {
    return crypto.randomBytes(16).toString("hex");
  },
});

// 2) Estrategia CAS personalizada para ESPOL
class EspolCasStrategy extends passport.Strategy {
  constructor(options, verify) {
    super();
    this.name = "cas";
    this.casURL = options.casURL;
    this.serviceURL = options.serviceURL;
    this.version = options.version || "CAS2.0";
    this._verify = verify;
  }

  authenticate(req, options) {
    console.log("🎯 === ESTRATEGIA CAS PERSONALIZADA ===");
    console.log("URL:", req.originalUrl);
    console.log("Query:", req.query);

    if (!req.query.ticket) {
      const loginURL = `${this.casURL}/login?service=${encodeURIComponent(
        this.serviceURL
      )}`;
      console.log("🔄 Redirigiendo a CAS login:", loginURL);
      return this.redirect(loginURL);
    }

    this.validateTicket(req.query.ticket, req)
      .then((profile) => {
        // Passport espera que llames a la función de verificación con un callback tipo done
        this._verify(profile, (err, user) => {
          if (err) return this.error(err);
          if (!user) return this.fail('No user');
          this.success(user);
        });
      })
      .catch((err) => {
        console.error("❌ Error validando ticket:", err);
        this.fail(err.message);
      });
  }

  async validateTicket(ticket, req) {
    console.log("🎫 Validando ticket:", ticket);

    const validateURL = `${this.casURL}/serviceValidate`;
    const params = new URLSearchParams({
      service: this.serviceURL,
      ticket: ticket,
    });

    try {
      const response = await axios.get(`${validateURL}?${params}`, {
        timeout: 10000,
        headers: {
          "User-Agent": "Node.js CAS Client",
        },
      });

      console.log("📝 Respuesta CAS:", response.data);

      // CAS 2.0 devuelve XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/xml");

      // Verificar si hay error
      const failure = doc.getElementsByTagName("cas:authenticationFailure")[0];
      if (failure) {
        const errorCode = failure.getAttribute("code");
        const errorMessage = failure.textContent;
        throw new Error(
          `CAS Authentication Failed: ${errorCode} - ${errorMessage}`
        );
      }

      // Extraer usuario exitoso
      const success = doc.getElementsByTagName("cas:authenticationSuccess")[0];
      if (!success) {
        throw new Error(
          "No se encontró cas:authenticationSuccess en la respuesta"
        );
      }

      const userElement = success.getElementsByTagName("cas:user")[0];
      if (!userElement) {
        throw new Error("No se encontró cas:user en la respuesta");
      }

      const username = userElement.textContent.trim();
      console.log("👤 Usuario extraído:", username);

      // Extraer atributos adicionales si existen
      const attributes = {};
      const attributesElement =
        success.getElementsByTagName("cas:attributes")[0];
      if (attributesElement) {
        for (let i = 0; i < attributesElement.childNodes.length; i++) {
          const node = attributesElement.childNodes[i];
          if (node.nodeType === 1) {
            attributes[node.localName] = node.textContent;
          }
        }
      }

      console.log("📋 Atributos extraídos:", attributes);

      // Crear objeto usuario
      const user = {
        id: username,
        username: username,
        email:
          attributes.mail || attributes.email || `${username}@espol.edu.ec`,
        displayName:
          attributes.displayName ||
          attributes.cn ||
          attributes.nombre ||
          username,
        attributes: attributes,
        authenticatedAt: new Date().toISOString(),
        source: "CAS-ESPOL",
      };

      return user;
    } catch (error) {
      console.error("❌ Error en validación de ticket:", error);
      throw error;
    }
  }
}

// 3) Configurar estrategia
const CAS_CONFIG = {
  casURL: "https://auth.espol.edu.ec",
  serviceURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
  version: "CAS2.0",
};

console.log("🔧 Configuración CAS ESPOL:", CAS_CONFIG);

passport.use(
  new EspolCasStrategy(CAS_CONFIG, function (profile, done) {
    console.log("🎯 === VERIFICACIÓN CAS ===");
    console.log("Perfil recibido:", profile);

    try {
      console.log("✅ Usuario procesado correctamente");
      return done(null, profile);
    } catch (err) {
      console.error("❌ Error procesando usuario:", err);
      return done(err, null);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("💾 Serializando usuario:", {
    id: user.id,
    username: user.username,
  });
  const serialized = {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    authenticatedAt: user.authenticatedAt,
    source: user.source,
    attributes: user.attributes,
  };
  done(null, serialized);
});

passport.deserializeUser((user, done) => {
  console.log("🔄 Deserializando usuario:", {
    id: user.id,
    username: user.username,
  });
  done(null, user);
});

// Middleware para verificar autenticación - PROTEGE TODAS LAS RUTAS API
export const requireAuth = (req, res, next) => {
  console.log("🔒 Verificando autenticación:", {
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    hasUser: !!req.user,
  });

  const isAuth = req.isAuthenticated && req.isAuthenticated();
  if (isAuth && req.user) {
    console.log("✅ Usuario autenticado:", req.user.username);
    return next();
  }

  console.log("❌ Usuario no autenticado");
  return res.status(401).json({
    error: "Acceso denegado",
    message: "Debes autenticarte con CAS para acceder",
    loginUrl: "/auth/cas/login",
    timestamp: new Date().toISOString(),
  });
};

export default passport;