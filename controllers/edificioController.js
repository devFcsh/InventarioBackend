import  edificio  from '../models/edificio.js';

export async function obtenerEdificios(req, res) {

  try {
    const edificios = await edificio.findAll({
      attributes: ['id_edificio', 'nombre']
    });

    return res.json(edificios);

  } catch (error) {
    console.error('Error al obtener edificios:', error);
    return res.status(500).json({ error: 'Error al obtener edificios' });
  }
}

