const sequelize = require("../models/index.js").sequelize;

async function contarEquiposActivos(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
  } = req.query;

  try {
    const query = `
SELECT 
    COUNT(e.id_equipo) AS total
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Activo ea ON e.id_equipo = ea.id_equipo
JOIN usuario u ON ea.id_usuario = u.id_usuario
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario);`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al contar equipos activos:", error);
    res.status(500).json({ error: "Error al contar equipos activos" });
  }
}

async function contarEquiposBodega(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
  } = req.query;

  try {
    const query = `
SELECT 
    COUNT(e.id_equipo) AS total
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Bodega eb ON e.id_equipo = eb.id_equipo
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario);`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al contar equipos en bodega:", error);
    res.status(500).json({ error: "Error al contar equipos en bodega" });
  }
}

async function contarEquiposBaja(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
  } = req.query;

  try {
    const query = `
SELECT 
    COUNT(e.id_equipo) AS total
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Baja eb ON e.id_equipo = eb.id_equipo
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario);`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al contar equipos de baja:", error);
    res.status(500).json({ error: "Error al contar equipos de baja" });
  }
}

async function obtenerEquiposActivos(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
    limit,
    offset,
  } = req.query;

  try {
    const query = `
SELECT 
    e.*, 
    p.nombre AS periferico, 
    m.nombre AS marca, 
    mo.nombre AS modelo, 
    s.nombre AS serie,
    u.nombre AS usuario,
    uso.nombre AS uso,
    ea.id_aula,
    ed.nombre AS edificio
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Activo ea ON e.id_equipo = ea.id_equipo
JOIN aula a ON ea.id_aula = a.id_aula -- Unir con la tabla aula
JOIN edificio ed ON a.id_edificio = ed.id_edificio 
JOIN usuario u ON ea.id_usuario = u.id_usuario
JOIN uso ON u.id_uso = uso.id_uso
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario)
LIMIT :limit OFFSET :offset;
`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos activos:", error);
    res.status(500).json({ error: "Error al obtener equipos activos" });
  }
}

async function obtenerEquiposBodega(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
    limit,
    offset,
  } = req.query;

  try {
    const query = `
SELECT 
    e.*, 
    p.nombre AS periferico, 
    m.nombre AS marca, 
    mo.nombre AS modelo, 
    s.nombre AS serie
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Bodega eb ON e.id_equipo = eb.id_equipo
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario)
LIMIT :limit OFFSET :offset;`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos en bodega:", error);
    res.status(500).json({ error: "Error al obtener equipos en bodega" });
  }
}

async function obtenerEquiposBaja(req, res) {
  const {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
    limit,
    offset,
  } = req.query;

  try {
    const query = `
SELECT 
    e.*, 
    p.nombre AS periferico, 
    m.nombre AS marca, 
    mo.nombre AS modelo, 
    s.nombre AS serie
FROM equipo e
JOIN serie s ON e.id_serie = s.id_serie
JOIN modelo_serie ms ON s.id_serie = ms.id_serie
JOIN modelo mo ON ms.id_modelo = mo.id_modelo
JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
JOIN marca m ON mm.id_marca = m.id_marca
JOIN marca_periferico mp ON m.id_marca = mp.id_marca
JOIN periferico p ON mp.id_periferico = p.id_periferico
JOIN equipo_Baja eb ON e.id_equipo = eb.id_equipo
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
  AND (:marcaId IS NULL OR m.id_marca = :marcaId)
  AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
  AND (:serieId IS NULL OR s.id_serie = :serieId)
  AND (:inventario IS NULL OR e.inventario = :inventario)
LIMIT :limit OFFSET :offset;`;

    const equipos = await sequelize.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(equipos);
  } catch (error) {
    console.error("Error al obtener equipos de baja:", error);
    res.status(500).json({ error: "Error al obtener equipos de baja" });
  }
}

