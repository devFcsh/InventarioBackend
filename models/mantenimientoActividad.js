import db from "./index.js";
import { DataTypes } from "sequelize";

const MantenimientoActividad = db.define('mantenimiento_actividad', {
  id_mantenimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'mantenimiento',
      key: 'id_mantenimiento'
    }
  },
  id_actividad_periferico_tipo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'actividad_periferico_tipo',
      key: 'id_actividad_periferico_tipo'
    }
  },
  realizada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'mantenimiento_actividad',
  timestamps: false
});

export default MantenimientoActividad;