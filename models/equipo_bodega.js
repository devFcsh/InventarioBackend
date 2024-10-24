import db from "../models/index.js";
import { DataTypes } from "sequelize";

const EquipoBodega = db.define('equipo_bodega', {
    id_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    }
  }, {
    tableName: 'equipo_bodega',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo" },
        ]
      },
    ]
  });

export default EquipoBodega;