import db from "../models/index.js";
import { DataTypes } from "sequelize";

const EquipoRed = db.define('equipo_red', {
    id_equipo_red: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'equipo',
          key: 'id_equipo'
        }
      },
      mac: {
        type: DataTypes.STRING(12),
        allowNull: false
      },
      puertos: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      puerto_ftp: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
  }, {
    tableName: 'equipo_red',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo_red" },
        ]
      },
    ]
  });

export default EquipoRed;