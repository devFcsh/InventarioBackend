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

// --------------------------------------------------
// 0) VERIFICACIÓN DE VARIABLES DE ENTORNO
// --------------------------------------------------
console.log('🔧 === VERIFICANDO CONFIGURACIÓN ===');
const requiredEnvVars = ['BACKEND_URL', 'FRONTEND_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingVars);
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas:');
console.log('- Backend URL:', process.env.BACKEND_URL);
console.log('- Frontend URL:', process.env.FRONTEND_URL);
console.log('- Node ENV:', process.env.NODE_ENV || 'development');
console.log('- Session Secret:', process.env.SESSION_SECRET ? '***configurado***' : '❌ usando default');

// --------------------------------------------------
// 1) TRUST PROXY (IMPORTANTE PARA HTTPS)
// --------------------------------------------------
// Si estás detrás de Cloudflare / TryCloudflare / balanceador, 
// Express necesita confiar en las cabeceras X-Forwarded-* para detectar HTTPS
app.set('trust proxy', 1);
console.log('✅ Trust proxy configurado');

// --------------------------------------------------
// 2) CORS - CONFIGURACIÓN ESPECÍFICA
// --------------------------------------------------
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está permitido
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000', // Para desarrollo local
      'http://localhost:3001'  // Para desarrollo local alternativo
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 Origin no permitido:', origin);
      callback(null, false);
    }
  },
  credentials: true, // CRÍTICO: permite cookies/sesiones cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Session-ID']
};

app.use(cors(corsOptions));
console.log('✅ CORS configurado con credentials=true');

// --------------------------------------------------
// 3) PARSERS DE BODY
// --------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsers configurados');

// --------------------------------------------------
// 4) MIDDLEWARE DE LOGGING
// --------------------------------------------------
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${timestamp} ${req.method} ${req.originalUrl}`);
  
  // Log de headers importantes para debugging CAS
  if (req.originalUrl.includes('/auth/')) {
    console.log('🔍 Headers importantes:', {
      'user-agent': req.get('User-Agent'),
      'referer': req.get('Referer'),
      'host': req.get('Host'),
      'x-forwarded-proto': req.get('X-Forwarded-Proto'),
      'x-forwarded-for': req.get('X-Forwarded-For')
    });
  }
  
  next();
});

// --------------------------------------------------
// 5) SESIÓN Y PASSPORT (ORDEN CRÍTICO)
// --------------------------------------------------
// IMPORTANTE: sessionMiddleware DEBE ir ANTES de passport.initialize()
app.use(sessionMiddleware);
console.log('✅ Middleware de sesión configurado');

app.use(passport.initialize());
console.log('✅ Passport inicializado');

app.use(passport.session());
console.log('✅ Sesiones de Passport configuradas');

// --------------------------------------------------
// 6) HEALTH CHECK
// --------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --------------------------------------------------
// 7) RUTAS DE AUTENTICACIÓN (PÚBLICAS)
// --------------------------------------------------
app.use('/auth', authRoutes);
console.log('✅ Rutas de autenticación montadas en /auth');

// --------------------------------------------------
// 8) RUTAS DE API (PROTEGIDAS)
// --------------------------------------------------
app.use('/api', requireAuth, routes);
console.log('✅ Rutas de API montadas en /api (requieren autenticación)');

// --------------------------------------------------
// 9) ARCHIVOS ESTÁTICOS
// --------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('✅ Archivos estáticos configurados en /uploads');

// --------------------------------------------------
// 10) MIDDLEWARE PARA 404
// --------------------------------------------------
app.use((req, res, next) => {
  console.log('❌ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health - Health check',
      'GET /auth/test - Test de configuración CAS',
      'GET /auth/status - Estado de autenticación',
      'GET /auth/cas/login - Iniciar login CAS',
      'POST /auth/logout - Cerrar sesión',
      'GET /api/* - Endpoints de API (requieren autenticación)'
    ]
  });
});

// --------------------------------------------------
// 11) MANEJADOR GLOBAL DE ERRORES
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error('💥 === ERROR GLOBAL ===');
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Session ID:', req.sessionID);
  console.error('User:', req.user?.username || 'no autenticado');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // No exponer detalles internos en producción
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const errorResponse = {
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Agregar detalles adicionales solo en desarrollo
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.sessionId = req.sessionID;
  }

  // Determinar código de estado
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json(errorResponse);
});

console.log('🚀 === SERVIDOR CONFIGURADO EXITOSAMENTE ===');

export default app;
