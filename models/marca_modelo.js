import db from "../models/index.js";
import { DataTypes } from "sequelize";

const MarcaModelo = db.define('marca_modelo', {
    id_marca: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'marca',
        key: 'id_marca'
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
    tableName: 'marca_modelo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_marca" },
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

export default MarcaModelo;
