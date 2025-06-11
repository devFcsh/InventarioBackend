// routes/authRoutes.js
import { Router } from 'express';
import passport from '../middlewares/casAuth.js';

const router = Router();

// GET /auth/cas/login
router.get('/cas/login', (req, res, next) => {
  console.log('🚀 === INICIANDO LOGIN CAS ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Service URL:', `${process.env.BACKEND_URL}/auth/cas/callback`);
  console.log('Session ID antes de login:', req.sessionID);
  console.log('Query params:', req.query);
  console.log('Headers importantes:', {
    'user-agent': req.get('User-Agent'),
    'referer': req.get('Referer'),
    'host': req.get('Host')
  });

  // Si llega ticket en query, redirigir a callback
  if (req.query.ticket) {
    console.log('🎫 Ticket detectado en /cas/login, redirigiendo a callback');
    return res.redirect(`/auth/cas/callback?ticket=${req.query.ticket}${req.query.service ? '&service=' + encodeURIComponent(req.query.service) : ''}`);
  }

  // Si ya está autenticado
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('✅ Usuario ya autenticado:', req.user.username);
    return res.redirect(`${process.env.FRONTEND_URL}/activos`);
  }

  console.log('🔄 Iniciando autenticación CAS con passport...');
  
  // Configurar opciones de autenticación
  const authOptions = {
    failureRedirect: '/auth/login/failed?error=cas_login_failed',
    session: true
  };

  console.log('Auth options:', authOptions);
  
  passport.authenticate('cas', authOptions)(req, res, next);
});

// GET /auth/cas/callback
router.get('/cas/callback', (req, res, next) => {
  console.log('🔄 === CALLBACK CAS ===');
  console.log('URL completa:', req.originalUrl);
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);
  console.log('Headers importantes:', {
    'user-agent': req.get('User-Agent'),
    'referer': req.get('Referer'),
    'host': req.get('Host')
  });

  // Verificar si hay parámetros de error de CAS
  if (req.query._cas_retry) {
    console.error('❌ _cas_retry detectado, posible error de CAS');
    return res.redirect(`/auth/login/failed?error=cas_retry&retry=${req.query._cas_retry}`);
  }

  if (req.query.error) {
    console.error('❌ Error en query params:', req.query.error);
    return res.redirect(`/auth/login/failed?error=cas_error&message=${encodeURIComponent(req.query.error)}`);
  }

  // Verificar ticket
  if (!req.query.ticket) {
    console.error('❌ No se recibió ticket en el callback');
    return res.redirect(`/auth/login/failed?error=no_ticket`);
  }

  console.log('🎫 Procesando ticket CAS:', req.query.ticket.substring(0, 20) + '...');
  
  // Procesar autenticación con callback personalizado
  passport.authenticate('cas', (err, user, info) => {
    console.log('🔄 === RESULTADO DE AUTENTICACIÓN CAS ===');
    console.log('Error:', err ? err.message : 'ninguno');
    console.log('User recibido:', user ? { 
      id: user.id, 
      username: user.username,
      email: user.email,
      displayName: user.displayName 
    } : 'ninguno');
    console.log('Info adicional:', info);

    // Manejar errores
    if (err) {
      console.error('❌ Error durante autenticación CAS:', err);
      console.error('❌ Stack del error:', err.stack);
      return res.redirect(`/auth/login/failed?error=auth_error&message=${encodeURIComponent(err.message)}`);
    }

    // Verificar que se obtuvo usuario
    if (!user) {
      console.error('❌ No se obtuvo usuario válido de CAS');
      console.error('❌ Info recibida:', info);
      return res.redirect(`/auth/login/failed?error=no_user&info=${encodeURIComponent(JSON.stringify(info))}`);
    }

    console.log('👤 Usuario válido obtenido:', { 
      id: user.id, 
      username: user.username,
      source: user.source 
    });

    // Hacer login del usuario en la sesión
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Error al hacer login en sesión:', loginErr);
        console.error('❌ Stack del error de login:', loginErr.stack);
        return res.redirect(`/auth/login/failed?error=session_login_failed&message=${encodeURIComponent(loginErr.message)}`);
      }

      console.log('✅ Usuario logueado exitosamente en sesión');
      
      // Guardar sesión explícitamente
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('❌ Error al guardar sesión:', saveErr);
          return res.redirect(`/auth/login/failed?error=session_save_failed&message=${encodeURIComponent(saveErr.message)}`);
        }
        
        console.log('💾 Sesión guardada correctamente');
        console.log('🎉 === AUTENTICACIÓN COMPLETADA EXITOSAMENTE ===');
        console.log('Usuario final:', {
          id: req.user.id,
          username: req.user.username,
          sessionId: req.sessionID
        });
        
        // Redirigir al frontend
        const redirectUrl = `${process.env.FRONTEND_URL}/activos`;
        console.log('🔄 Redirigiendo a:', redirectUrl);
        return res.redirect(redirectUrl);
      });
    });
  })(req, res, next);
});

