import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import routes from './routes';

const app = express(); 

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(json());

app.use('/api', routes);

import { join } from 'path';
app.use('/uploads', express.static(join(__dirname, 'uploads')));


export default app;
