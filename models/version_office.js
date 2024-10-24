import db from "../models/index.js";
import { DataTypes } from "sequelize";

const VersionOffice = db.define('version_office', {
    id_versionoffice: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    tableName: 'version_office',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_versionoffice" },
        ]
      },
    ]
  });

export default VersionOffice;