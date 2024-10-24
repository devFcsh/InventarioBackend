import db from "../models/index.js";
import { DataTypes } from "sequelize";

const EquipoBaja = db.define('equipo_baja', {
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
    tableName: 'equipo_baja',
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

export default EquipoBaja;
