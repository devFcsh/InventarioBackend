import { Sequelize, DataTypes } from "sequelize";

const {DB_DATABASE,DB_USERNAME,DB_PASSWORD} = process.env;
const db = new Sequelize("inventario","root","Perla06",{dialect:"mysql"});

export default db;