import { QueryTypes } from "sequelize";
import db from "../models/index.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, unlinkSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validarTexto(input) {
  if (!input) return null;

  if (typeof input !== "string") return null;

  const trimmed = input.trim();

  if (trimmed.length === 0 || trimmed.length > 20) return null;

  const regex = /^[a-zA-Z0-9 _-]+$/;

  if (!regex.test(trimmed)) return null;

  return trimmed;
}

export async function obtenerEquiposActivos(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        u.nombre AS usuario,
        uso.nombre AS uso,
        ea.id_ubicacion,
        ed.nombre AS edificio,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion 
      JOIN edificio ed ON a.id_edificio = ed.id_edificio 
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      JOIN uso ON u.id_uso = uso.id_uso
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
      AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
      AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
      AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
      AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))

      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos y contar activos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener equipos y contar activos" });
  }
}

export async function obtenerEquiposRed(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        u.nombre AS usuario,
        uso.nombre AS uso,
        ea.id_ubicacion,
        ed.nombre AS edificio,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion 
      JOIN edificio ed ON a.id_edificio = ed.id_edificio 
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      JOIN uso ON u.id_uso = uso.id_uso
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos y contar activos:", error);
    res.status(500).json({ error: "Error al obtener equipos de red" });
  }
}

export async function obtenerEquiposBodega(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos en bodega:", error);
    res.status(500).json({ error: "Error al obtener equipos en bodega" });
  }
}

export async function obtenerEquiposRedBodega(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos en bodega red:", error);
    res.status(500).json({ error: "Error al obtener equipos en bodega red" });
  }
}

export async function obtenerEquiposBaja(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_baja eb ON e.id_equipo = eb.id_equipo
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos de baja:", error);
    res.status(500).json({ error: "Error al obtener equipos de baja" });
  }
}

export async function obtenerEquiposRedBaja(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_baja eb ON e.id_equipo = eb.id_equipo
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos de baja red:", error);
    res.status(500).json({ error: "Error al obtener equipos de baja red" });
  }
}

export async function obtenerEquiposPorUsuario(req, res) {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT 
        e.id_equipo,
        e.inventario,
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      WHERE u.id_usuario = :id_usuario
    `;

    const equipos = await db.query(query, {
      replacements: { id_usuario },
      type: QueryTypes.SELECT,
    });

    /** 
    if (equipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron equipos para este usuario." });
    }
   */

    res.json({ equipos });
  } catch (error) {
    console.error("Error al obtener equipos del usuario:", error);
    res.status(500).json({ error: "Error al obtener equipos del usuario" });
  }
}

export async function cambiarUsuarioEquipo(req, res) {
  const { equipoId } = req.params;
  const { usuarioId } = req.body;

  try {
    const esComponente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (esComponente.length) {
      return res
        .status(400)
        .json({ error: "No se puede cambiar el usuario de un componente." });
    }

    const query = `
      UPDATE equipo_activo
      SET id_usuario = :usuarioId
      WHERE id_equipo = :equipoId;
    `;

    const result = await db.query(query, {
      replacements: { equipoId, usuarioId },
      type: QueryTypes.UPDATE,
    });

    if (result[0] === 0) {
      return res
        .status(404)
        .json({ error: "Equipo no encontrado o no se actualizó." });
    }

    await db.query(
      `UPDATE equipo_activo 
       SET id_usuario = :usuarioId 
       WHERE id_equipo IN (
         SELECT id_componente FROM componente WHERE id_computadora = :equipoId
       )`,
      {
        replacements: { equipoId, usuarioId },
        type: QueryTypes.UPDATE,
      }
    );

    res.json({
      mensaje:
        "Usuario cambiado correctamente en el equipo y sus componentes asociados.",
    });
  } catch (error) {
    console.error("Error al cambiar usuario de equipo:", error);
    res.status(500).json({ error: "Error al cambiar usuario de equipo." });
  }
}

export async function eliminarEquipo(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (componente.length) {
      return res
        .status(400)
        .json({ error: "Debe desligar el componente antes de eliminarlo." });
    }

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      const componenteIds = componentes.map((comp) => comp.id_componente);

      await db.query(
        `DELETE FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.DELETE,
        }
      );

      if (componenteIds.length > 0) {
        await db.query(
          `DELETE FROM equipo WHERE id_equipo IN (:componenteIds)`,
          {
            replacements: { componenteIds },
            type: QueryTypes.DELETE,
          }
        );
      }
    }

    const imagen = await db.query(
      `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (imagen.length) {
      await db.query(`DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`, {
        replacements: { idImagen: imagen[0].id_imagen },
        type: QueryTypes.DELETE,
      });

      await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
        replacements: { idImagen: imagen[0].id_imagen },
        type: QueryTypes.DELETE,
      });

      const imagePath = join(__dirname, "..", imagen[0].ruta);
      if (existsSync(imagePath)) {
        unlinkSync(imagePath);
      }
    }

    await db.query(`DELETE FROM equipo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });

    res.json({
      message: "Equipo, imagen y sus componentes eliminados con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar equipo y componentes:", error);
    res.status(500).json({ error: "Error al eliminar equipo y componentes" });
  }
}

