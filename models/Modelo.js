import db from "./index.js";
import { DataTypes } from "sequelize";

const Modelo = db.define('modelo', {
    id_modelo: {
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
    tableName: 'modelo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
        ]
      },
    ]
  });

export default Modelo;