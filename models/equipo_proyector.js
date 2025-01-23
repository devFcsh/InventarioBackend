import db from "../models/index.js";
import { DataTypes } from "sequelize";

const EquipoProyector = db.define('equipo_proyector', {
    id_proyector: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'equipo',
          key: 'id_equipo'
        }
      },
    id_lampara: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lampara',
        key: 'id_lampara'
      }
    }
  }, {
    tableName: 'equipo_proyector',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_proyector" },
        ]
      },
      {
        name: "id_lampara",
        using: "BTREE",
        fields: [
          { name: "id_lampara" },
        ]
      },
    ]
  });

export default EquipoProyector;