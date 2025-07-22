import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Ram = db.define('ram', {
    id_ram: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    capacidad: {
      type: DataTypes.STRING(6),
      allowNull: false
    }
  }, {
    tableName: 'ram',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_ram" },
        ]
      },
    ]
  });


export default Ram;