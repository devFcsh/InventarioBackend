import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Aula = db.define('aula', {
    id_aula: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_edificio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'edificio',
        key: 'id_edificio'
      }
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    tableName: 'aula',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_aula" },
        ]
      },
      {
        name: "id_edificio",
        using: "BTREE",
        fields: [
          { name: "id_edificio" },
        ]
      },
    ]
  });
export default Aula;