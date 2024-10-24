import db from "../models/index.js";
import { DataTypes } from "sequelize";

const PerifericoModelo = db.define('periferico_modelo', {
    id_periferico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'periferico',
        key: 'id_periferico'
      }
    },
    id_modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'modelo',
        key: 'id_modelo'
      }
    }
  }, {
    tableName: 'periferico_modelo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
          { name: "id_modelo" },
        ]
      },
      {
        name: "id_modelo",
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
        ]
      },
    ]
  });

export default PerifericoModelo;