// GET /auth/login/failed
router.get('/login/failed', (req, res) => {
  console.log('❌ === AUTENTICACIÓN FALLIDA ===');
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);
  console.log('User actual:', req.user);

  const errorDetails = {
    error: req.query.error || 'unknown_error',
    message: req.query.message || 'Error de autenticación no especificado',
    info: req.query.info || null,
    retry: req.query.retry || null,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID
  };
  
  console.log('📋 Detalles del error:', errorDetails);

  // Limpiar sesión fallida
  if (req.session) {
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('❌ Error al destruir sesión fallida:', destroyErr);
      } else {
        console.log('🧹 Sesión fallida destruida correctamente');
      }

      // Preparar parámetros para el frontend
      const errorQuery = new URLSearchParams({
        error: errorDetails.error,
        message: errorDetails.message,
        timestamp: errorDetails.timestamp
      });

      if (errorDetails.info) {
        errorQuery.append('info', errorDetails.info);
      }
      if (errorDetails.retry) {
        errorQuery.append('retry', errorDetails.retry);
      }

      const redirectUrl = `${process.env.FRONTEND_URL}/login/failed?${errorQuery.toString()}`;
      console.log('🔄 Redirigiendo a página de error:', redirectUrl);
      return res.redirect(redirectUrl);
    });
  } else {
    const redirectUrl = `${process.env.FRONTEND_URL}/login/failed?error=${errorDetails.error}&message=${encodeURIComponent(errorDetails.message)}`;
    return res.redirect(redirectUrl);
  }
});

// GET /auth/status
router.get('/status', (req, res) => {
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log('📊 === VERIFICACIÓN DE ESTADO ===');
  console.log('Session ID:', req.sessionID);
  console.log('isAuthenticated():', isAuth);
  console.log('User present:', !!req.user);
  console.log('User data:', req.user ? {
    id: req.user.id,
    username: req.user.username,
    authenticatedAt: req.user.authenticatedAt
  } : null);

  if (isAuth && req.user) {
    return res.json({
      authenticated: true,
      sessionId: req.sessionID,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        authenticatedAt: req.user.authenticatedAt,
        source: req.user.source
      },
      timestamp: new Date().toISOString()
    });
  }

  return res.json({
    authenticated: false,
    sessionId: req.sessionID,
    user: null,
    loginUrl: '/auth/cas/login',
    timestamp: new Date().toISOString()
  });
});

// GET /auth/user
router.get('/user', (req, res) => {
  console.log('🔍 === OBTENER USUARIO ACTUAL ===');
  console.log('Session ID:', req.sessionID);
  
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log('isAuthenticated():', isAuth);
  console.log('User present:', !!req.user);

  if (isAuth && req.user) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        authenticatedAt: req.user.authenticatedAt,
        source: req.user.source
      },
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(401).json({
    authenticated: false,
    error: 'No hay usuario autenticado',
    loginUrl: '/auth/cas/login',
    sessionId: req.sessionID,
    timestamp: new Date().toISOString()
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const casLogoutURL = 'https://auth.espol.edu.ec/logout';
  const serviceURL = encodeURIComponent(process.env.FRONTEND_URL);
  const fullCasLogoutURL = `${casLogoutURL}?service=${serviceURL}`;

  console.log('🚪 === INICIANDO LOGOUT ===');
  console.log('Usuario actual:', req.user?.username || 'ninguno');
  console.log('Session ID:', req.sessionID);
  console.log('CAS Logout URL:', fullCasLogoutURL);

  if (!req.user) {
    console.log('ℹ️ No hay sesión activa para cerrar');
    return res.json({
      success: true,
      message: 'No hay sesión activa',
      casLogoutUrl: fullCasLogoutURL,
      timestamp: new Date().toISOString()
    });
  }

  const username = req.user.username;
  
  // Cerrar sesión de Passport
  req.logout((logoutErr) => {
    if (logoutErr) {
      console.error('❌ Error en logout de Passport:', logoutErr);
      return res.status(500).json({ 
        error: 'Error al cerrar sesión de Passport', 
        details: logoutErr.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Logout de Passport completado');
    
    // Destruir sesión
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('❌ Error al destruir sesión:', destroyErr);
        return res.status(500).json({ 
          error: 'Error al destruir sesión', 
          details: destroyErr.message,
          timestamp: new Date().toISOString()
        });
      }

      console.log('✅ Sesión destruida correctamente');
      console.log('🎉 Logout completado exitosamente para:', username);
      
      return res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        user: username,
        casLogoutUrl: fullCasLogoutURL,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// GET /auth/test - Endpoint de diagnóstico
router.get('/test', (req, res) => {
  console.log('🧪 === TEST DE CONFIGURACIÓN CAS ===');
  
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  const diagnostics = {
    message: 'Endpoint de diagnóstico CAS',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      backendURL: process.env.BACKEND_URL,
      frontendURL: process.env.FRONTEND_URL,
      sessionSecret: process.env.SESSION_SECRET ? '***configurado***' : '❌ NO CONFIGURADO'
    },
    casConfig: {
      casURL: 'https://auth.espol.edu.ec',
      loginURL: 'https://auth.espol.edu.ec/login',
      validateURL: 'https://auth.espol.edu.ec/serviceValidate',
      callbackURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
      logoutURL: 'https://auth.espol.edu.ec/logout'
    },
    session: {
      id: req.sessionID,
      authenticated: isAuth,
      user: req.user ? {
        id: req.user.id,
        username: req.user.username,
        authenticatedAt: req.user.authenticatedAt
      } : null
    },
    endpoints: [
      'GET /auth/cas/login - Iniciar autenticación CAS',
      'GET /auth/cas/callback - Callback de CAS',
      'GET /auth/status - Estado de autenticación',
      'GET /auth/user - Datos del usuario actual',
      'POST /auth/logout - Cerrar sesión',
      'GET /auth/test - Este endpoint de diagnóstico',
      'GET /auth/login/failed - Página de errores'
    ],
    testUrls: {
      statusCheck: `${process.env.BACKEND_URL}/auth/status`,
      userCheck: `${process.env.BACKEND_URL}/auth/user`,
      loginStart: `${process.env.BACKEND_URL}/auth/cas/login`
    }
  };

  console.log('📋 Diagnósticos:', diagnostics);
  return res.json(diagnostics);
});

export default router;
