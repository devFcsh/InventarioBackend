import db from "../models/index.js";
import { DataTypes } from "sequelize";

const ModeloLampara = db.define('modelo_lampara', {
    id_modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'modelo',
        key: 'id_modelo'
      }
    },
    id_lampara: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'lampara',
        key: 'id_lampara'
      }
    }
  }, {
    tableName: 'modelo_lampara',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
          { name: "id_lampara" },
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

export default ModeloLampara;