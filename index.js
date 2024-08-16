const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConfig = require('./config/dbConfig');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
}));

app.use(bodyParser.json());
app.use('/api', routes); 

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
