import { sequelize } from "../models/index.js";

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
      const equipo = await sequelize.query(
          `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
          {
              replacements: { equipoId },
              type: sequelize.QueryTypes.SELECT,
          }
      );

      if (!equipo.length) {
          return res.status(400).json({ error: 'El equipo no existe.' });
      }

      const computadora = await sequelize.query(
        `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
        {
            replacements: { equipoId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (computadora.length) {
        
      const componentes = await sequelize.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
            replacements: { equipoId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const componenteIds = componentes.map(comp => comp.id_componente);

    await sequelize.query(
        `DELETE FROM componente WHERE id_computadora = :equipoId`,
        {
            replacements: { equipoId },
            type: sequelize.QueryTypes.DELETE,
        }
    );

    if (componenteIds.length > 0) {
        await sequelize.query(
            `DELETE FROM equipo WHERE id_equipo IN (:componenteIds)`,
            {
                replacements: { componenteIds },
                type: sequelize.QueryTypes.DELETE,
            }
        );
    }


    }

     
      await sequelize.query(
          `DELETE FROM equipo WHERE id_equipo = :equipoId`,
          {
              replacements: { equipoId },
              type: sequelize.QueryTypes.DELETE,
          }
      );

      res.json({ message: 'Equipo y sus componentes eliminados con éxito' });
  } catch (error) {
      console.error("Error al eliminar equipo y componentes:", error);
      res.status(500).json({ error: 'Error al eliminar equipo y componentes' });
  }
}

import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

async function darDeBajaEquipo(req, res) {
    const { equipoId } = req.params;

    try {
        const equipo = await sequelize.query(
            `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!equipo.length) {
            return res.status(400).json({ error: 'El equipo no existe.' });
        }

        const imagen = await sequelize.query(
            `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (imagen.length) {
            await sequelize.query(
                `DELETE FROM equipo_imagen WHERE id_equipo = :equipoId`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.DELETE,
                }
            );

            await sequelize.query(
                `DELETE FROM imagen WHERE id_imagen = :idImagen`,
                {
                    replacements: { idImagen: imagen[0].id_imagen },
                    type: sequelize.QueryTypes.DELETE,
                }
            );

            const imagePath = join(__dirname, '..', imagen[0].ruta);
            if (existsSync(imagePath)) {
                unlinkSync(imagePath); 
            }
        }

        const computadora = await sequelize.query(
            `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (computadora.length) {
            const componentes = await sequelize.query(
                `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            const componenteIds = componentes.map(comp => comp.id_componente);
            if (componenteIds.length > 0) {
                await sequelize.query(
                    `INSERT INTO equipo_baja (id_equipo)
                    SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
                    {
                        replacements: { equipoId },
                        type: sequelize.QueryTypes.INSERT,
                    }
                );

                await sequelize.query(
                    `DELETE FROM componente WHERE id_computadora = :equipoId`,
                    {
                        replacements: { equipoId },
                        type: sequelize.QueryTypes.DELETE,
                    }
                );

                await sequelize.query(
                    `DELETE FROM equipo_activo WHERE id_equipo IN (:componenteIds)`,
                    {
                        replacements: { componenteIds },
                        type: sequelize.QueryTypes.DELETE,
                    }
                );

                await sequelize.query(
                    `DELETE FROM equipo_bodega WHERE id_equipo IN (:componenteIds)`,
                    {
                        replacements: { componenteIds },
                        type: sequelize.QueryTypes.DELETE,
                    }
                );
            }

            await sequelize.query(
                `INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.INSERT,
                }
            );

            await sequelize.query(
                `DELETE FROM computadora WHERE id_computadora = :equipoId`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.DELETE,
                }
            );
        } else {
            await sequelize.query(
                `INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.INSERT,
                }
            );
        }

        await sequelize.query(
            `DELETE FROM equipo_activo WHERE id_equipo = :equipoId`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.DELETE,
            }
        );

        await sequelize.query(
            `DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.DELETE,
            }
        );

        res.json({ message: 'Equipo dado de baja con éxito' });
    } catch (error) {
        console.error("Error al dar de baja el equipo:", error);
        res.status(500).json({ error: 'Error al dar de baja el equipo' });
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
      `UPDATE equipo SET inventario = :inventario, id_serie = :id_serie WHERE id_equipo = :equipoId`,
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



const obtenerComputadora = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await sequelize.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         c.nombre_equipo,
         c.direccion_ip,
         c.id_versionso,
         c.id_versionoffice,
         c.id_ram,
         c.id_disco,
         c.id_antivirus,
         c.id_dominio,
         p.id_periferico,
         m.id_marca,
         s.id_serie,
         mm.id_modelo,
         a.id_aula,
         a.id_edificio,
         i.ruta AS imagenRuta,
         vso.id_sistemaoperativo
       FROM equipo e
       JOIN equipo_Activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN version_SO vso ON vso.id_versionso = c.id_versionso
       JOIN aula a ON ea.id_aula = a.id_aula
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       WHERE e.id_equipo = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const componentes = await sequelize.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN periferico p ON e.id_serie = p.id_periferico
       JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN modelo mo ON mm.id_modelo = mo.id_modelo
       JOIN serie s ON e.id_serie = s.id_serie
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    
    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error('Error al obtener la computadora:', error);
    res.status(500).json({ error: 'Error al obtener la computadora' });
  }
};

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

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }

  const imagePath = join('/uploads', req.file.filename);

  res.json({ imagePath });
}

