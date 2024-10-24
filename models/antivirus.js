
import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Antivirus = db.define('antivirus', {
    id_antivirus: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    estado: {
      type: DataTypes.ENUM('Activado','Desactivado'),
      allowNull: false
    }
  }, {
    tableName: 'antivirus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_antivirus" },
        ]
      },
    ]
  });

export default Antivirus;