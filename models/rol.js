import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Rol = db.define('rol', {
  id_rol: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  nombre_rol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'rol',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "id_rol" },
      ]
    },
    {
      name: "idx_rol_nombre_rol",
      using: "BTREE",
      fields: [
        { name: "nombre_rol" },
      ]
    },
  ],
});

export default Rol;
