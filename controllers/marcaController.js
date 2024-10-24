import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Marca  from '../models/marca.js'; 

export async function obtenerMarcas(req, res) {
  try {
    const marcas = await Marca.findAll({
      attributes: ['id_marca', 'nombre'] 
    });

    return res.json(marcas);

  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
}

export async function obtenerMarcasPorPeriferico(req, res) {
  const { perifericoId } = req.params;
  
  try {
    const results = await db.query(
      `SELECT m.id_marca, m.nombre
       FROM marca m
       JOIN marca_periferico mp ON m.id_marca = mp.id_marca
       JOIN periferico p ON mp.id_periferico = p.id_periferico
       WHERE p.id_periferico = :idPeriferico`, 
      {
        replacements: { idPeriferico: perifericoId }, 
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Periférico no encontrado' });
    }

    return res.json(results); 

  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
}

