import db from "./index.js";
import { DataTypes } from "sequelize";

const Mantenimiento = db.define('mantenimiento', {
  id_mantenimiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  hallazgos: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  id_equipo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipo',
      key: 'id_equipo'
    }
  }
}, {
  tableName: 'mantenimiento',
  timestamps: false
});

export default Mantenimiento;