import db from "../models/index.js";
import { DataTypes } from "sequelize";

const VersionSo = db.define('version_so', {
    id_versionso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    id_sistemaoperativo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sistema_operativo',
        key: 'id_sistemaoperativo'
      }
    }
  }, {
    tableName: 'version_so',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_versionso" },
        ]
      },
      {
        name: "id_sistemaoperativo",
        using: "BTREE",
        fields: [
          { name: "id_sistemaoperativo" },
        ]
      },
    ]
  });

export default VersionSo;