export async function eliminarEquipoSimple(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    await db.query(`DELETE FROM equipo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });

    res.json({ message: "Equipo eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
}

export async function darDeBajaEquipo(req, res) {
  const { equipoId } = req.params;
  const { tipo } = req.body;

  try {
    const equipo = await db.query(
      `SELECT id_equipo FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (componente.length) {
      return res.status(400).json({ error: "Debe desligar el componente" });
    }

    if (tipo === "activo") {
      const activoInfo = await db.query(
        `SELECT id_usuario, id_ubicacion FROM equipo_activo WHERE id_equipo = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );
      if (activoInfo.length) {
        await db.query(
          `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
           VALUES (:equipoId, :id_usuario, :id_ubicacion, :tipo)
           ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
          {
            replacements: {
              equipoId,
              id_usuario: activoInfo[0].id_usuario,
              id_ubicacion: activoInfo[0].id_ubicacion,
              tipo,
            },
            type: QueryTypes.INSERT,
          }
        );
      }

      const imagen = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      /*
      if (imagen.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
          {
            replacements: { idImagen: imagen[0].id_imagen },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
          replacements: { idImagen: imagen[0].id_imagen },
          type: QueryTypes.DELETE,
        });

        const imagePath = join(__dirname, "..", imagen[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }
      */
    } else if (tipo === "bodega") {
      await db.query(
        `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
           VALUES (:equipoId, :id_usuario, :id_ubicacion, :tipo)
           ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
        {
          replacements: {
            equipoId,
            id_usuario: null,
            id_ubicacion: null,
            tipo,
          },
          type: QueryTypes.INSERT,
        }
      );
    }

    const computadora = await db.query(
      `SELECT id_computadora FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      const componenteIds = componentes.map((comp) => comp.id_componente);
      if (componenteIds.length > 0) {
        if (tipo === "activo") {
          const componentesActivos = await db.query(
            `SELECT id_equipo, id_usuario, id_ubicacion FROM equipo_activo WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.SELECT,
            }
          );
          for (const comp of componentesActivos) {
            await db.query(
              `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
               VALUES (:id_equipo, :id_usuario, :id_ubicacion, :tipo)
               ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
              {
                replacements: {
                  id_equipo: comp.id_equipo,
                  id_usuario: comp.id_usuario,
                  id_ubicacion: comp.id_ubicacion,
                  tipo,
                },
                type: QueryTypes.INSERT,
              }
            );
          }
        } else if (tipo === "bodega") {
          for (const id of componenteIds) {
            await db.query(
              `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
         VALUES (:id_equipo, :id_usuario, :id_ubicacion, :tipo)
         ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
              {
                replacements: {
                  id_equipo: id,
                  id_usuario: null,
                  id_ubicacion: null,
                  tipo,
                },
                type: QueryTypes.INSERT,
              }
            );
          }
        }

        await db.query(
          `INSERT INTO equipo_baja (id_equipo)
                    SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
          {
            replacements: { equipoId },
            type: QueryTypes.INSERT,
          }
        );

        /*
        await db.query(
          `DELETE FROM componente WHERE id_computadora = :equipoId`,
          {
            replacements: { equipoId },
            type: QueryTypes.DELETE,
          }
        );
        */

        if (tipo === "activo") {
          await db.query(
            `DELETE FROM equipo_activo WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.DELETE,
            }
          );
        } else if (tipo === "bodega") {
          await db.query(
            `DELETE FROM equipo_bodega WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
      await db.query(`INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`, {
        replacements: { equipoId },
        type: QueryTypes.INSERT,
      });

      /*
      await db.query(
        `DELETE FROM computadora WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.DELETE,
        }
      );
      */
    } else {
      await db.query(`INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`, {
        replacements: { equipoId },
        type: QueryTypes.INSERT,
      });
    }

    if (tipo === "activo") {
      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    } else if (tipo === "bodega") {
      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    }

    res.json({ message: "Equipo dado de baja con éxito" });
  } catch (error) {
    console.error("Error al dar de baja el equipo:", error);
    res.status(500).json({ error: "Error al dar de baja el equipo" });
  }
}

export async function sacarEquipoDeBaja(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT id_equipo FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const enBaja = await db.query(
      `SELECT id_equipo FROM equipo_baja WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!enBaja.length) {
      return res.status(400).json({ error: "El equipo no está en baja." });
    }

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (componente.length) {
      return res
        .status(400)
        .json({ error: "No se puede mover un componente directamente." });
    }

    const computadora = await db.query(
      `SELECT id_computadora FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    let componentes = [];
    if (computadora.length) {
      componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );
    }

    let info = await db.query(
      `SELECT id_usuario, id_ubicacion, tipo FROM equipo_baja_info WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!info.length) {
      return res.status(400).json({
        error:
          "No hay información previa de usuario y ubicación para este equipo. No se puede restaurar automáticamente.",
      });
    }
    const { id_usuario, id_ubicacion, tipo } = info[0];

    await db.query(`DELETE FROM equipo_baja WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });
    await db.query(`DELETE FROM equipo_baja_info WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });
    if (componentes.length) {
      const componenteIds = componentes.map((c) => c.id_componente);
      await db.query(
        `DELETE FROM equipo_baja WHERE id_equipo IN (:componenteIds)`,
        {
          replacements: { componenteIds },
          type: QueryTypes.DELETE,
        }
      );
      await db.query(
        `DELETE FROM equipo_baja_info WHERE id_equipo IN (:componenteIds)`,
        {
          replacements: { componenteIds },
          type: QueryTypes.DELETE,
        }
      );
    }

    if (tipo === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const comp of componentes) {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:idComponente, :id_usuario, :id_ubicacion)`,
            {
              replacements: {
                idComponente: comp.id_componente,
                id_usuario,
                id_ubicacion,
              },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else if (tipo === "bodega") {
      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );
      if (componentes.length) {
        for (const comp of componentes) {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente)`,
            {
              replacements: { idComponente: comp.id_componente },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else {
      return res.status(400).json({
        error:
          "Tipo no válido en equipo_baja_info. Debe ser 'activo' o 'bodega'.",
      });
    }

    res.json({ message: `Equipo movido de baja a ${tipo} correctamente.` });
  } catch (error) {
    console.error("Error al mover equipo de baja:", error);
    res.status(500).json({ error: "Error al mover equipo de baja" });
  }
}

export async function agregarEquipo(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    serie,
    nombreEquipo,
    direccionIp,
    versionso,
    versionoffice,
    ram,
    disco,
    procesador,
    antivirus,
    dominio,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
  } = req.body;

  const parametros = {
    tipo,
    inventario,
    anio_compra,
    serie,
    nombreEquipo,
    direccionIp,
    versionso,
    versionoffice,
    ram,
    disco,
    procesador,
    antivirus,
    dominio,
    idUbicacion: tipo === "bodega" ? null : idUbicacion,
    idUsuario: tipo === "bodega" ? null : idUsuario,
    imagenRuta: tipo === "bodega" ? null : imagenRuta,
    observacion,
  };

  try {
    const result = await db.query(
      `CALL agregar_equipo(
        :tipo,
        :inventario,
        :anio_compra,
        :serie,
        :nombreEquipo,
        :direccionIp,
        :versionso,
        :versionoffice,
        :ram,
        :disco,
        :procesador,
        :antivirus,
        :dominio,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion
      );`,
      {
        replacements: parametros,
      }
    );

    const equipoId = result[0]?.id_equipo;

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export async function agregarEquipoSimple(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    serie,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
    idLampara,
  } = req.body;

  const parametros = {
    tipo,
    inventario,
    anio_compra,
    serie,
    idUbicacion: tipo === "bodega" || tipo === "baja" ? null : idUbicacion,
    idUsuario: tipo === "bodega" || tipo === "baja" ? null : idUsuario,
    imagenRuta: tipo === "bodega" || tipo === "baja" ? null : imagenRuta,
    observacion,
    idLampara,
  };

  try {
    const result = await db.query(
      `CALL agregar_equipo_simple(
        :tipo,
        :inventario,
        :anio_compra,
        :serie,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion,
        :idLampara
      );`,
      {
        replacements: parametros,
      }
    );

    const equipoId = result[0]?.id_equipo;

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export async function agregarEquipoRed(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    serie,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
    mac,
    puertos,
    puerto_ftp,
    idLampara,
    nombreEquipo,
  } = req.body;

  const parametros = {
    tipo,
    inventario,
    anio_compra,
    serie,
    idUbicacion: tipo === "bodega" || tipo === "baja" ? null : idUbicacion,
    idUsuario: tipo === "bodega" || tipo === "baja" ? null : idUsuario,
    imagenRuta: tipo === "bodega" || tipo === "baja" ? null : imagenRuta,
    observacion,
    mac,
    puertos,
    puerto_ftp,
    idLampara,
    nombreEquipo,
  };

  try {
    const result = await db.query(
      `CALL agregar_equipo_simple(
        :tipo,
        :inventario,
        :anio_compra,
        :serie,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion,
        :idLampara
      );`,
      {
        replacements: parametros,
      }
    );

    const equipoId = result[0]?.id_equipo;

    if (!equipoId) {
      return res.status(400).json({ error: "No se pudo agregar el equipo" });
    }

    await db.query(
      `INSERT INTO equipo_red (id_equipo_red, mac, puertos, puerto_ftp, nombre_equipo)
         VALUES (:equipoId, :mac, :puertos, :puerto_ftp, :nombreEquipo)`,
      {
        replacements: { equipoId, mac, puertos, puerto_ftp, nombreEquipo },
        type: QueryTypes.INSERT,
      }
    );

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export const obtenerComputadora = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         c.nombre_equipo,
         c.direccion_ip,
         c.id_versionso,
         c.id_versionoffice,
         c.id_ram,
         c.id_disco,
         c.id_procesador,
         c.id_antivirus,
         c.id_dominio,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         vso.id_sistemaoperativo,
         e.observacion
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN version_so vso ON vso.id_versionso = c.id_versionso
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora:", error);
    res.status(500).json({ error: "Error al obtener la computadora" });
  }
};

export const obtenerActivoSimple = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         e.observacion,
         ep.id_lampara 
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       LEFT JOIN equipo_proyector ep ON ep.id_equipo_proyector = e.id_equipo
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener el equipo:", error);
    res.status(500).json({ error: "Error al obtener el equipo" });
  }
};

export const obtenerActivoRed = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         e.observacion,
         er.mac,
         er.puertos,
         er.puerto_ftp,
         er.nombre_equipo
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       LEFT JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.json({ equipo: equipo[0] });
  } catch (error) {
    console.error("Error al obtener el equipo de red:", error);
    res.status(500).json({ error: "Error al obtener el equipo de red" });
  }
};

export const obtenerComputadoraBodega = async (req, res) => {
  const { id } = req.params;

  try {
    const computadora = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         c.nombre_equipo,
         c.direccion_ip,
         c.id_versionso,
         c.id_versionoffice,
         c.id_ram,
         c.id_disco,
         c.id_procesador,
         c.id_antivirus,
         c.id_dominio,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         vso.id_sistemaoperativo,
         e.observacion
       FROM equipo e
       LEFT JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN version_so vso ON vso.id_versionso = c.id_versionso
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!computadora.length) {
      return res.status(404).json({ error: "Computadora no encontrada" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ computadora: computadora[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora de bodega:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la computadora de bodega" });
  }
};

export const obtenerBodegaBajaSimple = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         e.observacion,
         ep.id_lampara
       FROM equipo e
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN equipo_proyector ep ON ep.id_equipo_proyector = e.id_equipo
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora de bodega:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la computadora de bodega" });
  }
};

export const obtenerBodegaBajaRed = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         e.observacion,
         er.mac,
         er.puertos,
         er.puerto_ftp,
         er.nombre_equipo
       FROM equipo e
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener el equipo de bodega:", error);
    res.status(500).json({ error: "Error al obtener el equipo de bodega" });
  }
};

export async function agregarComponentes(req, res) {
  const { tipo, equipoId, componentes, ubicacionId, usuarioId, imagenRuta } =
    req.body;

  try {
    for (const componente of componentes) {
      const result = await db.query(
        `INSERT INTO equipo (inventario, id_serie) VALUES (:inventario, :serieId);`,
        {
          replacements: {
            inventario: componente.inventario,
            serieId: componente.serieId,
          },
        }
      );

      const idComponente = result[0];

      await db.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId);`,
        {
          replacements: {
            idComponente,
            equipoId,
          },
        }
      );

      if (tipo === "activo") {
        await db.query(
          `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId);`,
          {
            replacements: {
              idComponente,
              ubicacionId,
              usuarioId,
            },
          }
        );

        await db.query(
          `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, (SELECT id_imagen FROM imagen WHERE ruta = :imagenRuta));`,
          {
            replacements: {
              idComponente,
              imagenRuta,
            },
          }
        );
      } else if (tipo == "bodega") {
        await db.query(
          `INSERT INTO equipo_baja (id_equipo) VALUES (:idComponente);`,
          {
            replacements: {
              idComponente,
              ubicacionId,
              usuarioId,
            },
          }
        );
      }
    }

    res.json({ message: "Componentes agregados correctamente" });
  } catch (error) {
    console.error("Error al agregar componentes:", error);
    res.status(500).json({ error: "Error al agregar componentes" });
  }
}

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }

  const imagePath = join("/uploads", req.file.filename);

  res.json({ imagePath });
}

export async function editarEquipo(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    id_ram,
    id_disco,
    id_procesador,
    id_versionso,
    id_versionoffice,
    id_antivirus,
    id_dominio,
    id_serie,
    inventario,
    anio_compra,
    nombre_equipo,
    direccion_ip,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
  } = req.body;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    if (imagenRuta && tipo === "activo") {
      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = 
          (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        const idImagenAntigua = imagenActual[0].id_imagen;

        const equiposRelacionados = await db.query(
          `SELECT id_equipo FROM equipo_imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.SELECT,
          }
        );

        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(
          `DELETE FROM imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.DELETE,
          }
        );

        const imagePath = join(__dirname, "..", imagenActual[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }

        const [result] = await db.query(
          `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
          {
            replacements: { imagenRuta },
            type: QueryTypes.INSERT,
          }
        );

        const nuevaImagenId = result;

        for (const equipo of equiposRelacionados) {
          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :nuevaImagenId)`,
            {
              replacements: { equipoId: equipo.id_equipo, nuevaImagenId },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, observacion = :observacion WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId, inventario, anio_compra, id_serie, observacion },
        type: QueryTypes.UPDATE,
      }
    );

    await db.query(
      `UPDATE computadora SET
        nombre_equipo = :nombre_equipo,
        direccion_ip = :direccion_ip,
        id_versionso = :id_versionso,
        id_versionoffice = :id_versionoffice,
        id_ram = :id_ram,
        id_disco = :id_disco,
        id_procesador = :id_procesador,
        id_antivirus = :id_antivirus,
        id_dominio = :id_dominio
      WHERE id_computadora = :equipoId`,
      {
        replacements: {
          equipoId,
          nombre_equipo,
          direccion_ip: direccion_ip || "",
          id_versionso,
          id_versionoffice,
          id_ram,
          id_disco,
          id_procesador,
          id_antivirus,
          id_dominio,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
          id_usuario = :id_usuario,
          id_ubicacion = :id_ubicacion
        WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function editarEquipoSimple(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    id_serie,
    inventario,
    anio_compra,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
    id_lampara,
  } = req.body;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    if (imagenRuta && tipo === "activo") {
      const esComponente = await db.query(
        `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen AND id_equipo = :equipoId`,
          {
            replacements: { idImagen: imagenActual[0].id_imagen, equipoId },
            type: QueryTypes.DELETE,
          }
        );

        if (!esComponente.length) {
          await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
            replacements: { idImagen: imagenActual[0].id_imagen },
            type: QueryTypes.DELETE,
          });

          const imagePath = join(__dirname, "..", imagenActual[0].ruta);
          if (existsSync(imagePath)) {
            unlinkSync(imagePath);
          }
        }
      }

      const [result] = await db.query(
        `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
        {
          replacements: { imagenRuta },
          type: QueryTypes.INSERT,
        }
      );

      const imagenId = result;

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, observacion = :observacion WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId, inventario, anio_compra, id_serie, observacion },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
          id_usuario = :id_usuario,
          id_ubicacion = :id_ubicacion
        WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (id_lampara !== undefined && id_lampara !== 0) {
      await db.query(
        `UPDATE equipo_proyector SET id_lampara = :id_lampara WHERE id_equipo_proyector = :equipoId`,
        {
          replacements: { id_lampara, equipoId },
          type: QueryTypes.UPDATE,
        }
      );
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function editarEquipoRed(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    id_serie,
    inventario,
    anio_compra,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
    mac,
    puertos,
    puerto_ftp,
    nombre_equipo,
  } = req.body;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    if (imagenRuta && tipo === "activo") {
      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
          {
            replacements: { idImagen: imagenActual[0].id_imagen },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
          replacements: { idImagen: imagenActual[0].id_imagen },
          type: QueryTypes.DELETE,
        });

        const imagePath = join(__dirname, "..", imagenActual[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }

      const [result] = await db.query(
        `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
        {
          replacements: { imagenRuta },
          type: QueryTypes.INSERT,
        }
      );

      const imagenId = result;

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, observacion = :observacion WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId, inventario, anio_compra, id_serie, observacion },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
                  id_usuario = :id_usuario,
                  id_ubicacion = :id_ubicacion
              WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (mac || puertos || puerto_ftp) {
      await db.query(
        `UPDATE equipo_red 
         SET mac = :mac, 
             puertos = :puertos, 
             puerto_ftp = :puerto_ftp,
             nombre_equipo = :nombre_equipo
         WHERE id_equipo_red = :equipoId`,
        {
          replacements: { equipoId, mac, puertos, puerto_ftp, nombre_equipo },
          type: QueryTypes.UPDATE,
        }
      );
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function gestionarComponentesEditados(req, res) {
  const { tipo, equipoId, componentes, ubicacionId, usuarioId, imagenRuta } =
    req.body;

  try {
    const componentesActuales = await db.query(
      `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const componentesIdsActuales = componentesActuales.map(
      (comp) => comp.id_componente
    );
    const componentesIdsNuevos = componentes
      .map((comp) => comp.id_componente)
      .filter((id) => id !== undefined);

    const idsAEliminar = componentesIdsActuales.filter(
      (id) => !componentesIdsNuevos.includes(id)
    );

    if (idsAEliminar.length > 0) {
      await db.query(
        `DELETE FROM componente WHERE id_componente IN (:idsAEliminar)`,
        {
          replacements: { idsAEliminar },
          type: QueryTypes.DELETE,
        }
      );
    }
    for (const componente of componentes) {
      if (componente.id_componente) {
      } else {
        const result = await db.query(
          `INSERT INTO equipo (inventario, id_serie) VALUES (:inventario, :serieId)`,
          {
            replacements: {
              inventario: componente.inventario,
              serieId: componente.serieId,
            },
          }
        );

        const idComponente = result[0];

        await db.query(
          `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId)`,
          {
            replacements: {
              idComponente,
              equipoId,
            },
          }
        );

        if (tipo === "activo") {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId)`,
            {
              replacements: {
                idComponente,
                ubicacionId,
                usuarioId,
              },
            }
          );

          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, (SELECT id_imagen FROM imagen WHERE ruta = :imagenRuta))`,
            {
              replacements: {
                idComponente,
                imagenRuta,
              },
            }
          );
        } else if (tipo === "bodega") {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente)`,
            {
              replacements: {
                idComponente,
              },
            }
          );
        }
      }
    }

    res.json({ message: "Componentes gestionados correctamente" });
  } catch (error) {
    console.error("Error al gestionar componentes:", error);
    res.status(500).json({ error: "Error al gestionar componentes" });
  }
}

