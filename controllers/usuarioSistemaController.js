import { QueryTypes } from "sequelize";
import db from "../models/index.js";

export async function obtenerUsuariosSistema(req, res) {
  const { rolId, usuarioId, limit, offset } = req.query;

  try {
    const query = `
      SELECT 
        u.id_usuario_sistema, 
        u.correo,
        r.nombre AS rol,
        COUNT(*) OVER() AS total
      FROM usuario_sistema u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE (:rolId IS NULL OR r.id_rol = :rolId)
        AND (:usuarioId IS NULL OR u.id_usuario_sistema = :usuarioId)
      LIMIT :limit OFFSET :offset;
    `;

    const usuarios = await db.query(query, {
      replacements: {
        rolId: rolId || null,
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

export async function agregarUsuarioSistema(req, res) {
  const { correo, rolId } = req.body;

  if (!correo || !rolId) {
    return res.status(400).json({ error: "Se requiere tanto el correo como el ID de rol" });
  }

  try {
    const query = `
      INSERT INTO usuario_sistema (correo, id_rol)
      VALUES (:correo, :rolId)
    `;

    const result = await db.query(query, {
      replacements: { correo, rolId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Usuario agregado exitosamente",
      usuario: { correo, rolId },
      id_usuario_sistema: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el usuario:", error);
    res.status(500).json({ error: "Error al agregar el usuario" });
  }
}

export async function editarUsuarioSistema(req, res) {
  const { id_usuario_sistema } = req.params;
  const { nuevoCorreo, nuevoRolId } = req.body;

  try {
    if (!nuevoCorreo || !nuevoRolId) {
      return res.status(400).json({ error: "Faltan parámetros para la actualización" });
    }

    const query = `
      UPDATE usuario_sistema
      SET correo = :nuevoCorreo, id_rol = :nuevoRolId
      WHERE id_usuario_sistema = :id_usuario_sistema;
    `;

    const result = await db.query(query, {
      replacements: {
        id_usuario_sistema, 
        nuevoCorreo,
        nuevoRolId,
      },
      type: QueryTypes.UPDATE,
    });

    if (result[1] > 0) {
      res.json({ message: "Usuario actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
}

export async function eliminarUsuarioSistema(req, res) {
  const { id_usuario_sistema } = req.params;

  try {

    const deleteUserQuery = `
      DELETE FROM usuario_sistema
      WHERE id_usuario_sistema = :id_usuario_sistema;
    `;

    await db.query(deleteUserQuery, {
      replacements: { id_usuario_sistema },
      type: QueryTypes.DELETE,
    });

    res.json({ message: "Usuario eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario." });
  }
}


