import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Lampara from '../models/lampara.js';

export async function obtenerLamparas(req, res) {
  try {
    const lamparas = await Lampara.findAll({
      attributes: ['id_lampara', 'nombre'] 
    });

    return res.json(lamparas);

  } catch (error) {
    console.error('Error al obtener las lamparas:', error);
    return res.status(500).json({ error: 'Error al obtener las lamparas' });
  }
}

export async function lamparasPorModelo(req, res) {
    const { perifericoId, marcaId, modeloId } = req.query;

    try {
      const query = `
        SELECT DISTINCT l.id_lampara, l.nombre
        FROM modelo_lampara ml
        JOIN lampara l ON ml.id_lampara = l.id_lampara
        JOIN marca_modelo mm ON ml.id_modelo = mm.id_modelo
        JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
        WHERE (:perifericoId IS NULL OR mp.id_periferico = :perifericoId)
        AND (:marcaId IS NULL OR mm.id_marca = :marcaId)
        AND (:modeloId IS NULL OR mm.id_modelo = :modeloId);
      `;
  
      const lamparas = await db.query(query, {
        replacements: {
          perifericoId: perifericoId || null,
          marcaId: marcaId || null,
          modeloId: modeloId || null,
        },
        type: QueryTypes.SELECT,
      });
  
      res.json(lamparas);
    } catch (error) {
      console.error('Error al obtener lamparas:', error);
      res.status(500).json({ error: 'Error al obtener lamparas' });
    }
  };  
  
  export async function agregarLampara(req, res) {
    const { nombre, modeloId } = req.body;
  
    if (!nombre || !modeloId) {
      return res
        .status(400)
        .json({ error: "Se requiere tanto el nombre como el ID de modelo" });
    }
  
    try {
      const queryLampara = `
        INSERT INTO lampara (nombre)
        VALUES (:nombre)
      `;
      const resultLampara = await db.query(queryLampara, {
        replacements: { nombre },
        type: QueryTypes.INSERT,
      });
  
      const id_lampara = resultLampara[0];
  
      const queryModeloLampara = `
        INSERT INTO modelo_lampara (id_modelo, id_lampara)
        VALUES (:modeloId, :id_lampara)
      `;
      await db.query(queryModeloLampara, {
        replacements: { modeloId, id_lampara },
        type: QueryTypes.INSERT,
      });
  
      res.status(201).json({
        mensaje: "Lampara agregada y asociada exitosamente al modelo",
        lampara: { nombre },
        id_lampara,
        id_modelo: modeloId,
      });
    } catch (error) {
      console.error("Error al agregar lampara y asociar modelo:", error);
      res.status(500).json({ error: "Error al agregar lampara y asociar modelo" });
    }
  }
  
  export async function editarLampara(req, res) {
    const { id_lampara, nuevoNombre } = req.body;
  
    try {
      const lampara = await Lampara.findByPk(id_lampara);
  
      if (!lampara) {
        return res.status(404).json({ error: 'Lampara no encontrado' });
      }
  
      await lampara.update({ nombre: nuevoNombre });
  
      return res.json({ message: 'Lampara actualizado correctamente', lampara });
    } catch (error) {
      console.error('Error al actualizar lampara:', error);
      return res.status(500).json({ error: 'Error al actualizar lampara' });
    }
  }

  export async function eliminarLampara(req, res) {
    const { id_lampara } = req.params;
  
    try {
      const lampara = await Lampara.findByPk(id_lampara);
  
      if (!lampara) {
        return res.status(404).json({ error: 'Lampara no encontrada' });
      }

      const modelosRelacionados = await db.query(
        `SELECT COUNT(*) as count FROM modelo_lampara WHERE id_lampara = :id_lampara`,
        {
          replacements: { id_lampara },
          type: QueryTypes.SELECT
        }
      );

      if (modelosRelacionados[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la lámpara porque tiene modelos asociados' 
        });
      }

      const proyectoresRelacionados = await db.query(
        `SELECT COUNT(*) as count FROM equipo_proyector WHERE id_lampara = :id_lampara`,
        {
          replacements: { id_lampara },
          type: QueryTypes.SELECT
        }
      );

      if (proyectoresRelacionados[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la lámpara porque está siendo utilizada en proyectores' 
        });
      }
  
      await lampara.destroy();
  
      return res.json({ message: 'Lámpara eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la lámpara:', error);
      return res.status(500).json({ error: 'Error al eliminar la lámpara' });
    }
  }