async function editarEquipo(req, res) {
    const { equipoId } = req.params;
    const {
        id_ram,
        id_disco,
        id_versionso,
        id_versionoffice,
        id_antivirus,
        id_dominio,
        id_serie,
        inventario,
        nombre_equipo,
        direccion_ip,
        id_usuario,
        id_aula,
        imagenRuta 
    } = req.body;

    try {
        const equipo = await sequelize.query(
            `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
            {
                replacements: { equipoId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!equipo.length) {
            return res.status(400).json({ error: 'El equipo no existe.' });
        }

        if (imagenRuta) {
            const imagenActual = await sequelize.query(
                `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
                {
                    replacements: { equipoId },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            if (imagenActual.length) {
                await sequelize.query(
                    `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
                    {
                        replacements: { idImagen: imagenActual[0].id_imagen },
                        type: sequelize.QueryTypes.DELETE,
                    }
                );

                await sequelize.query(
                    `DELETE FROM imagen WHERE id_imagen = :idImagen`,
                    {
                        replacements: { idImagen: imagenActual[0].id_imagen },
                        type: sequelize.QueryTypes.DELETE,
                    }
                );

                const imagePath = join(__dirname, '..', imagenActual[0].ruta);
                if (existsSync(imagePath)) {
                    unlinkSync(imagePath);
                }
            }

            const [result] = await sequelize.query(
                `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
                {
                    replacements: { imagenRuta },
                    type: sequelize.QueryTypes.INSERT,
                }
            );

            const imagenId = result;

            await sequelize.query(
                `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
                {
                    replacements: { equipoId, imagenId },
                    type: sequelize.QueryTypes.INSERT,
                }
            );
        }

        await sequelize.query(
            `UPDATE equipo SET inventario = :inventario, id_serie = :id_serie WHERE id_equipo = :equipoId`,
            {
                replacements: { equipoId, inventario, id_serie },
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        await sequelize.query(
            `UPDATE computadora SET
                nombre_equipo = :nombre_equipo,
                direccion_ip = :direccion_ip,
                id_versionso = :id_versionso,
                id_versionoffice = :id_versionoffice,
                id_ram = :id_ram,
                id_disco = :id_disco,
                id_antivirus = :id_antivirus,
                id_dominio = :id_dominio
            WHERE id_computadora = :equipoId`,
            {
                replacements: {
                    equipoId,
                    nombre_equipo,
                    direccion_ip: direccion_ip || "", 
                    id_versionso,
                    id_versionoffice,
                    id_ram,
                    id_disco,
                    id_antivirus,
                    id_dominio
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        await sequelize.query(
            `UPDATE equipo_activo SET
                id_usuario = :id_usuario,
                id_aula = :id_aula
            WHERE id_equipo = :equipoId`,
            {
                replacements: {
                    equipoId,
                    id_usuario,
                    id_aula
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        res.json({ message: 'Equipo actualizado con éxito' });
    } catch (error) {
        console.error("Error al actualizar el equipo:", error);
        res.status(500).json({ error: 'Error al actualizar el equipo' });
    }
}

async function gestionarComponentesEditados(req, res) {
  const { equipoId, componentes, aulaId, usuarioId, imagenRuta } = req.body;

  try {
    const componentesActuales = await sequelize.query(
      `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(componentes)

    const componentesIdsActuales = componentesActuales.map(comp => comp.id_componente);
    const componentesIdsNuevos = componentes.map(comp => comp.id_componente).filter(id => id !== undefined);

    const idsAEliminar = componentesIdsActuales.filter(id => !componentesIdsNuevos.includes(id));

    console.log(componentes)
    console.log(componentesIdsActuales)
    console.log(componentesIdsNuevos)
    console.log(idsAEliminar)

    if (idsAEliminar.length > 0) {
      await sequelize.query(
        `DELETE FROM componente WHERE id_componente IN (:idsAEliminar)`,
        {
          replacements: { idsAEliminar },
          type: sequelize.QueryTypes.DELETE,
        }
      );
    }
    for (const componente of componentes) {
      if (componente.id_componente) {
        // Componente existente
      } else {
        const result = await sequelize.query(
          `INSERT INTO equipo (inventario, id_serie) VALUES (:inventario, :serieId)`,
          {
            replacements: {
              inventario: componente.inventario,
              serieId: componente.serieId,
            },
          }
        );

        const idComponente = result[0];

        await sequelize.query(
          `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId)`,
          {
            replacements: {
              idComponente,
              equipoId,
            },
          }
        );

        await sequelize.query(
          `INSERT INTO equipo_activo (id_equipo, id_aula, id_usuario) VALUES (:idComponente, :aulaId, :usuarioId)`,
          {
            replacements: {
              idComponente,
              aulaId,
              usuarioId,
            },
          }
        );

        await sequelize.query(
          `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, (SELECT id_imagen FROM imagen WHERE ruta = :imagenRuta))`,
          {
            replacements: {
              idComponente,
              imagenRuta,
            },
          }
        );
      }
    }

    res.json({ message: "Componentes gestionados correctamente" });
  } catch (error) {
    console.error("Error al gestionar componentes:", error);
    res.status(500).json({ error: "Error al gestionar componentes" });
  }
}




export default {
  contarEquiposActivos,
  contarEquiposBodega,
  contarEquiposBaja,
  obtenerEquiposActivos,
  obtenerEquiposBodega,
  obtenerEquiposBaja,
  darDeBajaEquipo,
  eliminarEquipo,
  agregarEquipo,
  actualizarEquipo,
  agregarComponentes,
  uploadImage,
  obtenerComputadora,
  editarEquipo,
  gestionarComponentesEditados
};
