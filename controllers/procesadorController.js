import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Procesador from '../models/procesador.js';

export async function obtenerProcesadores(req, res) {
  try {
    const procesadores = await Procesador.findAll({
      attributes: ['id_procesador', 'nombre'] 
    });

    return res.json(procesadores);

  } catch (error) {
    console.error('Error al obtener procesadores:', error);
    return res.status(500).json({ error: 'Error al obtener procesadores' });
  }
}

export async function agregarProcesador(req, res) {
    const { nombre } = req.body;
  
    if (!nombre) {
      return res
        .status(400)
        .json({ error: "Se requiere el nombre" });
    }
  
    try {
      const queryProcesador = `
        INSERT INTO procesador (nombre)
        VALUES (:nombre)
      `;
      const resultProcesador = await db.query(queryProcesador, {
        replacements: { nombre },
        type: QueryTypes.INSERT,
      });
  
      const id_procesador = resultProcesador[0];
  
      res.status(201).json({
        mensaje: "Procesador agregado",
        id_procesador,
      });
    } catch (error) {
      console.error("Error al agregar procesador:", error);
      res.status(500).json({ error: "Error al agregar procesador" });
    }
  }
  
  export async function editarProcesador(req, res) {
    const { id_procesador, nuevoNombre } = req.body;
  
    try {
      const procesador = await Procesador.findByPk(id_procesador);
  
      if (!procesador) {
        return res.status(404).json({ error: 'Procesador no encontrado' });
      }
  
      await procesador.update({ nombre: nuevoNombre });
  
      return res.json({ message: 'Procesador actualizado correctamente', procesador });
    } catch (error) {
      console.error('Error al actualizar el procesador:', error);
      return res.status(500).json({ error: 'Error al actualizar el procesador' });
    }
  }

  export async function eliminarProcesador(req, res) {
    const { id_procesador } = req.params;
  
    try {
      const procesador = await Procesador.findByPk(id_procesador);
  
      if (!procesador) {
        return res.status(404).json({ error: 'Procesador no encontrado' });
      }

      const computadorasRelacionadas = await db.query(
        `SELECT COUNT(*) as count FROM computadora WHERE id_procesador = :id_procesador`,
        {
          replacements: { id_procesador },
          type: QueryTypes.SELECT
        }
      );

      if (computadorasRelacionadas[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el procesador porque tiene computadoras asociadas' 
        });
      }
  
      await procesador.destroy();
  
      return res.json({ message: 'Procesador eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el procesador:', error);
      return res.status(500).json({ error: 'Error al eliminar el procesador' });
    }
  }