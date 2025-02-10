import { QueryTypes } from "sequelize";
import db from "../models/index.js";

export async function obtenerUsuarios(req, res) {
  const { usoId, usuarioId, limit, offset } = req.query;

  try {
    const query = `
      SELECT 
        u.id_usuario, 
        us.id_uso,
        us.nombre AS uso, 
        u.nombre,
        COUNT(*) OVER() AS total
      FROM usuario u
      JOIN uso us ON u.id_uso = us.id_uso
      WHERE (:usoId IS NULL OR us.id_uso = :usoId)
        AND (:usuarioId IS NULL OR u.id_usuario = :usuarioId)
      LIMIT :limit OFFSET :offset;
    `;

    const usuarios = await db.query(query, {
      replacements: {
        usoId: usoId || null,
        usuarioId: usuarioId || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: QueryTypes.SELECT,
    });

    const total = usuarios.length > 0 ? usuarios[0].total : 0;

    res.json({ total, usuarios });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
}

export async function obtenerUsuariosPorUso(req, res) {
  const { idUso } = req.params;

  try {
    const results = await db.query(
      `SELECT u.id_usuario, u.nombre 
       FROM usuario u
       JOIN uso us ON u.id_uso = us.id_uso
       WHERE us.id_uso = :idUso`,
      {
        replacements: { idUso: idUso },
        type: QueryTypes.SELECT,
      }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: "Unexpected response format" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron usuarios para el uso seleccionado" });
    }

    return res.json(results);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  }
}

export async function agregarUsuario(req, res) {
  const { nombre, usoId } = req.body;

  if (!nombre || !usoId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de uso" });
  }

  try {
    const query = `
      INSERT INTO usuario (nombre, id_uso)
      VALUES (:nombre, :usoId)
    `;

    const result = await db.query(query, {
      replacements: { nombre, usoId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Usuario agregado exitosamente",
      usuario: { nombre, usoId },
      id_usuario: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).json({ error: "Error al agregar el usuario" });
  }
}

export async function editarUsuario(req, res) {
  const { id_usuario } = req.params;
  const { nuevoNombre, nuevoUsoId } = req.body;

  try {
    if (!nuevoNombre || !nuevoUsoId) {
      return res.status(400).json({ error: "Faltan parámetros para la actualización" });
    }

    const query = `
      UPDATE usuario
      SET nombre = :nuevoNombre, id_uso = :nuevoUsoId
      WHERE id_usuario = :id_usuario;
    `;

    const result = await db.query(query, {
      replacements: {
        id_usuario, 
        nuevoNombre,
        nuevoUsoId,
      },
      type: QueryTypes.UPDATE,
    });
    console.log(result[1])

    if (id_usuario > 0) {
      res.json({ message: "Usuario actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
}

export async function eliminarUsuario(req, res) {
  const { id_usuario } = req.params;

  try {
    const checkEquiposQuery = `
      SELECT COUNT(*) AS totalEquipos
      FROM equipo_Activo ea
      WHERE ea.id_usuario = :id_usuario;
    `;

    const result = await db.query(checkEquiposQuery, {
      replacements: { id_usuario },
      type: QueryTypes.SELECT,
    });

    if (result[0].totalEquipos > 0) {
      return res.status(400).json({
        error: "No se puede eliminar al usuario porque tiene equipos asociados.",
        tieneEquipos: true,
      });
    }

    const deleteUserQuery = `
      DELETE FROM usuario
      WHERE id_usuario = :id_usuario;
    `;

    await db.query(deleteUserQuery, {
      replacements: { id_usuario },
      type: QueryTypes.DELETE,
    });

    res.json({ message: "Usuario eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario." });
  }
}

