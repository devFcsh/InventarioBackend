// routes/authRoutes.js
import { Router } from 'express';
import passport from '../middlewares/casAuth.js';

const router = Router();

// CRITICAL FIX: Simplified login route that preserves session
router.get('/cas/login', (req, res, next) => {
  console.log('🚀 === INICIANDO LOGIN CAS ===');
  console.log('Service URL:', `${process.env.BACKEND_URL}/auth/cas/callback`);
  console.log('Session ID antes del login:', req.sessionID);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Referer:', req.headers['referer']);
  console.log('Query params:', req.query);
  
  // Check if already authenticated
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('✅ Usuario ya autenticado:', req.user.username);
    return res.redirect(`${process.env.FRONTEND_URL}/activos`);
  }
  
  console.log('🔄 Iniciando autenticación CAS...');
  
  // CRITICAL FIX: Use passport authenticate without premature redirects
  passport.authenticate('cas', {
    failureRedirect: '/auth/login/failed?error=cas_login_failed',
    session: true
  })(req, res, next);
});

// CRITICAL FIX: Enhanced callback that doesn't create new sessions
router.get('/cas/callback', (req, res, next) => {
  console.log('🔄 === INICIO CALLBACK CAS ===');
  console.log('URL completa:', req.originalUrl);
  console.log('Query params:', req.query);
  console.log('Session ID:', req.sessionID);
  console.log('Headers:', {
    'user-agent': req.headers['user-agent'],
    'referer': req.headers['referer'],
    'cookie': req.headers['cookie'] ? 'presente' : 'ausente'
  });
  
  // Handle retry parameter from CAS (usually means authentication failed)
  if (req.query._cas_retry) {
    console.error('❌ CAS retry detectado - posible fallo de autenticación');
    console.error('Query params recibidos:', req.query);
    return res.redirect(`/auth/login/failed?error=cas_retry&retry=${req.query._cas_retry}`);
  }
  
  // Validate ticket presence
  if (!req.query.ticket) {
    console.error('❌ No se recibió ticket CAS en callback');
    console.error('Query params recibidos:', req.query);
    return res.redirect(`/auth/login/failed?error=no_ticket`);
  }
  
  const ticket = req.query.ticket;
  console.log('🎫 Procesando ticket CAS:', ticket);
  
  // CRITICAL FIX: Use passport authenticate with proper error handling
  passport.authenticate('cas', (err, user, info) => {
    console.log('🔄 === PROCESANDO RESULTADO AUTENTICACIÓN ===');
    
    if (err) {
      console.error('❌ Error en authenticate:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      return res.redirect(`/auth/login/failed?error=callback_error&message=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      console.error('❌ No se pudo obtener usuario de CAS');
      console.error('Info:', info);
      return res.redirect(`/auth/login/failed?error=no_user&info=${encodeURIComponent(JSON.stringify(info))}`);
    }
    
    console.log('👤 Usuario obtenido de CAS:', {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    });
    
    // CRITICAL FIX: Manual login to ensure session is properly established
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Error en req.logIn:', loginErr);
        return res.redirect(`/auth/login/failed?error=login_failed&message=${encodeURIComponent(loginErr.message)}`);
      }
      
      console.log('✅ === AUTENTICACIÓN EXITOSA ===');
      console.log('Usuario logueado:', user.username);
      console.log('Session ID:', req.sessionID);
      console.log('Session passport:', req.session.passport);
      
      // Ensure session is saved before redirect
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('❌ Error guardando sesión:', saveErr);
          return res.redirect(`/auth/login/failed?error=session_save_failed`);
        }
        
        console.log('💾 Sesión guardada correctamente');
        console.log('🎯 Redirigiendo a aplicación:', `${process.env.FRONTEND_URL}/activos`);
        
        // Success redirect
        res.redirect(`${process.env.FRONTEND_URL}/activos`);
      });
    });
  })(req, res, next);
});

// Enhanced debug endpoint
router.get('/cas/debug', (req, res) => {
  console.log('🐛 === DEBUG CAS COMPLETO ===');
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    request: {
      url: req.originalUrl,
      method: req.method,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
        'cookie': req.headers['cookie'] ? 'presente' : 'ausente',
        'host': req.headers['host']
      }
    },
    session: {
      id: req.sessionID,
      exists: !!req.session,
      keys: req.session ? Object.keys(req.session) : [],
      passport: req.session?.passport || null,
      cookie: req.session?.cookie || null
    },
    authentication: {
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      hasUser: !!req.user,
      user: req.user || null
    },
    configuration: {
      casURL: 'https://auth.espol.edu.ec',
      backendURL: process.env.BACKEND_URL,
      frontendURL: process.env.FRONTEND_URL,
      callbackURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
      loginURL: `${process.env.BACKEND_URL}/auth/cas/login`
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSessionSecret: !!process.env.SESSION_SECRET
    }
  };
  
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  res.json(debugInfo);
});

