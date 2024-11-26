import  Disco  from '../models/disco.js'; 

export async function obtenerDiscos(req, res) {
  try {
    const discos = await Disco.findAll({
      attributes: ['id_disco', 'capacidad'] 
    });

    return res.json(discos);

  } catch (error) {
    console.error('Error al obtener los discos:', error);
    return res.status(500).json({ error: 'Error al obtener los discos' });
  }
}

export async function agregarEdificio(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO edificio (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Edificio agregado exitosamente",
      edificio: { nombre },
      id_edificio: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el edificio:", error);
    res.status(500).json({ error: "Error al agregar el edificio" });
  }
}