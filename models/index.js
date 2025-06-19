import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const { DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const db = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql"
});

export default db;