// Better error handling for failed logins
router.get('/login/failed', (req, res) => {
  console.log('❌ === AUTENTICACIÓN FALLIDA ===');
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);
  console.log('Referer:', req.headers['referer']);
  console.log('User-Agent:', req.headers['user-agent']);
  
  const errorDetails = {
    error: req.query.error || 'unknown_error',
    message: req.query.message || 'Error de autenticación no especificado',
    vieneDesCAS: req.headers['referer']?.includes('auth.espol.edu.ec') || false,
    hayTicket: !!req.query.ticket,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
    sessionExists: !!req.session,
    retry: req.query.retry || null
  };
  
  console.log('Detalles del error:', errorDetails);
  
  // Clean up failed session
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Error destruyendo sesión fallida:', err);
      } else {
        console.log('🧹 Sesión fallida limpiada');
      }
      
      // Redirect with error info
      const errorQuery = new URLSearchParams({
        error: errorDetails.error,
        message: errorDetails.message,
        timestamp: errorDetails.timestamp
      }).toString();
      
      res.redirect(`${process.env.FRONTEND_URL}/login/failed?${errorQuery}`);
    });
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login/failed?error=${errorDetails.error}`);
  }
});

// Enhanced logout with better CAS logout
router.post('/logout', (req, res) => {
  const casLogoutURL = 'https://auth.espol.edu.ec/cas/logout';
  const serviceURL = encodeURIComponent(process.env.FRONTEND_URL);
  const fullCasLogoutURL = `${casLogoutURL}?service=${serviceURL}`;
  
  console.log('🚪 === INICIANDO LOGOUT ===');
  console.log('Usuario:', req.user?.username);
  console.log('Session ID:', req.sessionID);
  
  if (!req.user) {
    console.log('⚠️ No hay usuario autenticado para logout');
    return res.json({
      success: true,
      message: 'No hay sesión activa',
      casLogoutUrl: fullCasLogoutURL
    });
  }
  
  const username = req.user.username;
  
  req.logout((err) => {
    if (err) {
      console.error('❌ Error en logout:', err);
      return res.status(500).json({ 
        error: 'Error al cerrar sesión',
        details: err.message 
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Error destruyendo sesión:', err);
        return res.status(500).json({ 
          error: 'Error al destruir sesión',
          details: err.message 
        });
      }
      
      console.log('✅ Logout exitoso para usuario:', username);
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        casLogoutUrl: fullCasLogoutURL,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Status endpoint
router.get('/status', (req, res) => {
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log(`📊 === ESTADO DE AUTENTICACIÓN ===`);
  console.log(`Estado: ${isAuth}`);
  console.log(`Session ID: ${req.sessionID}`);
  
  if (isAuth && req.user) {
    console.log(`Usuario: ${req.user.username}`);
  }
  
  res.json({
    authenticated: isAuth,
    sessionId: req.sessionID,
    user: isAuth && req.user ? {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      authenticatedAt: req.user.authenticatedAt
    } : null,
    timestamp: new Date().toISOString()
  });
});

// User endpoint
router.get('/user', (req, res) => {
  console.log(`🔍 === VERIFICANDO USUARIO ===`);
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Autenticado: ${req.isAuthenticated && req.isAuthenticated()}`);
  
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('✅ Usuario autenticado:', req.user.username);
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        authenticatedAt: req.user.authenticatedAt
      },
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('❌ No hay usuario autenticado');
    res.status(401).json({ 
      authenticated: false,
      error: 'No hay usuario autenticado',
      loginUrl: '/auth/cas/login',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 === TEST DE CONFIGURACIÓN CAS ===');
  
  res.json({
    message: 'Rutas de autenticación CAS funcionando',
    timestamp: new Date().toISOString(),
    config: {
      casURL: 'https://auth.espol.edu.ec',
      backendURL: process.env.BACKEND_URL,
      frontendURL: process.env.FRONTEND_URL,
      callbackURL: `${process.env.BACKEND_URL}/auth/cas/callback`
    },
    session: {
      id: req.sessionID,
      authenticated: req.isAuthenticated && req.isAuthenticated(),
      user: req.user?.username || null
    },
    endpoints: [
      '/auth/cas/login',
      '/auth/cas/callback', 
      '/auth/status',
      '/auth/user',
      '/auth/logout',
      '/auth/cas/debug',
      '/auth/test'
    ]
  });
});

export default router;