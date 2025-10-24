import db from "./index.js";
import { DataTypes } from "sequelize";

const ActividadPeriferico = db.define('actividad_periferico', {
  id_periferico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'periferico',
      key: 'id_periferico'
    }
  },
  id_actividad_mantenimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'actividad_mantenimiento',
      key: 'id_actividad_mantenimiento'
    }
  }
}, {
  tableName: 'actividad_periferico',
  timestamps: false
});

export default ActividadPeriferico;