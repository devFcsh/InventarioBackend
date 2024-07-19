const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "LabFCSH2024?", 
  database: "inventario",

});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Conectado a la base de datos MySQL");
});

app.get("/", (req, res) => {
  res.send("Hola desde el servidor Express");
});

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
