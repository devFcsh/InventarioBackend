// app.js
import express from 'express';
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

console.log('🚀 === INICIANDO SERVIDOR CAS ESPOL ===');
console.log('Backend URL:', process.env.BACKEND_URL);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Node ENV:', process.env.NODE_ENV);

// --------------------------------------------------
// 1) TRUST PROXY (importante para HTTPS detrás de proxy)
// --------------------------------------------------
app.set('trust proxy', 1);

// --------------------------------------------------
// 2) CORS - Configuración específica para CAS
// --------------------------------------------------
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://auth.espol.edu.ec', // CAS server
      'https://www.espol.edu.ec',   // ESPOL main site
      'https://content-comfort-production.up.railway.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// --------------------------------------------------
// 3) MIDDLEWARE DE PARSING
// --------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// --------------------------------------------------
// 4) SESIÓN (DEBE IR ANTES DE PASSPORT)
// --------------------------------------------------
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl} - Session: ${req.sessionID || 'none'}`);
  next();
});

app.use(sessionMiddleware);

// --------------------------------------------------
// 5) PASSPORT INICIALIZACIÓN
// --------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

// Middleware para logging de autenticación
app.use((req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log(`👤 Usuario autenticado: ${req.user?.username} (${req.sessionID})`);
  }
  next();
});

// --------------------------------------------------
// 6) RUTAS DE AUTENTICACIÓN (PÚBLICAS)
// --------------------------------------------------
app.use('/auth', authRoutes);

// --------------------------------------------------
// 7) RUTAS API PROTEGIDAS
// --------------------------------------------------
app.use('/api', requireAuth, routes);

// --------------------------------------------------
// 8) ARCHIVOS ESTÁTICOS
// --------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------
// 9) RUTA DE SALUD DEL SERVIDOR
// --------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cas: {
      server: 'https://auth.espol.edu.ec',
      callback: `${process.env.BACKEND_URL}/auth/cas/callback`,
      frontend: process.env.FRONTEND_URL
    }
  });
});

// --------------------------------------------------
// 10) CAPTURAR 404
// --------------------------------------------------
app.use((req, res, next) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------
// 11) MANEJADOR DE ERRORES GLOBAL
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error('💥 === ERROR GLOBAL ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Session ID:', req.sessionID);
  console.error('User:', req.user?.username || 'no autenticado');

  // En producción, no exponer detalles del error
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { 
      stack: err.stack,
      details: err
    })
  });
});

export default app;
