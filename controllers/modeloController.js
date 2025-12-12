import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Modelo from '../models/modelo.js';

export async function obtenerModelos(req, res) {
    try {
      const modelos = await Modelo.findAll({
        attributes: ['id_modelo', 'nombre'] 
      });
  
      return res.json(modelos);
  
    } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
    }
}

export async function modelosPorMarcaPeriferico(req, res) {
  const { marcaId, perifericoId } = req.query;

  try {
      const modelos = await db.query(
          `SELECT mo.id_modelo, mo.nombre 
          FROM modelo mo
          JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
          JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
          WHERE mp.id_marca = :marcaId AND mp.id_periferico = :perifericoId`,
          {
              replacements: { marcaId, perifericoId },
              type: QueryTypes.SELECT
          }
      );

      if (modelos.length === 0) {
          return res.status(404).json({ error: 'Modelos no encontrados para la marca y periférico seleccionados' });
      }

      return res.json(modelos);

  } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
  }
};

export async function obtenerModeloDetalle(req, res) {
  const { id_modelo } = req.params;

  try {
    const modelo = await Modelo.findByPk(id_modelo);

    if (!modelo) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    const marcas = await db.query(
      `SELECT id_marca
       FROM marca_modelo
       WHERE id_modelo = :id_modelo`,
      {
        replacements: { id_modelo },
        type: QueryTypes.SELECT
      }
    );

    const marcasIds = marcas.map(m => m.id_marca);

    return res.json({
      id_modelo: modelo.id_modelo,
      nombre: modelo.nombre,
      marcas: marcasIds
    });
  } catch (error) {
    console.error('Error al obtener detalle de modelo:', error);
    return res.status(500).json({ error: 'Error al obtener detalle de modelo' });
  }
}

export async function agregarModelo(req, res) {
  const { nombre, marcaId } = req.body;

  if (!nombre || !marcaId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de marca" });
  }

  try {
    const queryModelo = `
      INSERT INTO modelo (nombre)
      VALUES (:nombre)
    `;
    const resultModelo = await db.query(queryModelo, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    const id_modelo = resultModelo[0];

    const queryModeloMarca = `
      INSERT INTO marca_modelo (id_marca, id_modelo)
      VALUES (:marcaId, :id_modelo)
    `;
    await db.query(queryModeloMarca, {
      replacements: { marcaId, id_modelo },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Modelo agregado y asociado exitosamente a la marca",
      marca: { nombre },
      id_modelo,
      id_marca: marcaId,
    });
  } catch (error) {
    console.error("Error al agregar modelo y asociar marca:", error);
    res.status(500).json({ error: "Error al agregar modelo y asociar marca" });
  }
}

export async function editarModelo(req, res) {
  const { id_modelo, nuevoNombre, marcasIds } = req.body;

  const t = await db.transaction();
  try {
    const modelo = await Modelo.findByPk(id_modelo, { transaction: t });

    if (!modelo) {
      await t.rollback();
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    if (nuevoNombre) {
      await modelo.update({ nombre: nuevoNombre }, { transaction: t });
    }

    if (Array.isArray(marcasIds)) {
      const relacionesActuales = await db.query(
        `SELECT id_marca FROM marca_modelo WHERE id_modelo = :id_modelo`,
        {
          replacements: { id_modelo },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      const idsActuales = relacionesActuales.map(r => r.id_marca);
      const idsNuevos = marcasIds;

      const aEliminar = idsActuales.filter(id => !idsNuevos.includes(id));
      const aAgregar = idsNuevos.filter(id => !idsActuales.includes(id));

      if (aEliminar.length > 0) {
        for (const id_marca of aEliminar) {
          const equiposConRelacion = await db.query(
            `SELECT COUNT(DISTINCT e.id_equipo) as count 
             FROM equipo e
             JOIN modelo_serie ms ON e.id_serie = ms.id_serie
             JOIN marca_modelo mm ON ms.id_modelo = mm.id_modelo
             WHERE mm.id_modelo = :id_modelo 
               AND mm.id_marca = :id_marca`,
            {
              replacements: { id_modelo, id_marca },
              type: QueryTypes.SELECT,
              transaction: t
            }
          );

          if (equiposConRelacion[0].count > 0) {
            await t.rollback();
            return res.status(400).json({ 
              error: `No se puede eliminar la relación con la marca porque existen equipos asociados a este modelo y marca` 
            });
          }
        }

        await db.query(
          `DELETE FROM marca_modelo 
           WHERE id_modelo = :id_modelo AND id_marca IN (:ids)`,
          {
            replacements: { id_modelo, ids: aEliminar },
            type: QueryTypes.DELETE,
            transaction: t
          }
        );
      }

      for (const id_marca of aAgregar) {
        await db.query(
          `INSERT INTO marca_modelo (id_modelo, id_marca)
           VALUES (:id_modelo, :id_marca)`,
          {
            replacements: { id_modelo, id_marca },
            type: QueryTypes.INSERT,
            transaction: t
          }
        );
      }
    }

    await t.commit();
    return res.json({ message: 'Modelo actualizado correctamente', modelo });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar el modelo:', error);
    return res.status(500).json({ error: 'Error al actualizar el modelo' });
  }
}

export async function eliminarModelo(req, res) {
  const { id_modelo } = req.params;

  try {
    const modelo = await Modelo.findByPk(id_modelo);

    if (!modelo) {
      return res.status(404).json({ error: 'Modelo no encontrado' });
    }

    const marcasRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM marca_modelo WHERE id_modelo = :id_modelo`,
      {
        replacements: { id_modelo },
        type: QueryTypes.SELECT
      }
    );

    if (marcasRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el modelo porque tiene marcas asociadas' 
      });
    }

    const seriesRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM modelo_serie WHERE id_modelo = :id_modelo`,
      {
        replacements: { id_modelo },
        type: QueryTypes.SELECT
      }
    );

    if (seriesRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el modelo porque tiene series asociadas' 
      });
    }

    const perifericosRelacionados = await db.query(
      `SELECT COUNT(*) as count FROM periferico_modelo WHERE id_modelo = :id_modelo`,
      {
        replacements: { id_modelo },
        type: QueryTypes.SELECT
      }
    );

    if (perifericosRelacionados[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el modelo porque tiene periféricos asociados' 
      });
    }

    const lamparasRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM modelo_lampara WHERE id_modelo = :id_modelo`,
      {
        replacements: { id_modelo },
        type: QueryTypes.SELECT
      }
    );

    if (lamparasRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el modelo porque tiene lámparas asociadas' 
      });
    }

    await modelo.destroy();

    return res.json({ message: 'Modelo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el modelo:', error);
    return res.status(500).json({ error: 'Error al eliminar el modelo' });
  }
}
