import { QueryTypes } from "sequelize";
import db from "../models/index.js";

export async function obtenerMantenimientos(req, res) {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT id_equipo, id_periferico FROM equipo WHERE id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );
    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    const id_periferico = equipo[0].id_periferico;

    const mantenimientos = await db.query(
      `SELECT 
          m.id_mantenimiento,
          m.fecha,
          m.tipo,
          m.hallazgos,
          m.recomendaciones
        FROM mantenimiento m
        WHERE m.id_equipo = :id
        ORDER BY m.fecha DESC`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    for (const mantenimiento of mantenimientos) {
      const actividadesMantenimiento = await db.query(
        `SELECT 
            am.id_actividad_mantenimiento, 
            am.nombre, 
            COALESCE(ma.realizada, 0) AS realizada
          FROM actividad_mantenimiento am
          JOIN actividad_periferico ap ON am.id_actividad_mantenimiento = ap.id_actividad_mantenimiento
          LEFT JOIN mantenimiento_actividad ma 
            ON ma.id_actividad_mantenimiento = am.id_actividad_mantenimiento 
            AND ma.id_mantenimiento = :id_mantenimiento
          WHERE ap.id_periferico = :id_periferico`,
        {
          replacements: {
            id_mantenimiento: mantenimiento.id_mantenimiento,
            id_periferico,
          },
          type: QueryTypes.SELECT,
        }
      );
      mantenimiento.actividades = actividadesMantenimiento;
    }

    res.json({
      cantidad: mantenimientos.length,
      mantenimientos,
    });
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    res.status(500).json({ error: "Error al obtener mantenimientos" });
  }
}

export async function agregarMantenimiento(req, res) {
  const { id_equipo, tipo, hallazgos, recomendaciones, actividades } = req.body;

  if (!id_equipo || !tipo || !Array.isArray(actividades)) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const t = await db.transaction();
  try {
    const [result] = await db.query(
      `INSERT INTO mantenimiento (tipo, hallazgos, recomendaciones, id_equipo) 
       VALUES (:tipo, :hallazgos, :recomendaciones, :id_equipo)`,
      {
        replacements: { tipo, hallazgos, recomendaciones, id_equipo },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );
    const id_mantenimiento = result;

    for (const act of actividades) {
      await db.query(
        `INSERT INTO mantenimiento_actividad (id_mantenimiento, id_actividad_mantenimiento, realizada)
         VALUES (:id_mantenimiento, :id_actividad_mantenimiento, :realizada)`,
        {
          replacements: {
            id_mantenimiento,
            id_actividad_mantenimiento: act.id_actividad_mantenimiento,
            realizada: !!act.realizada,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }

    await t.commit();
    res.json({ ok: true, id_mantenimiento });
  } catch (error) {
    await t.rollback();
    console.error("Error al agregar mantenimiento:", error);
    res.status(500).json({ error: "Error al agregar mantenimiento" });
  }
}

export async function obtenerActividadesEquipo(req, res) {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT id_periferico FROM equipo WHERE id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );
    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    const id_periferico = equipo[0].id_periferico;

    const actividades = await db.query(
      `SELECT am.id_actividad_mantenimiento, am.nombre
         FROM actividad_mantenimiento am
         JOIN actividad_periferico ap ON am.id_actividad_mantenimiento = ap.id_actividad_mantenimiento
         WHERE ap.id_periferico = :id_periferico`,
      {
        replacements: { id_periferico },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ actividades });
  } catch (error) {
    console.error("Error al obtener actividades del equipo:", error);
    res.status(500).json({ error: "Error al obtener actividades del equipo" });
  }
}