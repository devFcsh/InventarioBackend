import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Disco = db.define('disco', {
    id_disco: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    capacidad: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  }, {
    tableName: 'disco',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_disco" },
        ]
      },
    ]
  });

export default Disco;