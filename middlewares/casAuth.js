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
  rolling: true, // Cambiar a true para renovar sesión en cada request
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  name: 'cas.session.id',
  genid: () => {
    return crypto.randomBytes(16).toString('hex');
  }
});

// 2) Configuración de la estrategia CAS - CORREGIDA
const CAS_CONFIG = {
  casURL: 'https://auth.espol.edu.ec',
  serviceURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
  version: 'CAS2.0',
  validateURL: '/serviceValidate', // Cambiar de /cas/serviceValidate a /serviceValidate
  loginURL: '/login', // Especificar explícitamente
  logoutURL: '/logout'
};

console.log('🔧 Configuración CAS:', CAS_CONFIG);

// DEBUGGING: Verificar URLs
console.log('🔍 URLs de verificación:');
console.log('- Login completo:', `${CAS_CONFIG.casURL}${CAS_CONFIG.loginURL}`);
console.log('- Validate completo:', `${CAS_CONFIG.casURL}${CAS_CONFIG.validateURL}`);
console.log('- Service URL:', CAS_CONFIG.serviceURL);

passport.use(new CasStrategy({
  casURL: CAS_CONFIG.casURL,
  version: CAS_CONFIG.version,
  serviceURL: CAS_CONFIG.serviceURL,
  validateURL: CAS_CONFIG.validateURL,
  loginURL: CAS_CONFIG.loginURL, // Agregar loginURL explícito
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
  console.log('🎯 === CALLBACK CAS STRATEGY ===');
  console.log('Tipo de profile:', typeof profile);
  console.log('Profile completo:', JSON.stringify(profile, null, 2));

  if (typeof done !== 'function') {
    console.error('❌ done no es función');
    return;
  }

  try {
    let userId = null;
    let userAttributes = {};

    // Si profile es string (usuario simple)
    if (typeof profile === 'string') {
      userId = profile;
      console.log('📝 Profile es string:', userId);
    } 
    // Si profile es objeto
    else if (typeof profile === 'object' && profile !== null) {
      console.log('📝 Profile es objeto, keys:', Object.keys(profile));
      
      // Intentar extraer usuario de diferentes propiedades
      userId = profile.user ||
               profile.username ||
               profile.id ||
               profile.uid ||
               profile.sAMAccountName ||
               profile.cn;

      // Si hay attributes, también buscar ahí
      if (profile.attributes) {
        console.log('📝 Attributes encontrados:', Object.keys(profile.attributes));
        userId = userId ||
                 profile.attributes.sAMAccountName ||
                 profile.attributes.uid ||
                 profile.attributes.username ||
                 profile.attributes.user;
        
        userAttributes = profile.attributes;
      }
    }

    console.log('🔍 UserID extraído:', userId);
    console.log('🔍 Attributes:', userAttributes);

    if (!userId) {
      console.error('❌ No se pudo extraer ID de usuario del profile');
      console.error('❌ Profile completo para debug:', profile);
      return done(new Error('No se pudo obtener ID de usuario del perfil CAS'), null);
    }

    const user = {
      id: userId,
      username: userId,
      email: userAttributes.mail || 
             userAttributes.email || 
             profile.mail || 
             profile.email || 
             `${userId}@espol.edu.ec`,
      displayName: userAttributes.displayName ||
                   userAttributes.cn ||
                   userAttributes.name ||
                   profile.displayName ||
                   profile.cn ||
                   profile.name ||
                   userId,
      attributes: userAttributes,
      authenticatedAt: new Date().toISOString(),
      casProfile: profile,
      source: 'CAS-ESPOL'
    };

    console.log('👤 Usuario procesado:', {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      hasAttributes: Object.keys(user.attributes).length > 0
    });
    
    console.log('✅ CALLBACK CAS STRATEGY - ÉXITO');
    return done(null, user);

  } catch (err) {
    console.error('❌ Error en CALLBACK CAS STRATEGY:', err);
    console.error('❌ Stack:', err.stack);
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
  console.log('🔒 === VERIFICANDO AUTENTICACIÓN ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log('isAuthenticated():', isAuth);
  
  if (isAuth && req.user) {
    console.log('✅ Usuario autenticado:', req.user.username);
    return next();
  }
  
  console.log('❌ Usuario NO autenticado');
  return res.status(401).json({
    error: 'Acceso denegado',
    message: 'Debes autenticarte con CAS para acceder',
    loginUrl: '/auth/cas/login',
    sessionId: req.sessionID,
    timestamp: new Date().toISOString()
  });
};

export default passport;
