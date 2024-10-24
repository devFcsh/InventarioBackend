import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Imagen = db.define('imagen', {
    id_imagen: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ruta: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'imagen',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_imagen" },
        ]
      },
    ]
  });

export default Imagen;
