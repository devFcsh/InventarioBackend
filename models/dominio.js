import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Dominio = db.define('dominio', {
    id_dominio: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'dominio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_dominio" },
        ]
      },
    ]
  });

export default Dominio;