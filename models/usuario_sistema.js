import db from "../models/index.js";
import { DataTypes } from "sequelize";

const UsuarioSistema = db.define('usuario_sistema', {
  id_usuario_sistema: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  correo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rol',
      key: 'id_rol',
    },
  },
}, {
  tableName: 'usuario_sistema',
  timestamps: false,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "id_usuario_sistema" },
      ]
    },
    {
      name: "idx_usuario_sistema_correo",
      using: "BTREE",
      fields: [
        { name: "correo" },
      ]
    },
    {
      name: "idx_usuario_sistema_rol",
      using: "BTREE",
      fields: [
        { name: "id_rol" },
      ]
    },
  ],
});

export default UsuarioSistema;
