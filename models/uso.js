import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Uso = db.define('uso', {
    id_uso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    tableName: 'uso',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_uso" },
        ]
      },
    ]
  });

export default Uso;