export const pasarActivoABodega = async (req, res) => {
  const { equipoId } = req.params;

  try {
    const isComponente = await db.query(
      `SELECT 1 FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (isComponente.length > 0) {
      return res.status(400).json({
        error: "No se puede mover un componente a bodega directamente.",
      });
    }

    const equipoActivo = await db.query(
      `SELECT * FROM equipo_activo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipoActivo.length) {
      return res
        .status(400)
        .json({ error: "El equipo no se encuentra como activo." });
    }

    const imagen = await db.query(
      `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      await db.query(`DELETE FROM equipo_imagen WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `DELETE FROM equipo_imagen WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }

      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente)`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.INSERT,
            }
          );
          await db.query(
            `DELETE FROM equipo_activo WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
    } else {
      await db.query(`DELETE FROM equipo_imagen WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );
    }

    const imagePath = join(__dirname, "..", imagen[0].ruta);
    if (existsSync(imagePath)) {
      unlinkSync(imagePath);
    }

    res.json({
      message:
        "El equipo y sus componentes (si son computadora) han sido transferidos a bodega correctamente.",
    });
  } catch (error) {
    console.error("Error al transferir el equipo:", error);
    res.status(500).json({ error: "Error al transferir el equipo a bodega." });
  }
};

export const pasarBodegaAActivo = async (req, res) => {
  const { equipoId } = req.params;
  const { id_usuario, id_ubicacion, imagenRuta } = req.body;

  try {
    const isComponente = await db.query(
      `SELECT 1 FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (isComponente.length > 0) {
      return res.status(400).json({
        error: "No se puede mover un componente a bodega directamente.",
      });
    }

    const equipoBodega = await db.query(
      `SELECT * FROM equipo_bodega WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipoBodega.length) {
      return res
        .status(400)
        .json({ error: "El equipo no se encuentra en bodega." });
    }

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const imagenInsert = await db.query(
      `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
      {
        replacements: { imagenRuta },
        type: QueryTypes.INSERT,
      }
    );
    const imagenId = imagenInsert[0];

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:idComponente, :id_usuario, :id_ubicacion)`,
            {
              replacements: {
                idComponente: componente.id_componente,
                id_usuario,
                id_ubicacion,
              },
              type: QueryTypes.INSERT,
            }
          );

          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, :imagenId)`,
            {
              replacements: {
                idComponente: componente.id_componente,
                imagenId,
              },
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `DELETE FROM equipo_bodega WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
    } else {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    }

    res.json({
      message:
        "El equipo ha sido transferido a activo correctamente, y la imagen asociada.",
    });
  } catch (error) {
    console.error("Error al transferir el equipo:", error);
    res
      .status(500)
      .json({ error: "Error al transferir el equipo de bodega a activo." });
  }
};
