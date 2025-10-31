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
            apt.id_actividad_periferico_tipo,
            am.id_actividad_mantenimiento,
            am.nombre AS actividad,
            tm.id_tipo_mantenimiento,
            tm.nombre AS tipo_mantenimiento,
            COALESCE(ma.realizada, 0) AS realizada
          FROM actividad_periferico_tipo apt
          JOIN actividad_mantenimiento am 
            ON apt.id_actividad_mantenimiento = am.id_actividad_mantenimiento
          JOIN tipo_mantenimiento tm
            ON apt.id_tipo_mantenimiento = tm.id_tipo_mantenimiento
          LEFT JOIN mantenimiento_actividad ma
            ON ma.id_actividad_periferico_tipo = apt.id_actividad_periferico_tipo
            AND ma.id_mantenimiento = :id_mantenimiento
          WHERE apt.id_periferico = :id_periferico
          ORDER BY tm.nombre, am.nombre`,
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

  if (!id_equipo || !tipo) {
    return res.status(400).json({ error: "Datos incompletos (falta id_equipo o tipo)" });
  }

  const t = await db.transaction();
  try {
    // obtener id_periferico del equipo
    const equipoRow = await db.query(
      `SELECT id_periferico FROM equipo WHERE id_equipo = :id_equipo`,
      { replacements: { id_equipo }, type: QueryTypes.SELECT, transaction: t }
    );
    if (!equipoRow.length) {
      await t.rollback();
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    const id_periferico = equipoRow[0].id_periferico;

    // obtener o crear tipo_mantenimiento
    let rowsTipo = await db.query(
      `SELECT id_tipo_mantenimiento FROM tipo_mantenimiento WHERE nombre = :tipo`,
      { replacements: { tipo }, type: QueryTypes.SELECT, transaction: t }
    );
    let id_tipo_mantenimiento;
    if (rowsTipo.length) {
      id_tipo_mantenimiento = rowsTipo[0].id_tipo_mantenimiento;
    } else {
      const [insertTipoResult] = await db.query(
        `INSERT INTO tipo_mantenimiento (nombre) VALUES (:tipo)`,
        { replacements: { tipo }, type: QueryTypes.INSERT, transaction: t }
      );
      id_tipo_mantenimiento = insertTipoResult;
    }

    // insertar mantenimiento (ya no guardamos 'tipo' como texto)
    const [insertMantenimientoResult] = await db.query(
      `INSERT INTO mantenimiento (hallazgos, recomendaciones, id_equipo) 
       VALUES (:hallazgos, :recomendaciones, :id_equipo)`,
      {
        replacements: { hallazgos: hallazgos || null, recomendaciones: recomendaciones || null, id_equipo },
        type: QueryTypes.INSERT,
        transaction: t,
      }
    );
    const id_mantenimiento = insertMantenimientoResult;

    // si no vienen actividades en body, obtener todas las actividades aplicables (periférico + tipo)
    let aptRows = [];
    if (!Array.isArray(actividades) || actividades.length === 0) {
      aptRows = await db.query(
        `SELECT id_actividad_periferico_tipo FROM actividad_periferico_tipo
         WHERE id_periferico = :id_periferico AND id_tipo_mantenimiento = :id_tipo_mantenimiento`,
        {
          replacements: { id_periferico, id_tipo_mantenimiento: id_tipo_mantenimiento },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
      // insertar mantenimiento_actividad para cada apt con realizada = false
      for (const r of aptRows) {
        await db.query(
          `INSERT INTO mantenimiento_actividad (id_mantenimiento, id_actividad_periferico_tipo, realizada)
           VALUES (:id_mantenimiento, :id_apt, FALSE)`,
          {
            replacements: { id_mantenimiento, id_apt: r.id_actividad_periferico_tipo },
            type: QueryTypes.INSERT,
            transaction: t,
          }
        );
      }
    } else {
      // actividades provistas: pueden incluir id_actividad_periferico_tipo o id_actividad_mantenimiento + realizada
      for (const act of actividades) {
        let id_apt = act.id_actividad_periferico_tipo || null;

        if (!id_apt && act.id_actividad_mantenimiento) {
          // intentar resolver mapping existente
          const mapping = await db.query(
            `SELECT id_actividad_periferico_tipo FROM actividad_periferico_tipo
             WHERE id_periferico = :id_periferico
               AND id_actividad_mantenimiento = :id_act
               AND id_tipo_mantenimiento = :id_tipo`,
            {
              replacements: { id_periferico, id_act: act.id_actividad_mantenimiento, id_tipo: id_tipo_mantenimiento },
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );
          if (mapping.length) {
            id_apt = mapping[0].id_actividad_periferico_tipo;
          } else {
            // crear mapping si no existe
            const [insertAptResult] = await db.query(
              `INSERT INTO actividad_periferico_tipo (id_periferico, id_actividad_mantenimiento, id_tipo_mantenimiento)
               VALUES (:id_periferico, :id_act, :id_tipo)`,
              {
                replacements: { id_periferico, id_act: act.id_actividad_mantenimiento, id_tipo: id_tipo_mantenimiento },
                type: QueryTypes.INSERT,
                transaction: t,
              }
            );
            id_apt = insertAptResult;
          }
        }

        if (!id_apt) {
          // no se pudo resolver la actividad, omitirla (log)
          console.warn("agregarMantenimiento: actividad omitida, no se resolvió id_apt:", act);
          continue;
        }

        const realizada = !!act.realizada;
        await db.query(
          `INSERT INTO mantenimiento_actividad (id_mantenimiento, id_actividad_periferico_tipo, realizada)
           VALUES (:id_mantenimiento, :id_apt, :realizada)`,
          {
            replacements: { id_mantenimiento, id_apt, realizada },
            type: QueryTypes.INSERT,
            transaction: t,
          }
        );
      }
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
  const tipo = req.query.tipo; // optional: ?tipo=preventivo | correctivo | all

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

    // si piden todas las actividades o no especifican tipo -> devolver todo para el periférico
    if (!tipo || tipo === "all") {
      const actividades = await db.query(
        `SELECT apt.id_actividad_periferico_tipo,
                am.id_actividad_mantenimiento,
                am.nombre AS actividad,
                tm.id_tipo_mantenimiento,
                tm.nombre AS tipo_mantenimiento
         FROM actividad_periferico_tipo apt
         JOIN actividad_mantenimiento am ON apt.id_actividad_mantenimiento = am.id_actividad_mantenimiento
         JOIN tipo_mantenimiento tm ON apt.id_tipo_mantenimiento = tm.id_tipo_mantenimiento
         WHERE apt.id_periferico = :id_periferico
         ORDER BY tm.nombre, am.nombre`,
        {
          replacements: { id_periferico },
          type: QueryTypes.SELECT,
        }
      );
      return res.json({ actividades });
    }

    // resolver id_tipo_mantenimiento por nombre
    const tipoRows = await db.query(
      `SELECT id_tipo_mantenimiento FROM tipo_mantenimiento WHERE nombre = :tipo`,
      { replacements: { tipo }, type: QueryTypes.SELECT }
    );
    if (!tipoRows.length) {
      return res.status(404).json({ error: "Tipo de mantenimiento no encontrado" });
    }
    const id_tipo_mantenimiento = tipoRows[0].id_tipo_mantenimiento;

    const actividades = await db.query(
      `SELECT apt.id_actividad_periferico_tipo,
              am.id_actividad_mantenimiento,
              am.nombre AS actividad
       FROM actividad_periferico_tipo apt
       JOIN actividad_mantenimiento am ON apt.id_actividad_mantenimiento = am.id_actividad_mantenimiento
       WHERE apt.id_periferico = :id_periferico
         AND apt.id_tipo_mantenimiento = :id_tipo_mantenimiento
       ORDER BY am.nombre`,
      {
        replacements: { id_periferico, id_tipo_mantenimiento },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ actividades });
  } catch (error) {
    console.error("Error al obtener actividades del equipo:", error);
    res.status(500).json({ error: "Error al obtener actividades del equipo" });
  }
}