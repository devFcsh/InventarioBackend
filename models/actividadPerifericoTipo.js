import db from "./index.js";
import { DataTypes } from "sequelize";

const ActividadPerifericoTipo = db.define("actividad_periferico_tipo", {
  id_actividad_periferico_tipo: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_periferico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "periferico", key: "id_periferico" },
  },
  id_actividad_mantenimiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "actividad_mantenimiento", key: "id_actividad_mantenimiento" },
  },
  id_tipo_mantenimiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "tipo_mantenimiento", key: "id_tipo_mantenimiento" },
  },
}, {
  tableName: "actividad_periferico_tipo",
  timestamps: false,
  indexes: [
    { name: "ux_peri_act_tipo", unique: true, fields: ["id_periferico","id_actividad_mantenimiento","id_tipo_mantenimiento"] }
  ]
});

export default ActividadPerifericoTipo;