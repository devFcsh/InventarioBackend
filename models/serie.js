import db from "./index.js";
import { DataTypes } from "sequelize";

const Serie = db.define('serie', {
    id_serie: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'serie',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_serie" },
        ]
      },
    ]
  });


export default Serie;
