import db from "./index.js";
import { DataTypes } from "sequelize";

const TipoMantenimiento = db.define("tipo_mantenimiento", {
  id_tipo_mantenimiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "tipo_mantenimiento",
  timestamps: false,
});

export default TipoMantenimiento;