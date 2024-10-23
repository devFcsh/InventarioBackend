import { readdirSync } from "fs";
import { basename, dirname } from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const {DB_DATABASE,DB_USERNAME,DB_PASSWORD} = process.env;

const db = {};
const sequelize = new Sequelize(DB_DATABASE,DB_USERNAME,DB_PASSWORD,{dialect:"mysql"});

const files = readdirSync(__dirname)
  .filter(
    (file) => file.indexOf('.') !== 0
    && file !== basename(__filename)
    && file.slice(-3) === '.js',
  );

for (const file of files) {
  const model = await import(`./${file}`);
  const namedModel = model.default(sequelize, DataTypes);
  db[namedModel.name] = namedModel;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

