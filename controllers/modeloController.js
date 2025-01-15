import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Modelo from '../models/Modelo.js';

export async function obtenerModelos(req, res) {
    try {
      const modelos = await Modelo.findAll({
        attributes: ['id_modelo', 'nombre'] 
      });
  
      return res.json(modelos);
  
    } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
    }
}

export async function modelosPorMarcaPeriferico(req, res) {
  const { marcaId, perifericoId } = req.query;

  try {
      const modelos = await db.query(
          `SELECT mo.id_modelo, mo.nombre 
          FROM modelo mo
          JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
          JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
          WHERE mp.id_marca = :marcaId AND mp.id_periferico = :perifericoId`,
          {
              replacements: { marcaId, perifericoId },
              type: QueryTypes.SELECT
          }
      );

      if (modelos.length === 0) {
          return res.status(404).json({ error: 'Modelos no encontrados para la marca y periférico seleccionados' });
      }

      return res.json(modelos);

  } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
  }
};

export async function agregarModelo(req, res) {
  const { nombre, marcaId } = req.body;

  if (!nombre || !marcaId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de marca" });
  }

  try {
    const queryModelo = `
      INSERT INTO modelo (nombre)
      VALUES (:nombre)
    `;
    const resultModelo = await db.query(queryModelo, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    const id_modelo = resultModelo[0];

    const queryModeloMarca = `
      INSERT INTO marca_modelo (id_marca, id_modelo)
      VALUES (:marcaId, :id_modelo)
    `;
    await db.query(queryModeloMarca, {
      replacements: { marcaId, id_modelo },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Modelo agregado y asociado exitosamente a la marca",
      marca: { nombre },
      id_modelo,
      id_marca: marcaId,
    });
  } catch (error) {
    console.error("Error al agregar modelo y asociar marca:", error);
    res.status(500).json({ error: "Error al agregar modelo y asociar marca" });
  }
}

export async function editarModelo(req, res) {
  const { id_modelo, nuevoNombre } = req.body;

  try {
    const modelo = await Modelo.findByPk(id_modelo);

    if (!modelo) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    await modelo.update({ nombre: nuevoNombre });

    return res.json({ message: 'Modelo actualizado correctamente', modelo });
  } catch (error) {
    console.error('Error al actualizar el modelo:', error);
    return res.status(500).json({ error: 'Error al actualizar el modelo' });
  }
}

export async function eliminarModelo(req, res) {
  const { id_modelo } = req.params;

  try {
    const modelo = await Modelo.findByPk(id_modelo);

    if (!modelo) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    await modelo.destroy();

    return res.json({ message: 'Modelo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el modelo:', error);
    return res.status(500).json({ error: 'Error al eliminar el modelo' });
  }
}