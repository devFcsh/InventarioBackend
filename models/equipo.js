import db from "./index.js";
import { DataTypes } from "sequelize";

const Equipo = db.define('equipo', {
    id_equipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    inventario: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'serie',
        key: 'id_serie'
      }
    }
  }, {
    tableName: 'equipo',
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
        name: "id_serie",
        using: "BTREE",
        fields: [
          { name: "id_serie" },
        ]
      },
    ]
  });

export default Equipo;
