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
// 0) TRUST PROXY
// --------------------------------------------------
// Si estás detrás de Cloudflare / TryCloudflare / balanceador, 
// Express necesita confiar en la cabecera X-Forwarded-Proto para saber que fue HTTPS.
app.set('trust proxy', 1);


console.log('🚀 Iniciando servidor...');
console.log('Backend URL:', process.env.BACKEND_URL);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// PROBLEMA 6: CORS debe ser más específico y permitir credentials
app.use(cors({
  origin: process.env.FRONTEND_URL, // ej: 'https://pt-settled-families-specs.trycloudflare.com'
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3) SESIÓN y PASSPORT
//  - Nota: sessionMiddleware DEBE ir ANTES de passport.initialize()
// --------------------------------------------------
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());


// --------------------------------------------------
// 4) RUTAS DE AUTENTICACIÓN
// --------------------------------------------------
app.use('/auth', authRoutes);


// 4. Rutas de API protegidas - REQUIEREN AUTENTICACIÓN
app.use('/api', requireAuth, routes);

// 5. Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------------
// 6) CAPTURAR 404
// --------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --------------------------------------------------
// 7) MANEJADOR DE ERRORES
// --------------------------------------------------
app.use((err, req, res, next) => {
  console.error('💥 Error global en Express:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

export default app;