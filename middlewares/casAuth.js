// middlewares/casAuth.js
import passport from 'passport';
import { Strategy as CasStrategy } from 'passport-cas2';
import session from 'express-session';
import crypto from 'crypto';

// 1) Sesión
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'clave-secreta-cas-espol-2024-ultra-segura-fixed',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: true,       // Solo sobre HTTPS
    sameSite: 'none',   // Permite envío cross-site (CAS → backend)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  name: 'cas.session.id',
  genid: () => {
    return crypto.randomBytes(16).toString('hex');
  }
});

// 2) Configuración de la estrategia CAS
const CAS_CONFIG = {
  casURL: 'https://auth.espol.edu.ec',
  serviceURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
  version: 'CAS2.0'
};
console.log('🔧 Configuración CAS:', CAS_CONFIG);

passport.use(new CasStrategy({
  casURL: CAS_CONFIG.casURL,
  version: CAS_CONFIG.version,
  serviceURL: CAS_CONFIG.serviceURL,
  validateURL: '/cas/serviceValidate',
  passReqToCallback: false,
  propertyMap: {
    user: 'user',
    cn: 'cn',
    mail: 'mail',
    sAMAccountName: 'sAMAccountName',
    displayName: 'displayName',
    username: 'username',
    uid: 'uid'
  }
}, function(profile, done) {
  console.log('🎯 === CALLBACK CAS ===');
  console.log('Perfil CAS:', JSON.stringify(profile, null, 2));

  if (typeof done !== 'function') {
    console.error('❌ done no es función');
    return;
  }

  try {
    let userId = null;
    if (typeof profile === 'string') {
      userId = profile;
    } else if (typeof profile === 'object' && profile !== null) {
      userId = profile.user ||
               profile.username ||
               profile.id ||
               profile.uid ||
               profile.sAMAccountName ||
               profile.attributes?.sAMAccountName ||
               profile.attributes?.uid ||
               profile.attributes?.username;
    }

    console.log('UserID extraído:', userId);
    if (!userId) {
      console.error('❌ No se pudo extraer ID de usuario');
      return done(new Error('No se pudo obtener ID de usuario del perfil CAS'), null);
    }

    const user = {
      id: userId,
      username: userId,
      email: (profile?.attributes?.mail) || (profile?.mail) || `${userId}@espol.edu.ec`,
      displayName: (profile?.attributes?.displayName) ||
                   (profile?.displayName) ||
                   (profile?.attributes?.cn) ||
                   (profile?.cn) ||
                   userId,
      attributes: profile?.attributes || {},
      authenticatedAt: new Date().toISOString(),
      casProfile: profile,
      source: 'CAS-ESPOL'
    };

    console.log('👤 Usuario procesado:', {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    });
    console.log('✅ CALLBACK CAS - ÉXITO');
    return done(null, user);

  } catch (err) {
    console.error('❌ Error en CALLBACK CAS:', err);
    return done(err, null);
  }
}));

// 3) Serializar / deserializar
passport.serializeUser((user, done) => {
  console.log('💾 Serializando usuario:', { id: user.id, username: user.username });
  const serialized = {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    authenticatedAt: user.authenticatedAt,
    source: user.source
  };
  done(null, serialized);
});

passport.deserializeUser((user, done) => {
  console.log('🔄 Deserializando usuario:', { id: user.id, username: user.username });
  done(null, user);
});

// 4) Middleware requireAuth
export const requireAuth = (req, res, next) => {
  console.log('🔒 Verificando autenticación:', { sessionID: req.sessionID });
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  if (isAuth && req.user) {
    console.log('✅ Autenticado:', req.user.username);
    return next();
  }
  console.log('❌ No autenticado');
  return res.status(401).json({
    error: 'Acceso denegado',
    message: 'Debes autenticarte con CAS para acceder',
    loginUrl: '/auth/cas/login',
    timestamp: new Date().toISOString()
  });
};

export default passport;
