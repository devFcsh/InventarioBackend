import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Marca  from '../models/marca.js'; 

export async function obtenerMarcas(req, res) {
  try {
    const marcas = await Marca.findAll({
      attributes: ['id_marca', 'nombre'] 
    });

    return res.json(marcas);

  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
}

export async function obtenerMarcasPorPeriferico(req, res) {
  const { perifericoId } = req.params;
  
  try {
    const results = await db.query(
      `SELECT m.id_marca, m.nombre
       FROM marca m
       JOIN marca_periferico mp ON m.id_marca = mp.id_marca
       JOIN periferico p ON mp.id_periferico = p.id_periferico
       WHERE p.id_periferico = :idPeriferico`, 
      {
        replacements: { idPeriferico: perifericoId }, 
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Periférico no encontrado' });
    }

    return res.json(results); 

  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
}

export async function obtenerMarcaDetalle(req, res) {
  const { id_marca } = req.params;

  try {
    const marca = await Marca.findByPk(id_marca);

    if (!marca) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    const perifericos = await db.query(
      `SELECT id_periferico
       FROM marca_periferico
       WHERE id_marca = :id_marca`,
      {
        replacements: { id_marca },
        type: QueryTypes.SELECT
      }
    );

    const perifericosIds = perifericos.map(p => p.id_periferico);

    return res.json({
      id_marca: marca.id_marca,
      nombre: marca.nombre,
      perifericos: perifericosIds
    });
  } catch (error) {
    console.error('Error al obtener detalle de marca:', error);
    return res.status(500).json({ error: 'Error al obtener detalle de marca' });
  }
}


export async function agregarMarca(req, res) {
  const { nombre, perifericoId } = req.body;

  if (!nombre || !perifericoId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de periferico" });
  }

  try {
    const queryMarca = `
      INSERT INTO marca (nombre)
      VALUES (:nombre)
    `;
    const resultMarca = await db.query(queryMarca, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    const id_marca = resultMarca[0];

    const queryMarcaPeriferico = `
      INSERT INTO marca_periferico (id_marca, id_periferico)
      VALUES (:id_marca, :perifericoId)
    `;
    await db.query(queryMarcaPeriferico, {
      replacements: { id_marca, perifericoId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Marca agregada y asociada exitosamente al periférico",
      marca: { nombre },
      id_marca,
      id_periferico: perifericoId,
    });
  } catch (error) {
    console.error("Error al agregar marca y asociar periférico:", error);
    res.status(500).json({ error: "Error al agregar marca y asociar periférico" });
  }
}

export async function editarMarca(req, res) {
  const { id_marca, nuevoNombre, perifericosIds } = req.body;

  const t = await db.transaction();
  try {
    const marca = await Marca.findByPk(id_marca, { transaction: t });

    if (!marca) {
      await t.rollback();
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    if (nuevoNombre) {
      await marca.update({ nombre: nuevoNombre }, { transaction: t });
    }

    if (Array.isArray(perifericosIds)) {
      const relacionesActuales = await db.query(
        `SELECT id_periferico FROM marca_periferico WHERE id_marca = :id_marca`,
        {
          replacements: { id_marca },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      const idsActuales = relacionesActuales.map(r => r.id_periferico);
      const idsNuevos = perifericosIds;

      const aEliminar = idsActuales.filter(id => !idsNuevos.includes(id));
      const aAgregar = idsNuevos.filter(id => !idsActuales.includes(id));

      if (aEliminar.length > 0) {
        for (const id_periferico of aEliminar) {
          const equiposConRelacion = await db.query(
            `SELECT COUNT(DISTINCT e.id_equipo) as count 
             FROM equipo e
             JOIN modelo_serie ms ON e.id_serie = ms.id_serie
             JOIN marca_modelo mm ON ms.id_modelo = mm.id_modelo
             WHERE mm.id_marca = :id_marca 
               AND e.id_periferico = :id_periferico`,
            {
              replacements: { id_marca, id_periferico },
              type: QueryTypes.SELECT,
              transaction: t
            }
          );

          if (equiposConRelacion[0].count > 0) {
            await t.rollback();
            return res.status(400).json({ 
              error: `No se puede eliminar la relación con el periférico porque existen equipos asociados a esta marca y periférico` 
            });
          }
        }

        await db.query(
          `DELETE FROM marca_periferico 
           WHERE id_marca = :id_marca AND id_periferico IN (:ids)`,
          {
            replacements: { id_marca, ids: aEliminar },
            type: QueryTypes.DELETE,
            transaction: t
          }
        );
      }

      for (const id_periferico of aAgregar) {
        await db.query(
          `INSERT INTO marca_periferico (id_marca, id_periferico)
           VALUES (:id_marca, :id_periferico)`,
          {
            replacements: { id_marca, id_periferico },
            type: QueryTypes.INSERT,
            transaction: t
          }
        );
      }
    }

    await t.commit();
    return res.json({ message: 'Marca actualizada correctamente', marca });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar la marca:', error);
    return res.status(500).json({ error: 'Error al actualizar la marca' });
  }
}

export async function eliminarMarca(req, res) {
  const { id_marca } = req.params;

  try {
    const marca = await Marca.findByPk(id_marca);

    if (!marca) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }

    const perifericosRelacionados = await db.query(
      `SELECT COUNT(*) as count FROM marca_periferico WHERE id_marca = :id_marca`,
      {
        replacements: { id_marca },
        type: QueryTypes.SELECT
      }
    );

    if (perifericosRelacionados[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la marca porque tiene periféricos asociados' 
      });
    }

    const modelosRelacionados = await db.query(
      `SELECT COUNT(*) as count FROM marca_modelo WHERE id_marca = :id_marca`,
      {
        replacements: { id_marca },
        type: QueryTypes.SELECT
      }
    );

    if (modelosRelacionados[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la marca porque tiene modelos asociados' 
      });
    }

    await marca.destroy();

    return res.json({ message: 'Marca eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    return res.status(500).json({ error: 'Error al eliminar marca' });
  }
}