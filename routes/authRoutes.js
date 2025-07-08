// routes/authRoutes.js
import { Router } from 'express';
import passport from '../middlewares/casAuth.js';
import db from '../models/index.js';
import { QueryTypes } from 'sequelize';

const router = Router();

// GET /auth/cas/login
router.get('/cas/login', (req, res, next) => {
  console.log('🚀 === INICIANDO LOGIN CAS ESPOL ===');
  console.log('Service URL:', `${process.env.BACKEND_URL}/auth/cas/callback`);
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);

  // Verificar si ya está autenticado
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    console.log('✅ Ya autenticado:', req.user.username);
    return res.redirect(`${process.env.FRONTEND_URL}/activos`);
  }

  // Si viene con ticket, procesar directamente
  if (req.query.ticket) {
    console.log('🎫 Ticket recibido en login, procesando...');
    return passport.authenticate('cas', {
      failureRedirect: '/auth/login/failed?error=ticket_validation_failed',
      session: true
    })(req, res, next);
  }

  // Iniciar autenticación CAS
  console.log('🔄 Iniciando autenticación CAS');
  passport.authenticate('cas', {
    failureRedirect: '/auth/login/failed?error=cas_login_failed',
    session: true
  })(req, res, next);
});

// GET /auth/cas/callback
router.get('/cas/callback', (req, res, next) => {
  console.log('🔄 === CALLBACK CAS ESPOL ===');
  console.log('URL completa:', req.originalUrl);
  console.log('Session ID:', req.sessionID);
  console.log('Query params:', req.query);

  // Verificar si CAS devolvió un error
  if (req.query.error) {
    console.error('❌ Error en callback CAS:', req.query.error);
    return res.redirect(`/auth/login/failed?error=cas_error&message=${encodeURIComponent(req.query.error)}`);
  }

  // Verificar si hay ticket
  if (!req.query.ticket) {
    console.error('❌ No se recibió ticket en callback');
    return res.redirect(`/auth/login/failed?error=no_ticket`);
  }

  console.log('🎫 Procesando ticket CAS:', req.query.ticket);
  
  // Procesar autenticación con callback personalizado
  passport.authenticate('cas', (err, user, info) => {
    console.log('🔄 === RESULTADO AUTENTICACIÓN CAS ===');
    console.log('Error:', err ? err.message : 'ninguno');
    console.log('Usuario:', user ? user.username : 'ninguno');
    console.log('Info:', info);

    if (err) {
      console.error('❌ Error en authenticate:', err);
      return res.redirect(`/auth/login/failed?error=authentication_error&message=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      console.error('❌ No se obtuvo usuario válido');
      return res.redirect(`/auth/login/failed?error=no_user&message=No se pudo obtener información del usuario`);
    }

    console.log('👤 Usuario autenticado exitosamente:', {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    });

    // Iniciar sesión del usuario
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Error en req.logIn:', loginErr);
        return res.redirect(`/auth/login/failed?error=login_session_error&message=${encodeURIComponent(loginErr.message)}`);
      }

      console.log('✅ Sesión iniciada correctamente para:', user.username);
      
      // Guardar sesión y redirigir
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('❌ Error guardando sesión:', saveErr);
          return res.redirect(`/auth/login/failed?error=session_save_error`);
        }
        
        console.log('💾 Sesión guardada correctamente');
        console.log('🎉 Autenticación CAS completada exitosamente');
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

  console.log('📝 Detalles del error:', errorDetails);

  // Limpiar sesión fallida
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Error destruyendo sesión fallida:', err);
      } else {
        console.log('🧹 Sesión fallida limpiada');
      }

      // Crear query string para el frontend
      const errorQuery = new URLSearchParams({
        error: errorDetails.error,
        message: errorDetails.message,
        timestamp: errorDetails.timestamp
      }).toString();

      return res.redirect(`${process.env.FRONTEND_URL}/login/failed?${errorQuery}`);
    });
  } else {
    const errorQuery = new URLSearchParams({
      error: errorDetails.error,
      message: errorDetails.message,
      timestamp: errorDetails.timestamp
    }).toString();

    return res.redirect(`${process.env.FRONTEND_URL}/login/failed?${errorQuery}`);
  }
});

router.get('/status', async (req, res) => {
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  console.log('📊 === ESTADO DE AUTENTICACIÓN ===', { 
    isAuth, 
    sessionID: req.sessionID,
    hasUser: !!req.user
  });

  if (isAuth && req.user) {
    try {
      const email = req.user.email;
      const query = `
        SELECT r.nombre AS rol
        FROM usuario_sistema u
        JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.correo = :correo
        LIMIT 1
      `;
      const result = await db.query(query, {
        replacements: { correo: email },
        type: QueryTypes.SELECT,
      });
      const rol = result.length > 0 ? result[0].rol : null;
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
        rol,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error consultando rol:', error);
      return res.status(500).json({
        authenticated: true,
        sessionId: req.sessionID,
        user: req.user,
        rol: null,
        error: "Error consultando rol",
        timestamp: new Date().toISOString()
      });
    }
  }

  return res.json({
    authenticated: false,
    sessionId: req.sessionID,
    user: null,
    rol: null,
    timestamp: new Date().toISOString()
  });
});

// GET /auth/user
router.get('/user', (req, res) => {
  console.log('🔍 === VERIFICANDO USUARIO ===', { 
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });

  const isAuth = req.isAuthenticated && req.isAuthenticated();
  if (isAuth && req.user) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
        authenticatedAt: req.user.authenticatedAt,
        source: req.user.source,
        attributes: req.user.attributes
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
  console.log('🚪 === LOGOUT CAS ESPOL ===', { 
    user: req.user?.username, 
    sessionID: req.sessionID 
  });

  // URL de logout del CAS de ESPOL
  const casLogoutURL = 'https://auth.espol.edu.ec/logout';
  const serviceURL = encodeURIComponent(process.env.FRONTEND_URL);
  const fullCasLogoutURL = `${casLogoutURL}?service=${serviceURL}`;

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
  req.logout((err) => {
    if (err) {
      console.error('❌ Error en logout:', err);
      return res.status(500).json({ 
        error: 'Error al cerrar sesión', 
        details: err.message 
      });
    }

    // Destruir sesión
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('❌ Error destruyendo sesión:', destroyErr);
        return res.status(500).json({ 
          error: 'Error al destruir sesión', 
          details: destroyErr.message 
        });
      }

      console.log('✅ Logout exitoso para usuario:', username);
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
  console.log('🧪 === TEST CAS ESPOL ===');
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  
  return res.json({
    message: 'Rutas de autenticación CAS ESPOL funcionando',
    timestamp: new Date().toISOString(),
    config: {
      casURL: 'https://auth.espol.edu.ec',
      backendURL: process.env.BACKEND_URL,
      frontendURL: process.env.FRONTEND_URL,
      callbackURL: `${process.env.BACKEND_URL}/auth/cas/callback`,
      loginURL: `https://auth.espol.edu.ec/login?service=${encodeURIComponent(process.env.BACKEND_URL + '/auth/cas/callback')}`,
      logoutURL: `https://auth.espol.edu.ec/logout?service=${encodeURIComponent(process.env.FRONTEND_URL)}`
    },
    session: {
      id: req.sessionID,
      authenticated: isAuth,
      user: req.user?.username || null,
      userDetails: req.user || null
    },
    endpoints: [
      'GET /auth/cas/login - Iniciar autenticación CAS',
      'GET /auth/cas/callback - Callback CAS',
      'GET /auth/status - Estado de autenticación',
      'GET /auth/user - Información del usuario',
      'POST /auth/logout - Cerrar sesión',
      'GET /auth/test - Esta prueba'
    ]
  });
});

export default router;