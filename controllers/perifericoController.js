import db from "../models/index.js"
export async function obtenerPerifericos(req, res) {
  try {
    const perifericos = await db.periferico.findAll({
      attributes: ['id_periferico', 'nombre'] 
    });

    return res.json(perifericos);

  } catch (error) {
    console.error('Error al obtener los perifericos:', error);
    return res.status(500).json({ error: 'Error al obtener los perifericos' });
  }
}
