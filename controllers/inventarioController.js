import { QueryTypes } from 'sequelize';
import db from '../models/index.js';

export async function obtenerInventarios(req, res) {
  try {
    const query = `
      SELECT DISTINCT e.inventario
      FROM equipo e
    `;

    const inventarios = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    res.json(inventarios);
  } catch (error) {
    console.error('Error al obtener inventarios:', error);
    res.status(500).json({ error: 'Error al obtener inventarios' });
  }
}

export async function inventarioPorSerie(req, res) {
  const { perifericoId, marcaId, modeloId, serieId } = req.query;

  try {
    const query = `
       SELECT DISTINCT e.inventario
        FROM equipo e
        JOIN serie s ON s.id_serie = e.id_serie 
        JOIN modelo_serie ms ON s.id_serie = ms.id_serie
        JOIN marca_modelo mm ON ms.id_modelo = mm.id_modelo
        JOIN marca_periferico mp ON mp.id_marca = mm.id_marca
        WHERE (:perifericoId IS NULL OR mp.id_periferico = :perifericoId)
        AND (:marcaId IS NULL OR mm.id_marca = :marcaId)
        AND (:modeloId IS NULL OR mm.id_modelo = :modeloId)
        AND (:serieId IS NULL OR ms.id_serie = :serieId);
      `;

    const inventarios = await db.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
      },
      type: QueryTypes.SELECT,
    });

    res.json(inventarios);
  } catch (error) {
    console.error('Error al obtener inventarios:', error);
    res.status(500).json({ error: 'Error al obtener inventarios' });
  }
}

export async function existeInventario(req, res) {
  const { inventario } = req.query;

  if (!inventario) {
    return res.status(400).json({ error: 'Se requiere el inventario' });
  }

  try {
    const resultado = await db.query(
      `SELECT id_equipo, inventario FROM equipo WHERE LOWER(TRIM(inventario)) = :inventario LIMIT 1`,

      {
        replacements: { inventario: String(inventario).trim().toLowerCase() },

        type: QueryTypes.SELECT,
      }
    );

    if (resultado.length) {
      return res.json({ existe: true, equipo: resultado[0] });
    } else {
      return res.json({ existe: false });
    }
  } catch (error) {
    console.error('Error al consultar inventario:', error);

    return res.status(500).json({ error: 'Error al consultar inventario' });
  }
}

export async function existeInventario(req, res) {
  const { inventario } = req.query;
  if (!inventario) {
    return res.status(400).json({ error: "Se requiere el inventario" });
  }
  try {
    const resultado = await db.query(
      `SELECT id_equipo, inventario FROM equipo WHERE LOWER(TRIM(inventario)) = :inventario LIMIT 1`,
      {
        replacements: { inventario: String(inventario).trim().toLowerCase() },
        type: QueryTypes.SELECT,
      }
    );
    if (resultado.length) {
      return res.json({ existe: true, equipo: resultado[0] });
    } else {
      return res.json({ existe: false });
    }
  } catch (error) {
    console.error("Error al consultar inventario:", error);
    return res.status(500).json({ error: "Error al consultar inventario" });
  }
}