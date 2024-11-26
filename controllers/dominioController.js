import Dominio from '../models/dominio.js';

export async function obtenerDominios(req, res) {
  try {
    const dominios = await Dominio.findAll({
      attributes: ['id_dominio', 'nombre'] 
    });

    return res.json(dominios);

  } catch (error) {
    console.error('Error al obtener los dominios:', error);
    return res.status(500).json({ error: 'Error al obtener los dominios' });
  }
}

export async function agregarDominio(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO dominio (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Dominio agregado exitosamente",
      dominio: { nombre },
      id_dominio: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el dominio:", error);
    res.status(500).json({ error: "Error al agregar el dominio" });
  }
}