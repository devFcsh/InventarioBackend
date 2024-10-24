import db from "../models/index.js";
import { DataTypes } from "sequelize";

const ModeloSerie = db.define('modelo_serie', {
    id_modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'modelo',
        key: 'id_modelo'
      }
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'serie',
        key: 'id_serie'
      }
    }
  }, {
    tableName: 'modelo_serie',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
          { name: "id_serie" },
        ]
      },
      {
        name: "id_serie",
        using: "BTREE",
        fields: [
          { name: "id_serie" },
        ]
      },
    ]
  });

export default ModeloSerie;