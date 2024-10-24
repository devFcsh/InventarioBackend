import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import cors from 'cors';
import routes from './routes/index.js';
import dotenv from "dotenv"
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express(); 

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(json());

app.use('/api', routes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


export default app;
