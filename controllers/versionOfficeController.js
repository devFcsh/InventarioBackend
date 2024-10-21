import  version_office  from '../models/version_office.js';

export async function obtenerVersionesOffice(req, res) {

  try {
    const versionesOffice = await version_office.findAll({
      attributes: ['id_versionoffice', 'nombre']
    });

    return res.json(versionesOffice);

  } catch (error) {
    console.error('Error al obtener las versiones de Office:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de Office' });
  }
}

