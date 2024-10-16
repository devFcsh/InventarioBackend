import { sistema_operativo } from '../models'; 

async function obtenerSO(req, res) {
  try {
    const SOs = await sistema_operativo.findAll({
      attributes: ['id_sistemaoperativo', 'nombre'] 
    });

    return res.json(SOs);

  } catch (error) {
    console.error('Error al obtener los SOs:', error);
    return res.status(500).json({ error: 'Error al obtener los SOs' });
  }
}

export default {
    obtenerSO,
};