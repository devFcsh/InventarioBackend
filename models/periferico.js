
import db from "./index.js";
import { DataTypes } from "sequelize";
const Periferico = db.define('periferico', {
    id_periferico: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'periferico',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
        ]
      },
    ]
  });


export default Periferico;
