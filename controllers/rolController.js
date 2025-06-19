import { QueryTypes } from 'sequelize';

export async function obtenerRoles(req, res) {
  try {
    const results = await db.query(
      `SELECT * FROM rol`, 
      { type: QueryTypes.SELECT }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Formato de respuesta inesperado' });
    }

    return res.json(results); 
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    return res.status(500).json({ error: 'Error al obtener los roles' });
  }
}

export async function agregarRol(req, res) {
  const { nombre_rol } = req.body;

  if (!nombre_rol) {
    return res.status(400).json({ error: "Se requiere el nombre del rol" });
  }

  try {
    const query = `
      INSERT INTO rol (nombre_rol)
      VALUES (:nombre_rol)
    `;

    const result = await db.query(query, {
      replacements: { nombre_rol },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Rol agregado exitosamente",
      rol: { nombre_rol },
      id_rol: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el rol:", error);
    res.status(500).json({ error: "Error al agregar el rol" });
  }
}

export async function editarRol(req, res) {
  const { id_rol, nuevoNombre } = req.body;

  try {
    const rol = await db.query(
      `SELECT * FROM rol WHERE id_rol = :id_rol`, 
      { replacements: { id_rol }, type: QueryTypes.SELECT }
    );

    if (!rol || rol.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const query = `
      UPDATE rol
      SET nombre_rol = :nuevoNombre
      WHERE id_rol = :id_rol
    `;
    
    await db.query(query, {
      replacements: { id_rol, nuevoNombre },
      type: QueryTypes.UPDATE,
    });

    return res.json({ message: 'Rol actualizado correctamente', rol: { id_rol, nuevoNombre } });
  } catch (error) {
    console.error('Error al actualizar el rol:', error);
    return res.status(500).json({ error: 'Error al actualizar el rol' });
  }
}

export async function eliminarRol(req, res) {
  const { id_rol } = req.params;

  try {
    const rol = await db.query(
      `SELECT * FROM rol WHERE id_rol = :id_rol`, 
      { replacements: { id_rol }, type: QueryTypes.SELECT }
    );

    if (!rol || rol.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const query = `DELETE FROM rol WHERE id_rol = :id_rol`;
    await db.query(query, {
      replacements: { id_rol },
      type: QueryTypes.DELETE,
    });

    return res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el rol:', error);
    return res.status(500).json({ error: 'Error al eliminar el rol' });
  }
}
