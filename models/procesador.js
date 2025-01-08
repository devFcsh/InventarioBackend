import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Procesador = db.define('procesador', {
    id_procesador: {
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
    tableName: 'procesador',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_procesador" },
        ]
      },
    ]
  });


export default Procesador;