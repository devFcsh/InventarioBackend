import db from "../models/index.js";
import { DataTypes } from "sequelize";

const EquipoActivo = db.define('equipo_activo', {
    id_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    },
    id_aula: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'aula',
        key: 'id_aula'
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      }
    }
  }, {
    tableName: 'equipo_activo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo" },
        ]
      },
      {
        name: "id_aula",
        using: "BTREE",
        fields: [
          { name: "id_aula" },
        ]
      },
      {
        name: "id_usuario",
        using: "BTREE",
        fields: [
          { name: "id_usuario" },
        ]
      },
    ]
  });

export default EquipoActivo;