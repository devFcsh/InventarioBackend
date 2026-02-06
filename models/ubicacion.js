import db from "./index.js";
import { DataTypes } from "sequelize";

const Ubicacion = db.define('ubicacion', {
    id_ubicacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_edificio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'edificio',
        key: 'id_edificio'
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'ubicacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_ubicacion" },
        ]
      },
      {
        name: "id_edificio",
        using: "BTREE",
        fields: [
          { name: "id_edificio" },
        ]
      },
    ]
  });
export default Ubicacion;