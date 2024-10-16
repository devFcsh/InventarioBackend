import { dominio } from '../models'; 

async function obtenerDominios(req, res) {
  try {
    const dominios = await dominio.findAll({
      attributes: ['id_dominio', 'nombre'] 
    });

    return res.json(dominios);

  } catch (error) {
    console.error('Error al obtener los dominios:', error);
    return res.status(500).json({ error: 'Error al obtener los dominios' });
  }
}

export default {
    obtenerDominios,
};