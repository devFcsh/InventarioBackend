import db from "../models/index.js";
import { DataTypes } from "sequelize";

const MarcaPeriferico = db.define('marca_periferico', {
    id_marca: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'marca',
        key: 'id_marca'
      }
    },
    id_periferico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'periferico',
        key: 'id_periferico'
      }
    }
  }, {
    tableName: 'marca_periferico',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_marca" },
          { name: "id_periferico" },
        ]
      },
      {
        name: "id_periferico",
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
        ]
      },
    ]
  });

export default MarcaPeriferico;