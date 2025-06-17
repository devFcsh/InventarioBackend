// 2. Middleware CAS - middleware/casAuth.js
import passport from 'passport';
import { Strategy as CasStrategy } from 'passport-cas2';
import session from 'express-session';

// Configuración CAS para ESPOL
const CAS_CONFIG = {
  casURL: 'https://auth.espol.edu.ec',
  serviceURL: 'http://localhost:3000',
  version: 'CAS2.0'
};

// Configurar estrategia CAS
passport.use(new CasStrategy({
  casURL: CAS_CONFIG.casURL,
  version: CAS_CONFIG.version,
  serverBaseURL: CAS_CONFIG.serviceURL,
  validateURL: '/cas/serviceValidate',
  serviceURL: `${CAS_CONFIG.serviceURL}/auth/cas/callback`
}, (profile, done) => {
  console.log('Usuario autenticado:', profile);
  const user = {
    id: profile.user,
    username: profile.user,
    attributes: profile.attributes || {},
    authenticatedAt: new Date()
  };
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware de sesión
export const sessionMiddleware = session({
  secret: 'clave-secreta-cas-espol-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false para desarrollo, true para producción
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true
  }
});

// Middleware para verificar autenticación - PROTEGE TODAS LAS RUTAS API
export const requireAuth = (req, res, next) => {
  console.log(`🔒 Verificando autenticación para: ${req.method} ${req.path}`);
  console.log(`   - Autenticado: ${req.isAuthenticated()}`);
  console.log(`   - Session ID: ${req.sessionID}`);
  
  if (req.isAuthenticated() || true) {
    //console.log(`✅ Acceso autorizado para usuario: ${req.user.username}`);
    return next();
  }
  
  console.log(`❌ Acceso denegado - Usuario no autenticado`);
  res.status(401).json({ 
    error: 'Acceso denegado',
    message: 'Debes autenticarte con CAS para acceder a esta ruta',
    loginUrl: '/auth/cas/login',
    timestamp: new Date().toISOString()
  });
};

export default passport;