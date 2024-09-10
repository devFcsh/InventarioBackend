const sequelize = require("../models/index.js").sequelize;


async function contarEquipos(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
  } = req.query;

  try {
    const query = `
SELECT 
    COUNT(e.id_equipo) AS total
FROM equipo e
JOIN periferico p ON e.id_periferico = p.id_periferico
JOIN marca_periferico mp ON p.id_periferico = mp.id_periferico
JOIN marca m ON mp.id_marca = m.id_marca
JOIN marca_modelo mm ON m.id_marca = mm.id_marca
JOIN modelo mo ON mm.id_modelo = mo.id_modelo
JOIN modelo_serie ms ON mo.id_modelo = ms.id_modelo
JOIN serie s ON ms.id_serie = s.id_serie
JOIN clasificacion c ON e.id_clasificacion = c.id_clasificacion
JOIN equipo_Activo ea ON c.id_clasificacion = ea.id_activo
JOIN usuario u ON ea.id_usuario = u.id_usuario
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario);`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    res.status(500).json({ error: "Error al obtener equipos" });
  }
}

async function obtenerEquipos(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
    limit,
    offset,
  } = req.query;

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
    ea.edificio
FROM equipo e
JOIN periferico p ON e.id_periferico = p.id_periferico
JOIN marca_periferico mp ON p.id_periferico = mp.id_periferico
JOIN marca m ON mp.id_marca = m.id_marca
JOIN marca_modelo mm ON m.id_marca = mm.id_marca
JOIN modelo mo ON mm.id_modelo = mo.id_modelo
JOIN modelo_serie ms ON mo.id_modelo = ms.id_modelo
JOIN serie s ON ms.id_serie = s.id_serie
JOIN clasificacion c ON e.id_clasificacion = c.id_clasificacion
JOIN equipo_Activo ea ON c.id_clasificacion = ea.id_activo
JOIN usuario u ON ea.id_usuario = u.id_usuario
JOIN uso ON u.id_uso = uso.id_uso
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario)
LIMIT :limit OFFSET :offset; `;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    res.status(500).json({ error: "Error al obtener equipos" });
  }
}

async function eliminarImagenesEquipoActivo(equipoId) {
  try {
    const eliminarImagenesQuery = `
      DELETE FROM equipo_imagen
      WHERE id_equipo = :equipoId;
    `;
    await sequelize.query(eliminarImagenesQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    console.log('Imágenes del equipo eliminadas con éxito');
  } catch (error) {
    console.error("Error al eliminar las imágenes del equipo:", error);
    throw error;
  }
}

async function eliminarActivoComputadora(req, res) {
  const { equipoId } = req.params;

  try {
    await eliminarImagenesEquipoActivo(equipoId);

    const eliminarComputadoraQuery = `
      DELETE FROM computadora
      WHERE id_computadora = :equipoId;
    `;
    await sequelize.query(eliminarComputadoraQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    const eliminarEquipoQuery = `
      DELETE FROM equipo
      WHERE id_equipo = :equipoId;
    `;
    await sequelize.query(eliminarEquipoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    const eliminarClasificacionYActivoQuery = `
      DELETE ea, c
      FROM equipo_Activo ea
      JOIN clasificacion c ON ea.id_activo = c.id_clasificacion
      WHERE c.id_clasificacion = (
        SELECT id_clasificacion FROM equipo WHERE id_equipo = :equipoId
      );
    `;
    await sequelize.query(eliminarClasificacionYActivoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({ message: 'Equipo activo con computadora eliminado con éxito' });
  } catch (error) {
    console.error("Error al eliminar el equipo activo con computadora:", error);
    res.status(500).json({ error: 'Error al eliminar el equipo activo con computadora' });
  }
}

async function eliminarActivoComponente(req, res) {
  const { equipoId } = req.params;

  try {
    await eliminarImagenesEquipoActivo(equipoId);

    const eliminarComponenteQuery = `
      DELETE FROM componente
      WHERE id_computadora = :equipoId;
    `;
    await sequelize.query(eliminarComponenteQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    const eliminarEquipoQuery = `
      DELETE FROM equipo
      WHERE id_equipo = :equipoId;
    `;
    await sequelize.query(eliminarEquipoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    const eliminarClasificacionYActivoQuery = `
      DELETE ea, c
      FROM equipo_Activo ea
      JOIN clasificacion c ON ea.id_activo = c.id_clasificacion
      WHERE c.id_clasificacion = (
        SELECT id_clasificacion FROM equipo WHERE id_equipo = :equipoId
      );
    `;
    await sequelize.query(eliminarClasificacionYActivoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({ message: 'Equipo activo con componente eliminado con éxito' });
  } catch (error) {
    console.error("Error al eliminar el equipo activo con componente:", error);
    res.status(500).json({ error: 'Error al eliminar el equipo activo con componente' });
  }
}

async function eliminarActivoOtro(req, res) {
  const { equipoId } = req.params;

  try {
    await eliminarImagenesEquipoActivo(equipoId);

    const eliminarEquipoQuery = `
      DELETE FROM equipo
      WHERE id_equipo = :equipoId;
    `;
    await sequelize.query(eliminarEquipoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    const eliminarClasificacionYActivoQuery = `
      DELETE ea, c
      FROM equipo_Activo ea
      JOIN clasificacion c ON ea.id_activo = c.id_clasificacion
      WHERE c.id_clasificacion = (
        SELECT id_clasificacion FROM equipo WHERE id_equipo = :equipoId
      );
    `;
    await sequelize.query(eliminarClasificacionYActivoQuery, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({ message: 'Equipo activo eliminado con éxito' });
  } catch (error) {
    console.error("Error al eliminar el equipo activo:", error);
    res.status(500).json({ error: 'Error al eliminar el equipo activo' });
  }
}


module.exports = {
  contarEquipos,
  obtenerEquipos,
  eliminarActivoComputadora,
  eliminarActivoComponente,
  eliminarActivoOtro
};
