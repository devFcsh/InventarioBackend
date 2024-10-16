import { version_so } from '../models';

async function obtenerVersionesSO(req, res) {
  const { id_sistemaoperativo } = req.params; 

  try {
    const versionesSO = await version_so.findAll({
      attributes: ['id_versionso', 'nombre'],
      where: {
        id_sistemaoperativo: id_sistemaoperativo, 
      },
    });

    return res.json(versionesSO);

  } catch (error) {
    console.error('Error al obtener las versiones de SOs:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de SOs' });
  }
}

export default {
    obtenerVersionesSO,
};
