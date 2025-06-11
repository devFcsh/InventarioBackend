// routes/authRoutes.js
import { Router } from 'express';
import passport from '../middlewares/casAuth.js';

const router = Router();

// GET /auth/cas/login
router.get('/cas/login', (req, res, next) => {
  console.log('🚀 === INICIANDO LOGIN CAS ===');
  console.log('Service URL:', `${process.env.BACKEND_URL}/auth/cas/callback`);
  console.log('Session ID antes de login:', req.sessionID);
  console.log('Query params:', req.query);

  // Si llega ticket en query, saltar a callback
  if (req.query.ticket) {
    console.log('🎫 Ticket en /cas/login → redirigiendo a callback');
    return res.redirect(`/auth/cas/callback?ticket=${req.query.ticket}`);
  }

  // Si ya está autenticado
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('✅ Ya autenticado:', req.user.username);
    return res.redirect(`${process.env.FRONTEND_URL}/activos`);
  }

  console.log('🔄 passport.authenticate("cas")');
  passport.authenticate('cas', {
    failureRedirect: '/auth/login/failed?error=cas_login_failed',
    session: true
  })(req, res, next);
});

// GET /auth/cas/callback
router.get('/cas/callback', (req, res, next) => {
  console.log('🔄 === CALLBACK CAS ===');
  console.log('URL:', req.originalUrl);
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);

  // Si CAS devolvió retry
  if (req.query._cas_retry) {
    console.error('❌ _cas_retry detectado');
    return res.redirect(`/auth/login/failed?error=cas_retry&retry=${req.query._cas_retry}`);
  }

  // Si no llegó ticket
  if (!req.query.ticket) {
    console.error('❌ Falta ticket en callback');
    return res.redirect(`/auth/login/failed?error=no_ticket`);
  }

  console.log('🎫 Procesando ticket CAS:', req.query.ticket);
  passport.authenticate('cas', (err, user, info) => {
    console.log('🔄 === RESULTADO AUTENTICACIÓN ===');
    console.log('Error:', err ? err.message : 'ninguno');
    console.log('User:', user ? user.username : 'ninguno');
    console.log('Info:', info);

    if (err) {
      console.error('❌ Error en authenticate:', err);
      return res.redirect(`/auth/login/failed?error=callback_error&message=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      console.error('❌ No se obtuvo usuario de CAS');
      return res.redirect(`/auth/login/failed?error=no_user`);
    }

    console.log('👤 Usuario obtenido:', { id: user.id, username: user.username });
    req.logIn(user, loginErr => {
      if (loginErr) {
        console.error('❌ Error en req.logIn:', loginErr);
        return res.redirect(`/auth/login/failed?error=login_failed&message=${encodeURIComponent(loginErr.message)}`);
      }

      console.log('✅ Autenticación exitosa:', user.username);
      // Guardar sesión antes de redirect
      req.session.save(saveErr => {
        if (saveErr) {
          console.error('❌ Error guardando sesión:', saveErr);
          return res.redirect(`/auth/login/failed?error=session_save_failed`);
        }
        console.log('💾 Sesión guardada');
        return res.redirect(`${process.env.FRONTEND_URL}/activos`);
      });
    });
  })(req, res, next);
});

// GET /auth/login/failed
router.get('/login/failed', (req, res) => {
  console.log('❌ === AUTENTICACIÓN FALLIDA ===');
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);

  const errorDetails = {
    error: req.query.error || 'unknown_error',
    message: req.query.message || 'Error de autenticación no especificado',
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID
  };
  console.log('Detalles del error:', errorDetails);

  // Destruir sesión fallida
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('❌ Error destruyendo sesión fallida:', err);
      } else {
        console.log('🧹 Sesión fallida destruida');
      }

      const errorQuery = new URLSearchParams({
        error: errorDetails.error,
        message: errorDetails.message,
        timestamp: errorDetails.timestamp
      }).toString();

      return res.redirect(`${process.env.FRONTEND_URL}/login/failed?${errorQuery}`);
    });
  } else {
    return res.redirect(`${process.env.FRONTEND_URL}/login/failed?error=${errorDetails.error}`);
  }
});

// GET /auth/status
router.get('/status', (req, res) => {
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log('📊 === ESTADO DE AUTENTICACIÓN ===', { isAuth, sessionID: req.sessionID });
  if (isAuth && req.user) {
    return res.json({
      authenticated: true,
      sessionId: req.sessionID,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        authenticatedAt: req.user.authenticatedAt
      },
      timestamp: new Date().toISOString()
    });
  }
  return res.json({
    authenticated: false,
    sessionId: req.sessionID,
    user: null,
    timestamp: new Date().toISOString()
  });
});

// GET /auth/user
router.get('/user', (req, res) => {
  console.log('🔍 === VERIFICANDO USUARIO ===', { sessionID: req.sessionID });
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  if (isAuth && req.user) {
    return res.json({
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
  }
  return res.status(401).json({
    authenticated: false,
    error: 'No hay usuario autenticado',
    loginUrl: '/auth/cas/login',
    timestamp: new Date().toISOString()
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const casLogoutURL = 'https://auth.espol.edu.ec/cas/logout';
  const serviceURL = encodeURIComponent(process.env.FRONTEND_URL);
  const fullCasLogoutURL = `${casLogoutURL}?service=${serviceURL}`;

  console.log('🚪 === LOGOUT ===', { user: req.user?.username, sessionID: req.sessionID });
  if (!req.user) {
    return res.json({
      success: true,
      message: 'No hay sesión activa',
      casLogoutUrl: fullCasLogoutURL
    });
  }

  const username = req.user.username;
  req.logout(err => {
    if (err) {
      console.error('❌ Error en logout:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión', details: err.message });
    }
    req.session.destroy(destroyErr => {
      if (destroyErr) {
        console.error('❌ Error destruyendo sesión:', destroyErr);
        return res.status(500).json({ error: 'Error al destruir sesión', details: destroyErr.message });
      }
      console.log('✅ Logout exitoso para:', username);
      return res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        casLogoutUrl: fullCasLogoutURL,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// GET /auth/test
router.get('/test', (req, res) => {
  console.log('🧪 === TEST CAS ===');
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  return res.json({
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
      authenticated: isAuth,
      user: req.user?.username || null
    },
    endpoints: [
      '/auth/cas/login',
      '/auth/cas/callback',
      '/auth/status',
      '/auth/user',
      '/auth/logout',
      '/auth/test'
    ]
  });
});

export default router;
