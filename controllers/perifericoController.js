import  periferico_modelo  from '../models/periferico_modelo.js'; 

export async function obtenerPerifericos(req, res) {
  try {
    const perifericos = await periferico_modelo.findAll({
      attributes: ['id_periferico', 'nombre'] 
    });

    return res.json(perifericos);

  } catch (error) {
    console.error('Error al obtener los perifericos:', error);
    return res.status(500).json({ error: 'Error al obtener los perifericos' });
  }
}