async function eliminarEquipo(req, res) {
  const { equipoId } = req.params;

  try {
    await sequelize.query(`DELETE FROM equipo_Activo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    await sequelize.query(`DELETE FROM equipo_Bodega WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    await sequelize.query(`DELETE FROM equipo_Baja WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    await sequelize.query(`DELETE FROM componente WHERE id_computadora = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    await sequelize.query(`DELETE FROM computadora WHERE id_computadora = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    await sequelize.query(`DELETE FROM equipo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({ message: 'Equipo y sus componentes eliminados con éxito' });
  } catch (error) {
    console.error("Error al eliminar equipo y componentes:", error);
    res.status(500).json({ error: 'Error al eliminar equipo y componentes' });
  }
}


async function agregarEquipo(req, res) {
  const {
    tipo,
    inventario,
    serie,
    nombreEquipo,
    direccionIp,
    versionso,
    versionoffice,
    ram,
    disco,
    antivirus,
    dominio,
    idAula,
    idUsuario,
    imagenRuta,
  } = req.body;

  try {
    const result = await sequelize.query(
      `CALL agregar_equipo(
        :tipo,
        :inventario,
        :serie,
        :nombreEquipo,
        :direccionIp,
        :versionso,
        :versionoffice,
        :ram,
        :disco,
        :antivirus,
        :dominio,
        :idAula,
        :idUsuario,
        :imagenRuta
      );`,
      {
        replacements: {
          tipo,
          inventario,
          serie,
          nombreEquipo,
          direccionIp,
          versionso,
          versionoffice,
          ram,
          disco,
          antivirus,
          dominio,
          idAula,
          idUsuario,
          imagenRuta,
        },
      }
    );

    const equipoId = result[0]?.id_equipo; 

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}






async function actualizarEquipo(req, res) {
  const { equipoId } = req.params;
  const {
    inventario,
    serie,
    nombreEquipo,
    direccionIp,
    versionso,
    versionoffice,
    ram,
    disco,
    antivirus,
    dominio
  } = req.body;

  try {
    await sequelize.query(
      `UPDATE equipo SET inventario = :inventario, id_serie = :serie WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId, inventario, serie },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    await sequelize.query(
      `UPDATE computadora SET nombre_equipo = :nombreEquipo, direccion_ip = :direccionIp, 
      id_versionso = :versionso, id_versionoffice = :versionoffice, id_ram = :ram, 
      id_disco = :disco, id_antivirus = :antivirus, id_dominio = :dominio 
      WHERE id_computadora = :equipoId`,
      {
        replacements: {
          equipoId,
          nombreEquipo,
          direccionIp,
          versionso,
          versionoffice,
          ram,
          disco,
          antivirus,
          dominio,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.json({ message: 'Equipo actualizado con éxito' });
  } catch (error) {
    console.error("Error al actualizar equipo:", error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
}

async function agregarComponentes(req, res) {
  const { equipoId, componentes, aulaId, usuarioId, imagenRuta } = req.body;

  try {
    for (const componente of componentes) {
      const result = await sequelize.query(
        `INSERT INTO equipo (inventario, id_serie) VALUES (:inventario, :serieId);`,
        {
          replacements: {
            inventario: componente.inventario,
            serieId: componente.serieId,
          },
        }
      );

      const idComponente = result[0];

      await sequelize.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId);`,
        {
          replacements: {
            idComponente, 
            equipoId,
          },
        }
      );

      await sequelize.query(
        `INSERT INTO equipo_Activo (id_equipo, id_aula, id_usuario) VALUES (:idComponente, :aulaId, :usuarioId);`,
        {
          replacements: {
            idComponente,
            aulaId,
            usuarioId,
          },
        }
      );

      await sequelize.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, (SELECT id_imagen FROM imagen WHERE ruta = :imagenRuta));`,
        {
          replacements: {
            idComponente,
            imagenRuta,
          },
        }
      );
    }

    res.json({ message: "Componentes agregados correctamente" });
  } catch (error) {
    console.error("Error al agregar componentes:", error);
    res.status(500).json({ error: "Error al agregar componentes" });
  }
}



const path = require('path');
const fs = require('fs');

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }

  const imagePath = path.join('/uploads', req.file.filename);

  res.json({ imagePath });
}


module.exports = {
  contarEquiposActivos,
  contarEquiposBodega,
  contarEquiposBaja,
  obtenerEquiposActivos,
  obtenerEquiposBodega,
  obtenerEquiposBaja,
  eliminarEquipo,
  agregarEquipo,
  actualizarEquipo,
  agregarComponentes,
  uploadImage
};
