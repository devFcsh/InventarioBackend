import db from "../models/index.js";
import { DataTypes } from "sequelize";

const SistemaOperativo = db.define('sistema_operativo', {
    id_sistemaoperativo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'sistema_operativo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_sistemaoperativo" },
        ]
      },
    ]
  });

export default SistemaOperativo;