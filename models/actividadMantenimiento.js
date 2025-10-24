import db from "./index.js";
import { DataTypes } from "sequelize";

const ActividadMantenimiento = db.define('actividad_mantenimiento', {
  id_actividad_mantenimiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'actividad_mantenimiento',
  timestamps: false
});

export default ActividadMantenimiento;