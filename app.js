const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

const app = express(); 

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(bodyParser.json());

app.use('/api', routes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


module.exports = app;
