import  SistemaOperativo  from '../models/sistema_operativo.js'; 

export async function obtenerSO(req, res) {
  try {
    const SOs = await SistemaOperativo.findAll({
      attributes: ['id_sistemaoperativo', 'nombre'] 
    });

    return res.json(SOs);

  } catch (error) {
    console.error('Error al obtener los SOs:', error);
    return res.status(500).json({ error: 'Error al obtener los SOs' });
  }
}

