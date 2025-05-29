import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import cors from 'cors';
import routes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from "path";
import passport, { sessionMiddleware, requireAuth } from './middlewares/casAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express(); 

// CORS más permisivo para desarrollo
app.use(cors({
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(json());

// Configurar sesiones y passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Log de todas las requests para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Authenticated: ${req.isAuthenticated()}`);
  next();
});

// Rutas de autenticación (públicas)
app.use('/auth', authRoutes);

// Rutas de API protegidas - REQUIEREN AUTENTICACIÓN
app.use('/api', requireAuth, routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba básica (NO protegida)
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando',
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user.username : null,
    routes: {
      publicas: {
        status: 'GET /auth/status',
        login: 'GET /auth/cas/login',
        user: 'GET /auth/user',
        logout: 'POST /auth/logout'
      },
      protegidas: {
        discos: 'GET /api/discos',
        marcas: 'GET /api/marcas',
        inventarios: 'GET /api/inventarios',
        test: 'GET /auth/protected'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Rutas públicas adicionales para testing
app.get('/public/test', (req, res) => {
  res.json({
    message: 'Esta es una ruta pública - no requiere autenticación',
    authenticated: req.isAuthenticated(),
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
