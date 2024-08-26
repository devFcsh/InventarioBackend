const sequelize = require("../models/index.js").sequelize;
var initModels = require("../models/init-models.js");
var models = initModels(sequelize);

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
    count(id_equipo) as total
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
  AND (:inventario IS NULL OR e.inventario = :inventario); `;

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
    u.tipo AS uso,
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

async function eliminarEquipo(req, res) {
  const { idEquipo } = req.params;

  if (!idEquipo) {
    return res.status(400).json({ error: "ID del equipo es requerido" });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      await sequelize.query(
        `DELETE FROM computadora WHERE id_computadora IN (
          SELECT id_computadora FROM equipo WHERE id_equipo = :idEquipo
        )`, 
        { 
          replacements: { idEquipo }, 
          type: sequelize.QueryTypes.DELETE,
          transaction: t
        }
      );

      await sequelize.query(
        `DELETE FROM componente WHERE id_componente IN (
          SELECT id_equipo FROM equipo WHERE id_equipo = :idEquipo
        )`, 
        { 
          replacements: { idEquipo }, 
          type: sequelize.QueryTypes.DELETE,
          transaction: t
        }
      );

      await sequelize.query(
        `DELETE FROM equipo_Activo WHERE id_activo = (
          SELECT id_clasificacion FROM equipo WHERE id_equipo = :idEquipo
        )`, 
        { 
          replacements: { idEquipo }, 
          type: sequelize.QueryTypes.DELETE,
          transaction: t
        }
      );

      await sequelize.query(
        `DELETE FROM clasificacion WHERE id_clasificacion = (
          SELECT id_clasificacion FROM equipo WHERE id_equipo = :idEquipo
        )`, 
        { 
          replacements: { idEquipo }, 
          type: sequelize.QueryTypes.DELETE,
          transaction: t
        }
      );

      // Paso 5: Eliminar el registro del equipo en la tabla 'equipo'
      await sequelize.query(
        `DELETE FROM equipo WHERE id_equipo = :idEquipo`, 
        { 
          replacements: { idEquipo }, 
          type: sequelize.QueryTypes.DELETE,
          transaction: t
        }
      );
      
      return { success: true };
    });

    res.json(result);
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
}


module.exports = {
  contarEquipos,
  obtenerEquipos,
  eliminarEquipo
};
