import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import cors from 'cors';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express(); 

app.use(cors({
  origin: 'http://localhost:5173',
}));

// La importación de equipos recibe un arreglo JSON grande. El límite
// predeterminado de body-parser es 100 KB y provoca un 413 con archivos
// medianos/grandes, aunque el Excel original sea pequeño.
app.use(json({ limit: '10mb' }));

app.use('/api', routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


export default app;
