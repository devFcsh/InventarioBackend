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
          m.recomendaciones,
          m.id_tipo_mantenimiento,
          tm.nombre AS tipo_mantenimiento
        FROM mantenimiento m
        LEFT JOIN tipo_mantenimiento tm ON m.id_tipo_mantenimiento = tm.id_tipo_mantenimiento
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
      mantenimiento.tipo = mantenimiento.tipo_mantenimiento || null;
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
  const { id_equipo, tipo, hallazgos, recomendaciones, actividades, fecha } = req.body;

  if (!id_equipo || !tipo) {
    return res.status(400).json({ error: "Datos incompletos (falta id_equipo o tipo)" });
  }

  const t = await db.transaction();
  try {
    const equipoRow = await db.query(
      `SELECT id_periferico FROM equipo WHERE id_equipo = :id_equipo`,
      { replacements: { id_equipo }, type: QueryTypes.SELECT, transaction: t }
    );
    if (!equipoRow.length) {
      await t.rollback();
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    const id_periferico = equipoRow[0].id_periferico;

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

    let insertMantenimientoResult;
    if (fecha) {
      [insertMantenimientoResult] = await db.query(
        `INSERT INTO mantenimiento (fecha, hallazgos, recomendaciones, id_equipo, id_tipo_mantenimiento) 
         VALUES (:fecha, :hallazgos, :recomendaciones, :id_equipo, :id_tipo_mantenimiento)`,
        {
          replacements: { fecha, hallazgos: hallazgos || null, recomendaciones: recomendaciones || null, id_equipo, id_tipo_mantenimiento },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    } else {
      [insertMantenimientoResult] = await db.query(
        `INSERT INTO mantenimiento (hallazgos, recomendaciones, id_equipo, id_tipo_mantenimiento) 
         VALUES (:hallazgos, :recomendaciones, :id_equipo, :id_tipo_mantenimiento)`,
        {
          replacements: { hallazgos: hallazgos || null, recomendaciones: recomendaciones || null, id_equipo, id_tipo_mantenimiento },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );
    }
    const id_mantenimiento = insertMantenimientoResult;

    let aptRows = [];
    if (!Array.isArray(actividades) || actividades.length === 0) {
      aptRows = await db.query(
        `SELECT id_actividad_periferico_tipo FROM actividad_periferico_tipo
         WHERE id_periferico = :id_periferico AND id_tipo_mantenimiento = :id_tipo_mantenimiento`,
        {
          replacements: { id_periferico, id_tipo_mantenimiento },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );
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
      for (const act of actividades) {
        let id_apt = act.id_actividad_periferico_tipo || null;

        if (!id_apt && act.id_actividad_mantenimiento) {
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
  const tipo = req.query.tipo;

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

export async function editarMantenimiento(req, res) {
  const { id } = req.params;
  const { tipo, hallazgos, recomendaciones, actividades, fecha } = req.body;

  if (!id) return res.status(400).json({ error: "Falta id de mantenimiento" });

  const t = await db.transaction();
  try {
    const mantenimientoRow = await db.query(
      `SELECT id_mantenimiento, id_equipo FROM mantenimiento WHERE id_mantenimiento = :id`,
      { replacements: { id }, type: QueryTypes.SELECT, transaction: t }
    );
    if (!mantenimientoRow.length) {
      await t.rollback();
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }
    const id_equipo = mantenimientoRow[0].id_equipo;

    const equipoRow = await db.query(
      `SELECT id_periferico FROM equipo WHERE id_equipo = :id_equipo`,
      { replacements: { id_equipo }, type: QueryTypes.SELECT, transaction: t }
    );
    if (!equipoRow.length) {
      await t.rollback();
      return res.status(404).json({ error: "Equipo asociado no encontrado" });
    }
    const id_periferico = equipoRow[0].id_periferico;

    let id_tipo_mantenimiento = null;
    if (tipo) {
      const tipoRows = await db.query(
        `SELECT id_tipo_mantenimiento FROM tipo_mantenimiento WHERE nombre = :tipo`,
        { replacements: { tipo }, type: QueryTypes.SELECT, transaction: t }
      );
      if (tipoRows.length) {
        id_tipo_mantenimiento = tipoRows[0].id_tipo_mantenimiento;
      } else {
        const [insertTipoResult] = await db.query(
          `INSERT INTO tipo_mantenimiento (nombre) VALUES (:tipo)`,
          { replacements: { tipo }, type: QueryTypes.INSERT, transaction: t }
        );
        id_tipo_mantenimiento = insertTipoResult;
      }
    }

    const updates = [];
    const replacements = { id_mantenimiento: id };
    if (typeof hallazgos !== "undefined") {
      updates.push("hallazgos = :hallazgos");
      replacements.hallazgos = hallazgos || null;
    }
    if (typeof recomendaciones !== "undefined") {
      updates.push("recomendaciones = :recomendaciones");
      replacements.recomendaciones = recomendaciones || null;
    }
    if (typeof fecha !== "undefined") {
      updates.push("fecha = :fecha");
      replacements.fecha = fecha || null;
    }
    if (id_tipo_mantenimiento !== null) {
      updates.push("id_tipo_mantenimiento = :id_tipo_mantenimiento");
      replacements.id_tipo_mantenimiento = id_tipo_mantenimiento;
    }

    if (updates.length) {
      const sql = `UPDATE mantenimiento SET ${updates.join(", ")} WHERE id_mantenimiento = :id_mantenimiento`;
      await db.query(sql, { replacements, type: QueryTypes.UPDATE, transaction: t });
    }

    if (Array.isArray(actividades)) {
      await db.query(
        `DELETE FROM mantenimiento_actividad WHERE id_mantenimiento = :id_mantenimiento`,
        { replacements: { id_mantenimiento: id }, type: QueryTypes.DELETE, transaction: t }
      );

      for (const act of actividades) {
        let id_apt = act.id_actividad_periferico_tipo || null;

        if (!id_apt && act.id_actividad_mantenimiento) {
          const mapping = await db.query(
            `SELECT id_actividad_periferico_tipo FROM actividad_periferico_tipo
             WHERE id_periferico = :id_periferico
               AND id_actividad_mantenimiento = :id_act
               AND id_tipo_mantenimiento = :id_tipo`,
            {
              replacements: {
                id_periferico,
                id_act: act.id_actividad_mantenimiento,
                id_tipo: id_tipo_mantenimiento,
              },
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );
          if (mapping.length) {
            id_apt = mapping[0].id_actividad_periferico_tipo;
          } else {
            const [insertAptResult] = await db.query(
              `INSERT INTO actividad_periferico_tipo (id_periferico, id_actividad_mantenimiento, id_tipo_mantenimiento)
               VALUES (:id_periferico, :id_act, :id_tipo)`,
              {
                replacements: {
                  id_periferico,
                  id_act: act.id_actividad_mantenimiento,
                  id_tipo: id_tipo_mantenimiento,
                },
                type: QueryTypes.INSERT,
                transaction: t,
              }
            );
            id_apt = insertAptResult;
          }
        }

        if (!id_apt) {
          console.warn("editarMantenimiento: actividad omitida, no se resolvió id_apt:", act);
          continue;
        }

        const realizada = !!act.realizada;
        await db.query(
          `INSERT INTO mantenimiento_actividad (id_mantenimiento, id_actividad_periferico_tipo, realizada)
           VALUES (:id_mantenimiento, :id_apt, :realizada)`,
          {
            replacements: { id_mantenimiento: id, id_apt, realizada },
            type: QueryTypes.INSERT,
            transaction: t,
          }
        );
      }
    }

    await t.commit();
    res.json({ ok: true, id_mantenimiento: id });
  } catch (error) {
    await t.rollback();
    console.error("Error al editar mantenimiento:", error);
    res.status(500).json({ error: "Error al editar mantenimiento" });
  }
}

export async function eliminarMantenimiento(req, res) {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Falta id de mantenimiento" });

  const t = await db.transaction();
  try {
    const rows = await db.query(
      `SELECT id_mantenimiento FROM mantenimiento WHERE id_mantenimiento = :id`,
      { replacements: { id }, type: QueryTypes.SELECT, transaction: t }
    );
    if (!rows.length) {
      await t.rollback();
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    await db.query(
      `DELETE FROM mantenimiento WHERE id_mantenimiento = :id`,
      { replacements: { id }, type: QueryTypes.DELETE, transaction: t }
    );

    await t.commit();
    return res.json({ ok: true, id_mantenimiento: id });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar mantenimiento:", error);
    return res.status(500).json({ error: "Error al eliminar mantenimiento" });
  }
}