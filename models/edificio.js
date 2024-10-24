import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Edificio = db.define('edificio', {
    id_edificio: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'edificio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_edificio" },
        ]
      },
    ]
  });

export default Edificio;