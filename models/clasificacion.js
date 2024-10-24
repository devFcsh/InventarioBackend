import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Clasificacion = db.define('clasificacion', {
    id_clasificacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'clasificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_clasificacion" },
        ]
      },
    ]
  });

export default Clasificacion;