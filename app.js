// app.js
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

console.log('🚀 Iniciando servidor...');
console.log('Backend URL:', process.env.BACKEND_URL);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// PROBLEMA 6: CORS debe ser más específico y permitir credentials
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://moment-shot-zimbabwe-therapist.trycloudflare.com',
      'http://localhost:5173', // Para desarrollo local
      'https://auth.espol.edu.ec' // Permitir redirects desde CAS
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRÍTICO: Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Para navegadores legacy
}));

// NUEVO: Middleware para manejar preflight requests
app.options('*', cors());

// Body parser
app.use(json());
app.use(express.urlencoded({ extended: true }));

// PROBLEMA 7: El orden de middlewares es CRÍTICO
// 1. Primero sesiones
app.use(sessionMiddleware);

// 2. Después passport
app.use(passport.initialize());
app.use(passport.session());

// FIXED: Middleware de debug mejorado con verificación de isAuthenticated
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Session: ${req.sessionID}`);
  
  // FIXED: Verificar que req.isAuthenticated existe antes de llamarlo
  const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
  console.log(`   - Auth: ${isAuth}`);
  
  // Log adicional para rutas de auth
  if (req.path.startsWith('/auth')) {
    console.log(`   🔍 Auth route - Query:`, req.query);
    console.log(`   🔍 Auth route - Headers:`, {
      'user-agent': req.headers['user-agent']?.substring(0, 50),
      'referer': req.headers['referer'],
      'cookie': req.headers['cookie'] ? 'presente' : 'ausente'
    });
  }
  
  next();
});

// 3. Rutas de autenticación (NO protegidas) - ANTES que requireAuth
app.use('/auth', authRoutes);

// NUEVO: Endpoint de salud del servidor
app.get('/health', (req, res) => {
  const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    session: req.sessionID,
    authenticated: isAuth,
    user: req.user?.username || null,
    environment: {
      backend: process.env.BACKEND_URL,
      frontend: process.env.FRONTEND_URL,
      node_env: process.env.NODE_ENV
    }
  });
});

// 4. Rutas de API protegidas - REQUIEREN AUTENTICACIÓN
app.use('/api', requireAuth, routes);

// 5. Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Ruta de prueba básica (NO protegida)
app.get('/', (req, res) => {
  const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
  
  res.json({
    message: 'Backend CAS funcionando correctamente',
    authenticated: isAuth,
    user: isAuth ? req.user?.username : null,
    timestamp: new Date().toISOString(),
    config: {
      backendUrl: process.env.BACKEND_URL,
      frontendUrl: process.env.FRONTEND_URL,
      casUrl: 'https://auth.espol.edu.ec'
    },
    endpoints: {
      auth: {
        login: '/auth/cas/login',
        callback: '/auth/cas/callback',
        status: '/auth/status',
        user: '/auth/user',
        logout: '/auth/logout',
        test: '/auth/test',
        debug: '/auth/cas/debug'
      },
      api: '/api/*'
    }
  });
});

// PROBLEMA 8: Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('❌ === ERROR EN LA APLICACIÓN ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // FIXED: Verificar que req.isAuthenticated existe antes de usarlo
  const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
  
  console.error('Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    sessionId: req.sessionID,
    authenticated: isAuth
  });
  
  // Si es error de CORS, enviar respuesta específica
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origen no permitido',
      allowedOrigins: [process.env.FRONTEND_URL]
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID
  });
});

// NUEVO: Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❓ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

export default app;