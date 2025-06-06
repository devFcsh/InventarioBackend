// middlewares/casAuth.js
import passport from 'passport';
import { Strategy as CasStrategy } from 'passport-cas2';
import session from 'express-session';
import crypto from 'crypto';

// CAS Configuration
const CAS_CONFIG = {
  casURL: 'https://auth.espol.edu.ec',
  serviceURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
  version: 'CAS2.0'
};

console.log('🔧 Configuración CAS:', CAS_CONFIG);

// FIXED: Better CAS Strategy configuration with proper validation URL
passport.use(new CasStrategy({
  casURL: CAS_CONFIG.casURL,
  version: CAS_CONFIG.version,
  serviceURL: CAS_CONFIG.serviceURL,
  validateURL: '/cas/serviceValidate',
  passReqToCallback: true,
  propertyMap: {
    'user': 'user',
    'cn': 'cn', 
    'mail': 'mail',
    'sAMAccountName': 'sAMAccountName',
    'displayName': 'displayName',
    'username': 'username',
    'uid': 'uid'
  }
}, async (req, profile, done) => {
  console.log('🎯 === INICIO CALLBACK CAS STRATEGY ===');
  console.log('📋 Perfil CAS completo:', JSON.stringify(profile, null, 2));
  console.log('🔗 Session ID en strategy:', req.sessionID);
  console.log('🎫 Ticket usado:', req.query?.ticket);
  
  try {
    const userId = profile.user || profile.username || profile.id || profile.uid || profile.sAMAccountName;
    
    if (!profile || !userId) {
      console.error('❌ Perfil CAS inválido:', {
        profile: profile,
        hasUser: !!profile?.user,
        hasUsername: !!profile?.username,
        hasId: !!profile?.id,
        hasUid: !!profile?.uid,
        hasSAMAccountName: !!profile?.sAMAccountName
      });
      return done(new Error('Perfil CAS inválido - no se encontró identificador de usuario'), null);
    }

    const user = {
      id: userId,
      username: userId,
      email: profile.attributes?.mail || profile.mail || profile.attributes?.email || `${userId}@espol.edu.ec`,
      displayName: profile.attributes?.displayName || profile.displayName || profile.attributes?.cn || profile.cn || userId,
      attributes: profile.attributes || {},
      authenticatedAt: new Date().toISOString(),
      sessionId: req.sessionID,
      casProfile: profile,
      source: 'CAS-ESPOL'
    };
    
    console.log('👤 Usuario procesado exitosamente:', {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      sessionId: user.sessionId
    });
    
    console.log('✅ === FIN CALLBACK CAS STRATEGY - ÉXITO ===');
    return done(null, user);
    
  } catch (error) {
    console.error('❌ === ERROR EN CALLBACK CAS STRATEGY ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Profile received:', profile);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  console.log('💾 Serializando usuario:', {
    id: user.id,
    username: user.username,
    sessionId: user.sessionId
  });
  
  const serializedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    authenticatedAt: user.authenticatedAt,
    source: user.source
  };
  
  done(null, serializedUser);
});

passport.deserializeUser((user, done) => {
  console.log('🔄 Deserializando usuario:', {
    id: user.id,
    username: user.username
  });
  done(null, user);
});

// CRITICAL FIX: Session configuration to prevent regeneration
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'clave-secreta-cas-espol-2024-ultra-segura-fixed',
  resave: false,
  saveUninitialized: false,
  rolling: false, // CRITICAL: Don't renew session on every request
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax',
    domain: undefined,
    path: '/'
  },
  name: 'cas.session.id',
  // CRITICAL FIX: Only generate new ID when there's no existing session
  genid: (req) => {
    // If session already exists, keep it
    if (req.sessionID) {
      console.log('🔄 Reutilizando session ID existente:', req.sessionID);
      return req.sessionID;
    }
    
    const id = crypto.randomBytes(16).toString('hex');
    console.log('🆔 Generando nueva session ID:', id);
    return id;
  }
});

export const requireAuth = (req, res, next) => {
  console.log(`🔒 === VERIFICACIÓN DE AUTENTICACIÓN ===`);
  console.log(`   - Ruta: ${req.method} ${req.path}`);
  console.log(`   - Session ID: ${req.sessionID}`);
  
  const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
  const hasUser = !!req.user;
  
  console.log(`   - isAuthenticated(): ${isAuthenticated}`);
  console.log(`   - hasUser: ${hasUser}`);
  
  if (hasUser) {
    console.log(`   - Usuario: ${req.user.username} (${req.user.authenticatedAt})`);
  }
  
  if (isAuthenticated && hasUser) {
    console.log(`✅ Acceso autorizado para: ${req.user.username}`);
    return next();
  }
  
  console.log(`❌ Acceso denegado - Usuario no autenticado`);
  console.log(`   - Session:`, req.session ? {
    id: req.session.id,
    passport: !!req.session.passport,
    keys: Object.keys(req.session)
  } : 'No session');
  
  res.status(401).json({ 
    error: 'Acceso denegado',
    message: 'Debes autenticarte con CAS para acceder a esta ruta',
    loginUrl: '/auth/cas/login',
    timestamp: new Date().toISOString()
  });
};

export default passport;