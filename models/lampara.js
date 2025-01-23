import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Lampara = db.define('lampara', {
    id_lampara: {
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
    tableName: 'lampara',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_lampara" },
        ]
      },
    ]
  });


export default Lampara;