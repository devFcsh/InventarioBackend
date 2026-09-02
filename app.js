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

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://auth.espol.edu.ec',
  'https://www.espol.edu.ec',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// La importación de equipos recibe un arreglo JSON grande. El límite
// predeterminado de body-parser es 100 KB y provoca un 413 con archivos
// medianos/grandes, aunque el Excel original sea pequeño.
app.use(json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.use('/api', requireAuth, routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


export default app;
