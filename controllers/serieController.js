import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Serie from '../models/serie.js';

export async function obtenerSeries(req, res) {
  try {
    const series = await Serie.findAll({
      attributes: ['id_serie', 'nombre'] 
    });

    return res.json(series);

  } catch (error) {
    console.error('Error al obtener las series:', error);
    return res.status(500).json({ error: 'Error al obtener las series' });
  }
}

export async function seriesPorModelo(req, res) {
    const { perifericoId, marcaId, modeloId } = req.query;

    try {
      const query = `
        SELECT DISTINCT s.id_serie, s.nombre
        FROM modelo_serie ms
        JOIN serie s ON ms.id_serie = s.id_serie
        JOIN marca_modelo mm ON ms.id_modelo = mm.id_modelo
        JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
        WHERE (:perifericoId IS NULL OR mp.id_periferico = :perifericoId)
        AND (:marcaId IS NULL OR mm.id_marca = :marcaId)
        AND (:modeloId IS NULL OR ms.id_modelo = :modeloId);
      `;
  
      const series = await db.query(query, {
        replacements: {
          perifericoId: perifericoId || null,
          marcaId: marcaId || null,
          modeloId: modeloId || null,
        },
        type: QueryTypes.SELECT,
      });
  
      res.json(series);
    } catch (error) {
      console.error('Error al obtener series:', error);
      res.status(500).json({ error: 'Error al obtener series' });
    }
  };  
  
  export async function agregarSerie(req, res) {
    const { nombre, modeloId } = req.body;
  
    if (!nombre || !modeloId) {
      return res
        .status(400)
        .json({ error: "Se requiere tanto el nombre como el ID de modelo" });
    }
  
    try {
      const querySerie = `
        INSERT INTO serie (nombre)
        VALUES (:nombre)
      `;
      const resultSerie = await db.query(querySerie, {
        replacements: { nombre },
        type: QueryTypes.INSERT,
      });
  
      const id_serie = resultSerie[0];
  
      const queryModeloSerie = `
        INSERT INTO modelo_serie (id_modelo, id_serie)
        VALUES (:modeloId, :id_serie)
      `;
      await db.query(queryModeloSerie, {
        replacements: { modeloId, id_serie },
        type: QueryTypes.INSERT,
      });
  
      res.status(201).json({
        mensaje: "Serie agregada y asociada exitosamente al modelo",
        serie: { nombre },
        id_serie,
        id_modelo: modeloId,
      });
    } catch (error) {
      console.error("Error al agregar serie y asociar modelo:", error);
      res.status(500).json({ error: "Error al agregar serie y asociar modelo" });
    }
  }
  
  export async function editarSerie(req, res) {
    const { id_serie, nuevoNombre } = req.body;
  
    try {
      const serie = await Serie.findByPk(id_serie);
  
      if (!serie) {
        return res.status(404).json({ error: 'Serie no encontrado' });
      }
  
      await serie.update({ nombre: nuevoNombre });
  
      return res.json({ message: 'Serie actualizado correctamente', serie });
    } catch (error) {
      console.error('Error al actualizar el serie:', error);
      return res.status(500).json({ error: 'Error al actualizar el serie' });
    }
  }

  export async function eliminarSerie(req, res) {
    const { id_serie } = req.params;
  
    try {
      const serie = await Serie.findByPk(id_serie);
  
      if (!serie) {
        return res.status(404).json({ error: 'Serie no encontrado' });
      }
  
      await serie.destroy();
  
      return res.json({ message: 'Serie eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el serie:', error);
      return res.status(500).json({ error: 'Error al eliminar el serie' });
    }
  }
