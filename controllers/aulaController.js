import  Aula  from '../models/aula.js';

export async function obtenerAulas(req, res) {
  const { id_edificio } = req.params; 

  try {
    const aulas = await Aula.findAll({
      attributes: ['id_aula', 'nombre'],
      where: {
        id_edificio: id_edificio, 
      },
    });

    return res.json(aulas);

  } catch (error) {
    console.error('Error al obtener las aulas:', error);
    return res.status(500).json({ error: 'Error al obtener las aulas' });
  }
}

