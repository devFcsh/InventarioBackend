import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Usuario = db.define('usuario', {
    id_usuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    id_uso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'uso',
        key: 'id_uso'
      }
    }
  }, {
    tableName: 'usuario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_usuario" },
        ]
      },
      {
        name: "id_uso",
        using: "BTREE",
        fields: [
          { name: "id_uso" },
        ]
      },
    ]
  });

export default Usuario;
