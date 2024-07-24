// config/dbConfig.js

const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'LabFCSH2024?',
  database: 'inventario'
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    throw err;
  }
  console.log('Conectado a la base de datos MySQL');
});

module.exports = db;
