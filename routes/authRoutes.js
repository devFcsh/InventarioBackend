// 3. Rutas de autenticación - routes/authRoutes.js
import { Router } from 'express';
import passport from '../middlewares/casAuth.js';

const router = Router();

// Ruta para iniciar login con CAS
router.get('/cas/login', (req, res, next) => {
  console.log('Iniciando proceso de login CAS...');
  passport.authenticate('cas')(req, res, next);
});

// Callback después del login CAS
router.get('/cas/callback', 
  passport.authenticate('cas', { 
    failureRedirect: '/auth/login/failed' 
  }),
  (req, res) => {
    console.log('Login exitoso para usuario:', req.user);
    res.json({
      success: true,
      message: 'Autenticación exitosa',
      user: req.user,
      sessionId: req.sessionID
    });
  }
);

// Ruta de error de login
router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: 'Autenticación fallida',
    message: 'No se pudo autenticar con CAS'
  });
});

// Ruta para logout
router.post('/logout', (req, res) => {
  const casLogoutURL = 'https://auth.espol.edu.ec/cas/logout';
  
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Error al cerrar sesión',
        details: err.message 
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Error al destruir sesión',
          details: err.message 
        });
      }
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        casLogoutUrl: casLogoutURL
      });
    });
  });
});

// Ruta para obtener información del usuario actual
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user,
      sessionId: req.sessionID,
      sessionData: req.session
    });
  } else {
    res.status(401).json({ 
      authenticated: false,
      error: 'No hay usuario autenticado',
      loginUrl: '/auth/cas/login'
    });
  }
});

// Ruta para verificar estado de autenticación
router.get('/status', (req, res) => {
  const isAuth = req.isAuthenticated();
  res.json({
    authenticated: isAuth,
    sessionId: req.sessionID,
    user: isAuth ? req.user : null,
    sessionExists: !!req.session,
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba protegida
router.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      message: 'Acceso autorizado a ruta protegida',
      user: req.user,
      accessTime: new Date().toISOString()
    });
  } else {
    res.status(401).json({
      error: 'Acceso denegado',
      message: 'Esta ruta requiere autenticación',
      loginUrl: '/auth/cas/login'
    });
  }
});

export default router;
