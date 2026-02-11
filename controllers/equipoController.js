import { QueryTypes } from "sequelize";
import db from "../models/index.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, unlinkSync, mkdirSync, writeFileSync } from "fs";
import Ubicacion from "../models/ubicacion.js";
import Usuario from "../models/usuario.js";
import Dominio from "../models/dominio.js";
import Procesador from "../models/procesador.js";
import Ram from "../models/ram.js";
import Disco from "../models/disco.js";
import VersionSo from "../models/version_so.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function guardarLogImportacion(datos) {
  try {
    const logsDir = join(__dirname, '..', 'logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    
    const nombreArchivo = `importacion_${año}-${mes}-${dia}_${horas}-${minutos}-${segundos}.json`;
    const rutaArchivo = join(logsDir, nombreArchivo);

    const logData = {
      fechaHora: ahora.toISOString(),
      timestamp: ahora.getTime(),
      ...datos
    };

    writeFileSync(rutaArchivo, JSON.stringify(logData, null, 2), 'utf-8');
    console.log(`Log de importación guardado en: ${rutaArchivo}`);
    
    return rutaArchivo;
  } catch (error) {
    console.error('Error al guardar log de importación:', error);
    return null;
  }
}

async function obtenerOCrearMarca(nombreMarca, id_periferico) {
  if (!nombreMarca) return null;
  if (nombreMarca.length > 30)
    throw new Error("El nombre de la marca excede 30 caracteres.");
  const marcaExistente = await db.query(
    `SELECT id_marca FROM marca WHERE nombre = :nombreMarca`,
    { replacements: { nombreMarca }, type: QueryTypes.SELECT }
  );
  let id_marca;
  if (marcaExistente.length) {
    id_marca = marcaExistente[0].id_marca;
  } else {
    const [result] = await db.query(
      `INSERT INTO marca (nombre) VALUES (:nombreMarca)`,
      { replacements: { nombreMarca }, type: QueryTypes.INSERT }
    );
    id_marca = result;
    if (id_periferico) {
      await db.query(
        `INSERT INTO marca_periferico (id_marca, id_periferico) VALUES (:id_marca, :id_periferico)`,
        { replacements: { id_marca, id_periferico }, type: QueryTypes.INSERT }
      );
    }
  }
  if (id_marca && id_periferico) {
    const relacion = await db.query(
      `SELECT 1 FROM marca_periferico WHERE id_marca = :id_marca AND id_periferico = :id_periferico`,
      { replacements: { id_marca, id_periferico }, type: QueryTypes.SELECT }
    );
    if (!relacion.length) {
      await db.query(
        `INSERT INTO marca_periferico (id_marca, id_periferico) VALUES (:id_marca, :id_periferico)`,
        { replacements: { id_marca, id_periferico }, type: QueryTypes.INSERT }
      );
    }
  }
  return id_marca;
}

async function obtenerOCrearPeriferico(nombrePeriferico) {
  if (!nombrePeriferico) return null;
  if (nombrePeriferico.length > 100)
    throw new Error("El nombre del periférico excede 100 caracteres.");
  const perifericoExistente = await db.query(
    `SELECT id_periferico FROM periferico WHERE nombre = :nombrePeriferico`,
    { replacements: { nombrePeriferico }, type: QueryTypes.SELECT }
  );
  if (perifericoExistente.length) {
    return perifericoExistente[0].id_periferico;
  }
  const [result] = await db.query(
    `INSERT INTO periferico (nombre) VALUES (:nombrePeriferico)`,
    { replacements: { nombrePeriferico }, type: QueryTypes.INSERT }
  );
  return result;
}

async function obtenerOCrearModelo(nombreModelo, id_marca) {
  if (!nombreModelo) return null;
  if (nombreModelo.length > 100)
    throw new Error("El nombre del modelo excede 100 caracteres.");
  const modeloExistente = await db.query(
    `SELECT id_modelo FROM modelo WHERE nombre = :nombreModelo`,
    { replacements: { nombreModelo }, type: QueryTypes.SELECT }
  );
  let id_modelo;
  if (modeloExistente.length) {
    id_modelo = modeloExistente[0].id_modelo;
  } else {
    const [result] = await db.query(
      `INSERT INTO modelo (nombre) VALUES (:nombreModelo)`,
      { replacements: { nombreModelo }, type: QueryTypes.INSERT }
    );
    id_modelo = result;
  }
  if (id_marca && id_modelo) {
    const relacion = await db.query(
      `SELECT 1 FROM marca_modelo WHERE id_marca = :id_marca AND id_modelo = :id_modelo`,
      { replacements: { id_marca, id_modelo }, type: QueryTypes.SELECT }
    );
    if (!relacion.length) {
      await db.query(
        `INSERT INTO marca_modelo (id_marca, id_modelo) VALUES (:id_marca, :id_modelo)`,
        { replacements: { id_marca, id_modelo }, type: QueryTypes.INSERT }
      );
    }
  }
  return id_modelo;
}

async function obtenerOCrearSerie(nombreSerie) {
  if (!nombreSerie) return null;
  if (nombreSerie.length > 30)
    throw new Error("El nombre de la serie excede 30 caracteres.");
  const serieExistente = await db.query(
    `SELECT id_serie FROM serie WHERE nombre = :nombreSerie`,
    { replacements: { nombreSerie }, type: QueryTypes.SELECT }
  );
  if (serieExistente.length) {
    return serieExistente[0].id_serie;
  }
  const [result] = await db.query(
    `INSERT INTO serie (nombre) VALUES (:nombreSerie)`,
    { replacements: { nombreSerie }, type: QueryTypes.INSERT }
  );
  return result;
}

async function eliminarSerieSiNoUsada(id_serie) {
  const equipos = await db.query(
    `SELECT 1 FROM equipo WHERE id_serie = :id_serie LIMIT 1`,
    { replacements: { id_serie }, type: QueryTypes.SELECT }
  );
  if (!equipos.length) {
    await db.query(`DELETE FROM modelo_serie WHERE id_serie = :id_serie`, {
      replacements: { id_serie },
      type: QueryTypes.DELETE,
    });
    await db.query(`DELETE FROM serie WHERE id_serie = :id_serie`, {
      replacements: { id_serie },
      type: QueryTypes.DELETE,
    });
  }
}

function validarTexto(input) {
  if (typeof input !== "string") return null;
  
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 30) return null;
  
  return trimmed;
}

export async function obtenerEquiposActivos(req, res) {
  let {
    perifericoId,
    marcaId,
    modeloId,
    serieId,
    inventario,
    limit,
    offset,
    sortBy,
    sortDir,
    usuarioId,
  } = req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  let usuarioIdNum = null;
  if (typeof usuarioId !== "undefined" && usuarioId !== null && String(usuarioId).trim() !== "") {
    const parsed = parseInt(usuarioId, 10);
    usuarioIdNum = Number.isNaN(parsed) ? null : parsed;
  }

  const rawLimit = typeof req.query.limit === "string" ? req.query.limit.trim().toLowerCase() : req.query.limit;
  const noLimit = rawLimit === "all" || rawLimit === "0";

  limit = noLimit ? null : parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (!noLimit && (isNaN(limit) || limit <= 0)) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  const SORT_COLUMN_MAP = {
    inventario: "e.inventario",
    periferico: "p.nombre",
    marca: "m.nombre",
    modelo: "mo.nombre",
    serie: "s.nombre",
    usuario: "u.nombre",
    uso: "uso.nombre",
    edificio: "ed.nombre",
    fecha_creacion: "e.fecha_creacion",
    editor: "e.editor",
    autor: "e.autor",
  };

  if (typeof sortBy === "string") sortBy = sortBy.trim();
  else sortBy = null;

  if (typeof sortDir === "string") {
    sortDir = sortDir.trim().toLowerCase();
    if (sortDir !== "asc" && sortDir !== "desc") sortDir = "asc";
  } else {
    sortDir = "asc";
  }

  let orderClause = "";
  if (sortBy && SORT_COLUMN_MAP[sortBy]) {
    const column = SORT_COLUMN_MAP[sortBy];
    const direction = sortDir === "desc" ? "DESC" : "ASC";
    orderClause = `ORDER BY ${column} ${direction}`;
  } else {
    orderClause = `ORDER BY e.inventario ASC`;
  }

  try {
    const limitOffsetClause = noLimit ? "" : "LIMIT :limit OFFSET :offset";

    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        u.nombre AS usuario,
        uso.nombre AS uso,
        ea.id_ubicacion,
        ed.nombre AS edificio,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion 
      JOIN edificio ed ON a.id_edificio = ed.id_edificio 
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      JOIN uso ON u.id_uso = uso.id_uso
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
      AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
      AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
      AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
      AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
      AND (:usuarioId IS NULL OR ea.id_usuario = :usuarioId)
      AND (e.id_periferico = p.id_periferico)
      ${orderClause}
      ${limitOffsetClause};
    `;

    const replacements = {
      perifericoId: perifericoId || null,
      marcaId: marcaId || null,
      modeloId: modeloId || null,
      serieId: serieId || null,
      inventario: inventario || null,
      usuarioId: usuarioIdNum,
    };

    if (!noLimit) {
      replacements.limit = parseInt(limit, 10) || 10;
      replacements.offset = parseInt(offset, 10) || 0;
    }

    const equipos = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;
    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos y contar activos:", error);
    res.status(500).json({ error: "Error al obtener equipos y contar activos" });
  }
}

export async function obtenerEquiposRed(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

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
        ea.id_ubicacion,
        ed.nombre AS edificio,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion 
      JOIN edificio ed ON a.id_edificio = ed.id_edificio 
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      JOIN uso ON u.id_uso = uso.id_uso
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
        AND (e.id_periferico = p.id_periferico)
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId: perifericoId || null,
        marcaId: marcaId || null,
        modeloId: modeloId || null,
        serieId: serieId || null,
        inventario: inventario || null,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos y contar activos:", error);
    res.status(500).json({ error: "Error al obtener equipos de red" });
  }
}

export async function obtenerEquiposBodega(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset, sortBy, sortDir } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  const SORT_COLUMN_MAP = {
    inventario: "e.inventario",
    periferico: "p.nombre",
    marca: "m.nombre",
    modelo: "mo.nombre",
    serie: "s.nombre",
    fecha_creacion: "e.fecha_creacion",
    editor: "e.editor",
    autor: "e.autor",
  };

  if (typeof sortBy === "string") sortBy = sortBy.trim();
  else sortBy = null;

  if (typeof sortDir === "string") {
    sortDir = sortDir.trim().toLowerCase();
    if (sortDir !== "asc" && sortDir !== "desc") sortDir = "asc";
  } else {
    sortDir = "asc";
  }

  let orderClause = "";
  if (sortBy && SORT_COLUMN_MAP[sortBy]) {
    const column = SORT_COLUMN_MAP[sortBy];
    const direction = sortDir === "desc" ? "DESC" : "ASC";
    orderClause = `ORDER BY ${column} ${direction}`;
  } else {
    orderClause = `ORDER BY e.inventario ASC`;
  }

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
        AND (e.id_periferico = p.id_periferico)
      ${orderClause}
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
      perifericoId: perifericoId || null,
      marcaId: marcaId || null,
      modeloId: modeloId || null,
      serieId: serieId || null,
      inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos en bodega:", error);
    res.status(500).json({ error: "Error al obtener equipos en bodega" });
  }
}

export async function obtenerEquiposRedBodega(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
        AND (e.id_periferico = p.id_periferico)
        LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos en bodega red:", error);
    res.status(500).json({ error: "Error al obtener equipos en bodega red" });
  }
}

export async function obtenerEquiposBaja(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset, sortBy, sortDir } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  const SORT_COLUMN_MAP = {
    inventario: "e.inventario",
    periferico: "p.nombre",
    marca: "m.nombre",
    modelo: "mo.nombre",
    serie: "s.nombre",
    usuario: "u.nombre",
    uso: "uso.nombre",
    edificio: "ed.nombre",
    fecha_creacion: "e.fecha_creacion",
    editor: "e.editor",
    autor: "e.autor",
  };

  if (typeof sortBy === "string") sortBy = sortBy.trim();
  else sortBy = null;

  if (typeof sortDir === "string") {
    sortDir = sortDir.trim().toLowerCase();
    if (sortDir !== "asc" && sortDir !== "desc") sortDir = "asc";
  } else {
    sortDir = "asc";
  }

  let orderClause = "";
  if (sortBy && SORT_COLUMN_MAP[sortBy]) {
    const column = SORT_COLUMN_MAP[sortBy];
    const direction = sortDir === "desc" ? "DESC" : "ASC";
    orderClause = `ORDER BY ${column} ${direction}`;
  } else {
    orderClause = `ORDER BY e.inventario ASC`;
  }

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_baja eb ON e.id_equipo = eb.id_equipo
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
        AND (e.id_periferico = p.id_periferico)
      ${orderClause}
      LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
      perifericoId: perifericoId || null,
      marcaId: marcaId || null,
      modeloId: modeloId || null,
      serieId: serieId || null,
      inventario: inventario || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos de baja:", error);
    res.status(500).json({ error: "Error al obtener equipos de baja" });
  }
}

export async function obtenerEquiposRedBaja(req, res) {
  let { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } =
    req.query;

  perifericoId = validarTexto(perifericoId);
  marcaId = validarTexto(marcaId);
  modeloId = validarTexto(modeloId);
  serieId = validarTexto(serieId);
  inventario = validarTexto(inventario);

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const query = `
      SELECT 
        e.*, 
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        e.empresa,
        COUNT(*) OVER() AS total
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_baja eb ON e.id_equipo = eb.id_equipo
      JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
      WHERE (:perifericoId IS NULL OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(:perifericoId), '%'))
        AND (:marcaId IS NULL OR LOWER(m.nombre) LIKE CONCAT('%', LOWER(:marcaId), '%'))
        AND (:modeloId IS NULL OR LOWER(mo.nombre) LIKE CONCAT('%', LOWER(:modeloId), '%'))
        AND (:serieId IS NULL OR LOWER(s.nombre) LIKE CONCAT('%', LOWER(:serieId), '%'))
        AND (:inventario IS NULL OR LOWER(e.inventario) LIKE CONCAT('%', LOWER(:inventario), '%'))
        AND (e.id_periferico = p.id_periferico)
        LIMIT :limit OFFSET :offset;
    `;

    const equipos = await db.query(query, {
      replacements: {
        perifericoId,
        marcaId,
        modeloId,
        serieId,
        inventario,
        limit,
        offset,
      },
      type: QueryTypes.SELECT,
    });

    const total = equipos.length > 0 ? equipos[0].total : 0;

    res.json({ total, equipos });
  } catch (error) {
    console.error("Error al obtener equipos de baja red:", error);
    res.status(500).json({ error: "Error al obtener equipos de baja red" });
  }
}

export async function obtenerEquiposPorUsuario(req, res) {
  const { id_usuario } = req.params;

  try {
    const query = `
      SELECT 
        e.id_equipo,
        e.inventario,
        p.nombre AS periferico, 
        m.nombre AS marca, 
        mo.nombre AS modelo, 
        s.nombre AS serie,
        e.empresa
      FROM equipo e
      JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
      JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      WHERE u.id_usuario = :id_usuario
      AND (e.id_periferico = p.id_periferico)
    `;

    const equipos = await db.query(query, {
      replacements: { id_usuario },
      type: QueryTypes.SELECT,
    });

    /** 
    if (equipos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron equipos para este usuario." });
    }
   */

    res.json({ equipos });
  } catch (error) {
    console.error("Error al obtener equipos del usuario:", error);
    res.status(500).json({ error: "Error al obtener equipos del usuario" });
  }
}

export async function cambiarUsuarioEquipo(req, res) {
  const { equipoId } = req.params;
  const { usuarioId } = req.body;

  try {
    const esComponente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (esComponente.length) {
      return res
        .status(400)
        .json({ error: "No se puede cambiar el usuario de un componente." });
    }

    const query = `
      UPDATE equipo_activo
      SET id_usuario = :usuarioId
      WHERE id_equipo = :equipoId;
    `;

    const result = await db.query(query, {
      replacements: { equipoId, usuarioId },
      type: QueryTypes.UPDATE,
    });

    if (result[0] === 0) {
      return res
        .status(404)
        .json({ error: "Equipo no encontrado o no se actualizó." });
    }

    await db.query(
      `UPDATE equipo_activo 
       SET id_usuario = :usuarioId 
       WHERE id_equipo IN (
         SELECT id_componente FROM componente WHERE id_computadora = :equipoId
       )`,
      {
        replacements: { equipoId, usuarioId },
        type: QueryTypes.UPDATE,
      }
    );

    res.json({
      mensaje:
        "Usuario cambiado correctamente en el equipo y sus componentes asociados.",
    });
  } catch (error) {
    console.error("Error al cambiar usuario de equipo:", error);
    res.status(500).json({ error: "Error al cambiar usuario de equipo." });
  }
}

export async function eliminarEquipo(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const id_serie = equipo[0].id_serie;

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (componente.length) {
      return res
        .status(400)
        .json({ error: "Debe desligar el componente antes de eliminarlo." });
    }

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    let componenteIds = [];
    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      componenteIds = componentes.map((comp) => comp.id_componente);

      await db.query(
        `DELETE FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.DELETE,
        }
      );

      if (componenteIds.length > 0) {
        await db.query(
          `DELETE FROM equipo WHERE id_equipo IN (:componenteIds)`,
          {
            replacements: { componenteIds },
            type: QueryTypes.DELETE,
          }
        );
      }
    }

    const imagen = await db.query(
      `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (imagen.length) {
      await db.query(`DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`, {
        replacements: { idImagen: imagen[0].id_imagen },
        type: QueryTypes.DELETE,
      });

      await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
        replacements: { idImagen: imagen[0].id_imagen },
        type: QueryTypes.DELETE,
      });

      const imagePath = join(__dirname, "..", imagen[0].ruta);
      if (existsSync(imagePath)) {
        unlinkSync(imagePath);
      }
    }

    await db.query(`DELETE FROM equipo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });

    if (id_serie) {
      await eliminarSerieSiNoUsada(id_serie);
    }

    res.json({
      message: "Equipo, imagen y sus componentes eliminados con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar equipo y componentes:", error);
    res.status(500).json({ error: "Error al eliminar equipo y componentes" });
  }
}

export async function eliminarEquipoSimple(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const id_serie = equipo[0].id_serie;

    await db.query(`DELETE FROM equipo WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });

    if (id_serie) {
      await eliminarSerieSiNoUsada(id_serie);
    }

    res.json({ message: "Equipo eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
}

export async function darDeBajaEquipo(req, res) {
  const { equipoId } = req.params;
  const { tipo } = req.body;

  try {
    const equipo = await db.query(
      `SELECT id_equipo FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (componente.length) {
      return res.status(400).json({ error: "Debe desligar el componente" });
    }

    if (tipo === "activo") {
      const activoInfo = await db.query(
        `SELECT id_usuario, id_ubicacion FROM equipo_activo WHERE id_equipo = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );
      if (activoInfo.length) {
        await db.query(
          `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
           VALUES (:equipoId, :id_usuario, :id_ubicacion, :tipo)
           ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
          {
            replacements: {
              equipoId,
              id_usuario: activoInfo[0].id_usuario,
              id_ubicacion: activoInfo[0].id_ubicacion,
              tipo,
            },
            type: QueryTypes.INSERT,
          }
        );
      }

      const imagen = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      /*
      if (imagen.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
          {
            replacements: { idImagen: imagen[0].id_imagen },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
          replacements: { idImagen: imagen[0].id_imagen },
          type: QueryTypes.DELETE,
        });

        const imagePath = join(__dirname, "..", imagen[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }
      */
    } else if (tipo === "bodega") {
      await db.query(
        `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
           VALUES (:equipoId, :id_usuario, :id_ubicacion, :tipo)
           ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
        {
          replacements: {
            equipoId,
            id_usuario: null,
            id_ubicacion: null,
            tipo,
          },
          type: QueryTypes.INSERT,
        }
      );
    }

    const computadora = await db.query(
      `SELECT id_computadora FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      const componenteIds = componentes.map((comp) => comp.id_componente);
      if (componenteIds.length > 0) {
        if (tipo === "activo") {
          const componentesActivos = await db.query(
            `SELECT id_equipo, id_usuario, id_ubicacion FROM equipo_activo WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.SELECT,
            }
          );
          for (const comp of componentesActivos) {
            await db.query(
              `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
               VALUES (:id_equipo, :id_usuario, :id_ubicacion, :tipo)
               ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
              {
                replacements: {
                  id_equipo: comp.id_equipo,
                  id_usuario: comp.id_usuario,
                  id_ubicacion: comp.id_ubicacion,
                  tipo,
                },
                type: QueryTypes.INSERT,
              }
            );
          }
        } else if (tipo === "bodega") {
          for (const id of componenteIds) {
            await db.query(
              `INSERT INTO equipo_baja_info (id_equipo, id_usuario, id_ubicacion, tipo)
         VALUES (:id_equipo, :id_usuario, :id_ubicacion, :tipo)
         ON DUPLICATE KEY UPDATE id_usuario = VALUES(id_usuario), id_ubicacion = VALUES(id_ubicacion), tipo = VALUES(tipo)`,
              {
                replacements: {
                  id_equipo: id,
                  id_usuario: null,
                  id_ubicacion: null,
                  tipo,
                },
                type: QueryTypes.INSERT,
              }
            );
          }
        }

        await db.query(
          `INSERT INTO equipo_baja (id_equipo)
                    SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
          {
            replacements: { equipoId },
            type: QueryTypes.INSERT,
          }
        );

        /*
        await db.query(
          `DELETE FROM componente WHERE id_computadora = :equipoId`,
          {
            replacements: { equipoId },
            type: QueryTypes.DELETE,
          }
        );
        */

        if (tipo === "activo") {
          await db.query(
            `DELETE FROM equipo_activo WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.DELETE,
            }
          );
        } else if (tipo === "bodega") {
          await db.query(
            `DELETE FROM equipo_bodega WHERE id_equipo IN (:componenteIds)`,
            {
              replacements: { componenteIds },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
      await db.query(`INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`, {
        replacements: { equipoId },
        type: QueryTypes.INSERT,
      });

      /*
      await db.query(
        `DELETE FROM computadora WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.DELETE,
        }
      );
      */
    } else {
      await db.query(`INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`, {
        replacements: { equipoId },
        type: QueryTypes.INSERT,
      });
    }

    if (tipo === "activo") {
      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    } else if (tipo === "bodega") {
      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    }

    res.json({ message: "Equipo dado de baja con éxito" });
  } catch (error) {
    console.error("Error al dar de baja el equipo:", error);
    res.status(500).json({ error: "Error al dar de baja el equipo" });
  }
}

export async function sacarEquipoDeBaja(req, res) {
  const { equipoId } = req.params;

  try {
    const equipo = await db.query(
      `SELECT id_equipo FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const enBaja = await db.query(
      `SELECT id_equipo FROM equipo_baja WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!enBaja.length) {
      return res.status(400).json({ error: "El equipo no está en baja." });
    }

    const componente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (componente.length) {
      return res
        .status(400)
        .json({ error: "No se puede mover un componente directamente." });
    }

    const computadora = await db.query(
      `SELECT id_computadora FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    let componentes = [];
    if (computadora.length) {
      componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );
    }

    let info = await db.query(
      `SELECT id_usuario, id_ubicacion, tipo FROM equipo_baja_info WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );
    if (!info.length) {
      return res.status(400).json({
        error:
          "No hay información previa de usuario y ubicación para este equipo. No se puede restaurar automáticamente.",
      });
    }
    const { id_usuario, id_ubicacion, tipo } = info[0];

    await db.query(`DELETE FROM equipo_baja WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });
    await db.query(`DELETE FROM equipo_baja_info WHERE id_equipo = :equipoId`, {
      replacements: { equipoId },
      type: QueryTypes.DELETE,
    });
    if (componentes.length) {
      const componenteIds = componentes.map((c) => c.id_componente);
      await db.query(
        `DELETE FROM equipo_baja WHERE id_equipo IN (:componenteIds)`,
        {
          replacements: { componenteIds },
          type: QueryTypes.DELETE,
        }
      );
      await db.query(
        `DELETE FROM equipo_baja_info WHERE id_equipo IN (:componenteIds)`,
        {
          replacements: { componenteIds },
          type: QueryTypes.DELETE,
        }
      );
    }

    if (tipo === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const comp of componentes) {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:idComponente, :id_usuario, :id_ubicacion)`,
            {
              replacements: {
                idComponente: comp.id_componente,
                id_usuario,
                id_ubicacion,
              },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else if (tipo === "bodega") {
      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );
      if (componentes.length) {
        for (const comp of componentes) {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente)`,
            {
              replacements: { idComponente: comp.id_componente },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    } else {
      return res.status(400).json({
        error:
          "Tipo no válido en equipo_baja_info. Debe ser 'activo' o 'bodega'.",
      });
    }

    res.json({ message: `Equipo movido de baja a ${tipo} correctamente.` });
  } catch (error) {
    console.error("Error al mover equipo de baja:", error);
    res.status(500).json({ error: "Error al mover equipo de baja" });
  }
}

export async function agregarEquipo(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    perifericoId,
    serie,
    modeloId,
    nombreEquipo,
    direccionIp,
    versionso,
    versionoffice,
    ram,
    disco,
    procesador,
    antivirus,
    dominio,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
    autor,
    empresa,
  } = req.body;

  try {
    const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';

    const id_serie = await obtenerOCrearSerie(serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    const parametros = {
      tipo,
      inventario,
      anio_compra,
      id_periferico: perifericoId,
      id_serie,
      nombreEquipo,
      direccionIp,
      versionso,
      versionoffice,
      ram,
      disco,
      procesador,
      antivirus,
      dominio,
      idUbicacion: tipo === "bodega" ? null : idUbicacion,
      idUsuario: tipo === "bodega" ? null : idUsuario,
      imagenRuta: tipo === "bodega" ? null : imagenRuta,
      observacion,
      autor: autorValue,
      empresa: empresa || null,
    };

    const result = await db.query(
      `CALL agregar_equipo(
        :tipo,
        :inventario,
        :anio_compra,
        :id_periferico,
        :id_serie,
        :nombreEquipo,
        :direccionIp,
        :versionso,
        :versionoffice,
        :ram,
        :disco,
        :procesador,
        :antivirus,
        :dominio,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion,
        :autor,
        :empresa
      );`,
      { replacements: parametros }
    );

    const equipoId = result[0]?.id_equipo;

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export async function agregarEquipoSimple(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    perifericoId,
    serie,
    modeloId,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
    idLampara,
    autor,
    empresa,
  } = req.body;

  try {
    const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';

    // Obtener o crear el usuario "Aula" para proyectores (si idLampara está presente, es un proyector)
    let usuarioFinal = idUsuario;
    if (tipo !== "bodega" && tipo !== "baja" && idLampara !== undefined && idLampara !== null) {
      const usuarioAulaId = await obtenerOCrearUsuario("Aula", "Aula");
      if (usuarioAulaId) {
        usuarioFinal = usuarioAulaId;
      }
    }

    const id_serie = await obtenerOCrearSerie(serie);
    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    const parametros = {
      tipo,
      inventario,
      anio_compra,
      id_periferico: perifericoId,
      id_serie,
      idUbicacion: tipo === "bodega" || tipo === "baja" ? null : idUbicacion,
      idUsuario: tipo === "bodega" || tipo === "baja" ? null : usuarioFinal,
      imagenRuta: tipo === "bodega" || tipo === "baja" ? null : imagenRuta,
      observacion,
      idLampara,
      autor: autorValue,
      empresa: empresa || null,
    };

    const result = await db.query(
      `CALL agregar_equipo_simple(
        :tipo,
        :inventario,
        :anio_compra,
        :id_periferico,
        :id_serie,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion,
        :idLampara,
        :autor,
        :empresa
      );`,
      { replacements: parametros }
    );

    const equipoId = result[0]?.id_equipo;

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export async function agregarEquipoRed(req, res) {
  const {
    tipo,
    inventario,
    anio_compra,
    perifericoId,
    serie,
    modeloId,
    idUbicacion,
    idUsuario,
    imagenRuta,
    observacion,
    mac,
    puertos,
    puerto_ftp,
    idLampara,
    nombreEquipo,
    autor,
    empresa,
  } = req.body;

  try {
    const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';

    // Obtener o crear el usuario "Red" para equipos de red (Switch o AccessPoint)
    let usuarioFinal = idUsuario;
    if (tipo !== "bodega" && tipo !== "baja") {
      const usuarioRedId = await obtenerOCrearUsuario("Red", "Red");
      if (usuarioRedId) {
        usuarioFinal = usuarioRedId;
      }
    }

    const id_serie = await obtenerOCrearSerie(serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    const parametros = {
      tipo,
      inventario,
      anio_compra,
      id_serie,
      id_periferico: perifericoId,
      idUbicacion: tipo === "bodega" || tipo === "baja" ? null : idUbicacion,
      idUsuario: tipo === "bodega" || tipo === "baja" ? null : usuarioFinal,
      imagenRuta: tipo === "bodega" || tipo === "baja" ? null : imagenRuta,
      observacion,
      mac,
      puertos,
      puerto_ftp,
      idLampara,
      nombreEquipo,
      autor: autorValue,
      empresa: empresa || null,
    };

    const result = await db.query(
      `CALL agregar_equipo_simple(
        :tipo,
        :inventario,
        :anio_compra,
        :id_periferico,
        :id_serie,
        :idUbicacion,
        :idUsuario,
        :imagenRuta,
        :observacion,
        :idLampara,
        :autor,
        :empresa
      );`,
      { replacements: parametros }
    );

    const equipoId = result[0]?.id_equipo;

    if (!equipoId) {
      return res.status(400).json({ error: "No se pudo agregar el equipo" });
    }

    await db.query(
      `INSERT INTO equipo_red (id_equipo_red, mac, puertos, puerto_ftp, nombre_equipo)
         VALUES (:equipoId, :mac, :puertos, :puerto_ftp, :nombreEquipo)`,
      {
        replacements: { equipoId, mac, puertos, puerto_ftp, nombreEquipo },
        type: QueryTypes.INSERT,
      }
    );

    res.json({ message: "Equipo agregado correctamente", equipoId });
  } catch (error) {
    console.error("Error al agregar equipo:", error);
    res.status(500).json({ error: "Error al agregar equipo" });
  }
}

export const obtenerActivoSimple = async (req, res) => {
  const { id } = req.params;

  try {
    const equipoRows = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         e.observacion,
         e.empresa,
         ep.id_lampara 
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       LEFT JOIN equipo_proyector ep ON ep.id_equipo_proyector = e.id_equipo
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipoRows.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const equipo = equipoRows[0];

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie,
              e.empresa 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN serie s ON e.id_serie = s.id_serie
       JOIN modelo_serie ms ON s.id_serie = ms.id_serie
       JOIN modelo mo ON ms.id_modelo = mo.id_modelo
       JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
       JOIN marca m ON mm.id_marca = m.id_marca
       JOIN marca_periferico mp ON m.id_marca = mp.id_marca
       JOIN periferico p ON mp.id_periferico = p.id_periferico
       WHERE c.id_computadora = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    const compRel = await db.query(
      `SELECT id_computadora FROM componente WHERE id_componente = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    const response = { equipo, componentes };

    if (compRel.length) {
      const id_computadora = compRel[0].id_computadora;
      const padreInfo = await db.query(
        `SELECT id_serie, id_periferico FROM equipo WHERE id_equipo = :idPadre LIMIT 1`,
        { replacements: { idPadre: id_computadora }, type: QueryTypes.SELECT }
      );

      response.isComponente = true;
      response.id_computadora = id_computadora;
      response.id_serie_computadora = padreInfo.length ? padreInfo[0].id_serie : null;
      response.id_periferico_computadora = padreInfo.length ? padreInfo[0].id_periferico : null;
    } else {
      response.isComponente = false;
    }

    res.json(response);
  } catch (error) {
    console.error("Error al obtener el equipo:", error);
    res.status(500).json({ error: "Error al obtener el equipo" });
  }
};

export const obtenerActivoRed = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         e.observacion,
         e.empresa,
         er.mac,
         er.puertos,
         er.puerto_ftp,
         er.nombre_equipo
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       LEFT JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.json({ equipo: equipo[0] });
  } catch (error) {
    console.error("Error al obtener el equipo de red:", error);
    res.status(500).json({ error: "Error al obtener el equipo de red" });
  }
};

export const obtenerComputadora = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         ea.id_usuario,
         u.id_uso,
         c.nombre_equipo,
         c.direccion_ip,
         c.id_versionso,
         c.id_versionoffice,
         c.id_ram,
         c.id_disco,
         c.id_procesador,
         c.id_antivirus,
         c.id_dominio,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         a.id_ubicacion,
         a.id_edificio,
         i.ruta AS imagenRuta,
         vso.id_sistemaoperativo,
         e.observacion,
         e.empresa
       FROM equipo e
       JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
       LEFT JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN usuario u ON ea.id_usuario = u.id_usuario
       LEFT JOIN uso us ON u.id_uso = us.id_uso
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       JOIN version_so vso ON vso.id_versionso = c.id_versionso
       JOIN ubicacion a ON ea.id_ubicacion = a.id_ubicacion
       JOIN equipo_imagen ei ON ei.id_equipo = e.id_equipo
       JOIN imagen i ON i.id_imagen = ei.id_imagen
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie,
              e.empresa 
       FROM componente c
       JOIN equipo e ON c.id_componente = e.id_equipo
       JOIN serie s ON e.id_serie = s.id_serie
      JOIN modelo_serie ms ON s.id_serie = ms.id_serie
      JOIN modelo mo ON ms.id_modelo = mo.id_modelo
      JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
      JOIN marca m ON mm.id_marca = m.id_marca
      JOIN marca_periferico mp ON m.id_marca = mp.id_marca
      JOIN periferico p ON mp.id_periferico = p.id_periferico
       WHERE c.id_computadora = :id AND e.id_periferico = p.id_periferico`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora:", error);
    res.status(500).json({ error: "Error al obtener la computadora" });
  }
};

export const obtenerComputadoraBodega = async (req, res) => {
  const { id } = req.params;

  try {
    const computadora = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         c.nombre_equipo,
         c.direccion_ip,
         c.id_versionso,
         c.id_versionoffice,
         c.id_ram,
         c.id_disco,
         c.id_procesador,
         c.id_antivirus,
         c.id_dominio,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         vso.id_sistemaoperativo,
         e.observacion,
         e.empresa
       FROM equipo e
       LEFT JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN version_so vso ON vso.id_versionso = c.id_versionso
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!computadora.length) {
      return res.status(404).json({ error: "Computadora no encontrada" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
          e.inventario, 
          p.nombre AS periferico, 
          m.nombre AS marca, 
          mo.nombre AS modelo, 
          s.nombre AS serie,
          e.empresa 
   FROM componente c
   JOIN equipo e ON c.id_componente = e.id_equipo
   JOIN serie s ON e.id_serie = s.id_serie
   JOIN modelo_serie ms ON s.id_serie = ms.id_serie
   JOIN modelo mo ON ms.id_modelo = mo.id_modelo
   JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
   JOIN marca m ON mm.id_marca = m.id_marca
   JOIN marca_periferico mp ON m.id_marca = mp.id_marca
   JOIN periferico p ON mp.id_periferico = p.id_periferico
   WHERE c.id_computadora = :id AND e.id_periferico = p.id_periferico`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ computadora: computadora[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora de bodega:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la computadora de bodega" });
  }
};

export const obtenerBodegaBajaSimple = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         e.observacion,
         e.empresa,
         ep.id_lampara
       FROM equipo e
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN equipo_proyector ep ON ep.id_equipo_proyector = e.id_equipo
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie,
              e.empresa 
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
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener la computadora de bodega:", error);
    res
      .status(500)
      .json({ error: "Error al obtener la computadora de bodega" });
  }
};

export const obtenerBodegaBajaRed = async (req, res) => {
  const { id } = req.params;

  try {
    const equipo = await db.query(
      `SELECT 
         e.id_equipo,
         e.inventario,
         e.anio_compra,
         e.id_serie,
         p.id_periferico,
         m.id_marca,
         mm.id_modelo,
         e.observacion,
         e.empresa,
         er.mac,
         er.puertos,
         er.puerto_ftp,
         er.nombre_equipo
       FROM equipo e
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       LEFT JOIN marca_modelo mm ON mm.id_modelo = (SELECT id_modelo FROM modelo_serie WHERE id_serie = e.id_serie LIMIT 1)
       LEFT JOIN marca m ON mm.id_marca = m.id_marca
       LEFT JOIN marca_periferico mp ON mp.id_marca = m.id_marca
       LEFT JOIN periferico p ON mp.id_periferico = p.id_periferico
       LEFT JOIN equipo_red er ON e.id_equipo = er.id_equipo_red
       WHERE e.id_equipo = :id
       AND (e.id_periferico = p.id_periferico)`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    const componentes = await db.query(
      `SELECT c.id_componente, 
              e.inventario, 
              p.nombre AS periferico, 
              m.nombre AS marca, 
              mo.nombre AS modelo, 
              s.nombre AS serie,
              e.empresa 
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
        type: QueryTypes.SELECT,
      }
    );

    res.json({ equipo: equipo[0], componentes });
  } catch (error) {
    console.error("Error al obtener el equipo de bodega:", error);
    res.status(500).json({ error: "Error al obtener el equipo de bodega" });
  }
};

export async function agregarComponentes(req, res) {
  const { tipo, equipoId, componentes, ubicacionId, usuarioId, imagenRuta, autor } =
    req.body;

  try {
    const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';

    for (const componente of componentes) {
      const id_serie = await obtenerOCrearSerie(componente.serie);
      const modeloId = componente.modeloId;

      if (id_serie && modeloId) {
        const existeRelacion = await db.query(
          `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.SELECT,
          }
        );
        if (!existeRelacion.length) {
          await db.query(
            `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
            {
              replacements: { modeloId, id_serie },
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      const result = await db.query(
        `INSERT INTO equipo (inventario, id_serie, id_periferico, autor) VALUES (:inventario, :serieId, :perifericoId, :autor);`,
        {
          replacements: {
            perifericoId: componente.perifericoId,
            inventario: componente.inventario,
            serieId: id_serie,
            autor: autorValue,
          },
        }
      );

      const idComponente = result[0];

      await db.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId);`,
        {
          replacements: {
            idComponente,
            equipoId,
          },
        }
      );

      if (tipo === "activo") {
        await db.query(
          `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId);`,
          {
            replacements: {
              idComponente,
              ubicacionId,
              usuarioId,
            },
          }
        );

        await db.query(
          `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, (SELECT id_imagen FROM imagen WHERE ruta = :imagenRuta));`,
          {
            replacements: {
              idComponente,
              imagenRuta,
            },
          }
        );
      } else if (tipo == "bodega") {
        await db.query(
          `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente);`,
          {
            replacements: {
              idComponente,
              ubicacionId,
              usuarioId,
            },
          }
        );
      }
    }

    res.json({ message: "Componentes agregados correctamente" });
  } catch (error) {
    console.error("Error al agregar componentes:", error);
    res.status(500).json({ error: "Error al agregar componentes" });
  }
}

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }

  const imagePath = join("/uploads", req.file.filename);

  res.json({ imagePath });
}

export async function editarEquipo(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    id_ram,
    id_disco,
    id_procesador,
    id_versionso,
    id_versionoffice,
    id_antivirus,
    id_dominio,
    perifericoId,
    serie,
    modeloId,
    inventario,
    anio_compra,
    nombre_equipo,
    direccion_ip,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
    editor,
    empresa,
  } = req.body;

  try {
    const editorValue = typeof editor === 'string' ? editor.trim().slice(0, 30) : '';

    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const id_serie_anterior = equipo[0].id_serie;
    const modelo_serie_anterior = await db.query(
      `SELECT id_modelo FROM modelo_serie WHERE id_serie = :id_serie_anterior LIMIT 1`,
      {
        replacements: { id_serie_anterior },
        type: QueryTypes.SELECT,
      }
    );
    const id_modelo_anterior = modelo_serie_anterior.length
      ? modelo_serie_anterior[0].id_modelo
      : null;

    const id_serie = await obtenerOCrearSerie(serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (imagenRuta && tipo === "activo") {
      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = 
          (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        const idImagenAntigua = imagenActual[0].id_imagen;

        const equiposRelacionados = await db.query(
          `SELECT id_equipo FROM equipo_imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.SELECT,
          }
        );

        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(
          `DELETE FROM imagen WHERE id_imagen = :idImagenAntigua`,
          {
            replacements: { idImagenAntigua },
            type: QueryTypes.DELETE,
          }
        );

        const imagePath = join(__dirname, "..", imagenActual[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }

        const [result] = await db.query(
          `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
          {
            replacements: { imagenRuta },
            type: QueryTypes.INSERT,
          }
        );

        const nuevaImagenId = result;

        for (const equipo of equiposRelacionados) {
          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :nuevaImagenId)`,
            {
              replacements: { equipoId: equipo.id_equipo, nuevaImagenId },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, id_periferico = :perifericoId, observacion = :observacion, editor = :editor, empresa = :empresa WHERE id_equipo = :equipoId`,
      {
        replacements: {
          equipoId,
          inventario,
          anio_compra,
          id_serie,
          perifericoId,
          observacion,
          editor: editorValue,
          empresa: empresa || null,
        },
        type: QueryTypes.UPDATE,
      }
    );

    await db.query(
      `UPDATE computadora SET
        nombre_equipo = :nombre_equipo,
        direccion_ip = :direccion_ip,
        id_versionso = :id_versionso,
        id_versionoffice = :id_versionoffice,
        id_ram = :id_ram,
        id_disco = :id_disco,
        id_procesador = :id_procesador,
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
          id_procesador,
          id_antivirus,
          id_dominio,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
          id_usuario = :id_usuario,
          id_ubicacion = :id_ubicacion
        WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (id_serie_anterior && id_serie_anterior !== id_serie && modeloId) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie_anterior`,
        {
          replacements: { modeloId, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
      await eliminarSerieSiNoUsada(id_serie_anterior);
    }

    if (
      id_modelo_anterior &&
      modeloId &&
      id_serie_anterior === id_serie &&
      id_modelo_anterior !== modeloId
    ) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :id_modelo_anterior AND id_serie = :id_serie_anterior`,
        {
          replacements: { id_modelo_anterior, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function editarEquipoSimple(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    perifericoId,
    serie,
    modeloId,
    inventario,
    anio_compra,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
    id_lampara,
    id_computadora,
    editor,
    empresa,
  } = req.body;

  try {
    const editorValue = typeof editor === 'string' ? editor.trim().slice(0, 30) : '';

    // Obtener o crear el usuario "Aula" para proyectores (si id_lampara está presente, es un proyector)
    let usuarioFinal = id_usuario;
    if (tipo === "activo" && id_lampara !== undefined && id_lampara !== null) {
      const usuarioAulaId = await obtenerOCrearUsuario("Aula", "Aula");
      if (usuarioAulaId) {
        usuarioFinal = usuarioAulaId;
      }
    }

    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const id_serie_anterior = equipo[0].id_serie;
    const modelo_serie_anterior = await db.query(
      `SELECT id_modelo FROM modelo_serie WHERE id_serie = :id_serie_anterior LIMIT 1`,
      {
        replacements: { id_serie_anterior },
        type: QueryTypes.SELECT,
      }
    );
    const id_modelo_anterior = modelo_serie_anterior.length
      ? modelo_serie_anterior[0].id_modelo
      : null;

    const id_serie = await obtenerOCrearSerie(serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (imagenRuta && tipo === "activo") {
      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
          {
            replacements: { idImagen: imagenActual[0].id_imagen },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
          replacements: { idImagen: imagenActual[0].id_imagen },
          type: QueryTypes.DELETE,
        });

        const imagePath = join(__dirname, "..", imagenActual[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }

      const [result] = await db.query(
        `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
        {
          replacements: { imagenRuta },
          type: QueryTypes.INSERT,
        }
      );

      const imagenId = result;

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, id_periferico = :perifericoId, observacion = :observacion, editor = :editor, empresa = :empresa WHERE id_equipo = :equipoId`,
      {
        replacements: {
          equipoId,
          inventario,
          anio_compra,
          id_serie,
          perifericoId,
          observacion,
          editor: editorValue,
          empresa: empresa || null,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
          id_usuario = :id_usuario,
          id_ubicacion = :id_ubicacion
        WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario: usuarioFinal,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (id_lampara !== undefined && id_lampara !== 0) {
      await db.query(
        `UPDATE equipo_proyector SET id_lampara = :id_lampara WHERE id_equipo_proyector = :equipoId`,
        {
          replacements: { id_lampara, equipoId },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (id_serie_anterior && id_serie_anterior !== id_serie && modeloId) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie_anterior`,
        {
          replacements: { modeloId, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
      await eliminarSerieSiNoUsada(id_serie_anterior);
    }

    if (
      id_modelo_anterior &&
      modeloId &&
      id_serie_anterior === id_serie &&
      id_modelo_anterior !== modeloId
    ) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :id_modelo_anterior AND id_serie = :id_serie_anterior`,
        {
          replacements: { id_modelo_anterior, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
    }

    if (typeof id_computadora !== "undefined" && id_computadora !== null) {
      const pc = await db.query(
      `SELECT id_computadora FROM computadora WHERE id_computadora = :id_computadora`,
      { replacements: { id_computadora }, type: QueryTypes.SELECT }
      );
      if (!pc.length) {
      return res.status(404).json({ error: "Computadora destino no encontrada" });
      }

      const existe = await db.query(
      `SELECT id_componente, id_computadora FROM componente WHERE id_componente = :equipoId`,
      { replacements: { equipoId }, type: QueryTypes.SELECT }
      );

      if (perifericoId) {
        const componentesExistentes = await db.query(
          `SELECT COUNT(*) as count FROM componente c 
           INNER JOIN equipo e ON c.id_componente = e.id_equipo 
           WHERE c.id_computadora = :id_computadora 
           AND e.id_periferico = :perifericoId 
           AND c.id_componente != :equipoId`,
          { 
            replacements: { id_computadora, perifericoId, equipoId }, 
            type: QueryTypes.SELECT 
          }
        );

        const cantidadActual = componentesExistentes[0].count;

        if (parseInt(perifericoId) === 3 && parseInt(id_computadora) === 1) {
          if (cantidadActual >= 2) {
            return res.status(400).json({ 
              error: "Ya se tiene el número máximo (2) de este componente agregado a esta computadora" 
            });
          }
        } else {
          if (cantidadActual >= 1) {
            return res.status(400).json({ 
              error: "Ya se tiene el número máximo de este componente agregado a esta computadora" 
            });
          }
        }
      }

      if (!existe.length) {
      await db.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:equipoId, :id_computadora)`,
        { replacements: { equipoId, id_computadora }, type: QueryTypes.INSERT }
      );
      } else if (existe[0].id_computadora !== id_computadora) {
      await db.query(
        `UPDATE componente SET id_computadora = :id_computadora WHERE id_componente = :equipoId`,
        { replacements: { id_computadora, equipoId }, type: QueryTypes.UPDATE }
      );
      }
    } else {
      const esComponente = await db.query(
      `SELECT id_componente FROM componente WHERE id_componente = :equipoId`,
      { replacements: { equipoId }, type: QueryTypes.SELECT }
      );

      if (esComponente.length) {
      await db.query(
        `DELETE FROM componente WHERE id_componente = :equipoId`,
        { replacements: { equipoId }, type: QueryTypes.DELETE }
      );
      }
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function editarEquipoRed(req, res) {
  const { equipoId } = req.params;
  const {
    tipo,
    perifericoId,
    serie,
    modeloId,
    inventario,
    anio_compra,
    id_usuario,
    id_ubicacion,
    imagenRuta,
    observacion,
    mac,
    puertos,
    puerto_ftp,
    nombre_equipo,
    editor,
    empresa,
  } = req.body;

  try {
    const editorValue = typeof editor === 'string' ? editor.trim().slice(0, 30) : '';

    // Obtener o crear el usuario "Red" para equipos de red (Switch o AccessPoint)
    let usuarioFinal = id_usuario;
    if (tipo === "activo") {
      const usuarioRedId = await obtenerOCrearUsuario("Red", "Red");
      if (usuarioRedId) {
        usuarioFinal = usuarioRedId;
      }
    }

    const equipo = await db.query(
      `SELECT * FROM equipo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipo.length) {
      return res.status(400).json({ error: "El equipo no existe." });
    }

    const id_serie_anterior = equipo[0].id_serie;
    const modelo_serie_anterior = await db.query(
      `SELECT id_modelo FROM modelo_serie WHERE id_serie = :id_serie_anterior LIMIT 1`,
      {
        replacements: { id_serie_anterior },
        type: QueryTypes.SELECT,
      }
    );
    const id_modelo_anterior = modelo_serie_anterior.length
      ? modelo_serie_anterior[0].id_modelo
      : null;

    const id_serie = await obtenerOCrearSerie(serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (imagenRuta && tipo === "activo") {
      const imagenActual = await db.query(
        `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      if (imagenActual.length) {
        await db.query(
          `DELETE FROM equipo_imagen WHERE id_imagen = :idImagen`,
          {
            replacements: { idImagen: imagenActual[0].id_imagen },
            type: QueryTypes.DELETE,
          }
        );

        await db.query(`DELETE FROM imagen WHERE id_imagen = :idImagen`, {
          replacements: { idImagen: imagenActual[0].id_imagen },
          type: QueryTypes.DELETE,
        });

        const imagePath = join(__dirname, "..", imagenActual[0].ruta);
        if (existsSync(imagePath)) {
          unlinkSync(imagePath);
        }
      }

      const [result] = await db.query(
        `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
        {
          replacements: { imagenRuta },
          type: QueryTypes.INSERT,
        }
      );

      const imagenId = result;

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );
    }

    await db.query(
      `UPDATE equipo SET inventario = :inventario, anio_compra = :anio_compra, id_serie = :id_serie, id_periferico = :perifericoId, observacion = :observacion, editor = :editor, empresa = :empresa WHERE id_equipo = :equipoId`,
      {
        replacements: {
          equipoId,
          inventario,
          anio_compra,
          id_serie,
          perifericoId,
          observacion,
          editor: editorValue,
          empresa: empresa || null,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (tipo === "activo") {
      await db.query(
        `UPDATE equipo_activo SET
                  id_usuario = :id_usuario,
                  id_ubicacion = :id_ubicacion
              WHERE id_equipo = :equipoId`,
        {
          replacements: {
            equipoId,
            id_usuario: usuarioFinal,
            id_ubicacion,
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (mac || puertos || puerto_ftp || nombre_equipo) {
      await db.query(
        `UPDATE equipo_red 
         SET mac = :mac, 
             puertos = :puertos, 
             puerto_ftp = :puerto_ftp,
             nombre_equipo = :nombre_equipo
         WHERE id_equipo_red = :equipoId`,
        {
          replacements: { equipoId, mac, puertos, puerto_ftp, nombre_equipo },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (id_serie_anterior && id_serie_anterior !== id_serie && modeloId) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie_anterior`,
        {
          replacements: { modeloId, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
    }

    if (
      id_modelo_anterior &&
      modeloId &&
      id_serie_anterior === id_serie &&
      id_modelo_anterior !== modeloId
    ) {
      await db.query(
        `DELETE FROM modelo_serie WHERE id_modelo = :id_modelo_anterior AND id_serie = :id_serie_anterior`,
        {
          replacements: { id_modelo_anterior, id_serie_anterior },
          type: QueryTypes.DELETE,
        }
      );
    }

    res.json({ message: "Equipo actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el equipo:", error);
    res.status(500).json({ error: "Error al actualizar el equipo" });
  }
}

export async function gestionarComponentesEditados(req, res) {
  const { tipo, equipoId, componentes, ubicacionId, usuarioId, imagenRuta, autor, editor } =
    req.body;

  try {
    const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';
    const editorValue = typeof editor === 'string' ? editor.trim().slice(0, 30) : '';

    const componentesActuales = await db.query(
      `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const componentesIdsActuales = componentesActuales.map(
      (comp) => comp.id_componente
    );
    const componentesIdsNuevos = componentes
      .map((comp) => comp.id_componente)
      .filter((id) => id !== undefined);

    const idsAEliminar = componentesIdsActuales.filter(
      (id) => !componentesIdsNuevos.includes(id)
    );

    if (idsAEliminar.length > 0) {
      await db.query(
        `DELETE FROM componente WHERE id_componente IN (:idsAEliminar)`,
        {
          replacements: { idsAEliminar },
          type: QueryTypes.DELETE,
        }
      );
    }


    for (const componente of componentes) {
    if (componente.id_componente) {
        await db.query(
          `UPDATE equipo SET editor = :editor WHERE id_equipo = :id_componente`,
          {
            replacements: {
              editor: editorValue,
              id_componente: componente.id_componente,
            },
            type: QueryTypes.UPDATE,
          }
        );
        continue;
    }

      try {
        const perifericoIdComponente = componente.perifericoId;

        const id_serie_componente = await obtenerOCrearSerie(componente.serie);
        const modeloIdComponente = componente.modeloId;
        if (id_serie_componente && modeloIdComponente) {
          const existeRelacionComp = await db.query(
            `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
            {
              replacements: {
                modeloId: modeloIdComponente,
                id_serie: id_serie_componente,
              },
              type: QueryTypes.SELECT,
            }
          );
          if (!existeRelacionComp.length) {
            await db.query(
              `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
              {
                replacements: {
                  modeloId: modeloIdComponente,
                  id_serie: id_serie_componente,
                },
                type: QueryTypes.INSERT,
              }
            );
          }
        }

        const resultComp = await db.query(
          `INSERT INTO equipo (inventario, id_serie, id_periferico, autor) VALUES (:inventario, :serieId, :perifericoId, :editor);`,
          {
            replacements: {
              inventario: componente.inventario,
              serieId: id_serie_componente,
              perifericoId: perifericoIdComponente,
              editor: editorValue,
            },
          }
        );
        const idComponente = resultComp[0];

        await db.query(
          `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId);`,
          {
            replacements: {
              idComponente,
              equipoId,
            },
          }
        );

        if (tipo === "activo") {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId);`,
            {
              replacements: {
                idComponente,
                ubicacionId,
                usuarioId,
              },
            }
          );

          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, 1);`,
            {
              replacements: {
                idComponente,
              },
            }
          );
        } else if (tipo === "bodega") {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente);`,
            {
              replacements: {
                idComponente,
              },
            }
          );
        }

      } catch (componenteError) {
        console.error(
          `Error al insertar componente ${componente.serie}:`,
          componenteError
        );
      }
    }

    res.json({ message: "Componentes gestionados correctamente" });
  } catch (error) {
    console.error("Error al gestionar componentes:", error);
    res.status(500).json({ error: "Error al gestionar componentes" });
  }
}

export const pasarActivoABodega = async (req, res) => {
  const { equipoId } = req.params;

  try {
    const isComponente = await db.query(
      `SELECT 1 FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (isComponente.length > 0) {
      return res.status(400).json({
        error: "No se puede mover un componente a bodega directamente.",
      });
    }

    const equipoActivo = await db.query(
      `SELECT * FROM equipo_activo WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipoActivo.length) {
      return res
        .status(400)
        .json({ error: "El equipo no se encuentra como activo." });
    }

    const imagen = await db.query(
      `SELECT id_imagen, ruta FROM imagen WHERE id_imagen = (SELECT id_imagen FROM equipo_imagen WHERE id_equipo = :equipoId)`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      await db.query(`DELETE FROM equipo_imagen WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `DELETE FROM equipo_imagen WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }

      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente)`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.INSERT,
            }
          );
          await db.query(
            `DELETE FROM equipo_activo WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
    } else {
      await db.query(`DELETE FROM equipo_imagen WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(`DELETE FROM equipo_activo WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        {
          replacements: { equipoId },
          type: QueryTypes.INSERT,
        }
      );
    }

    const imagePath = join(__dirname, "..", imagen[0].ruta);
    if (existsSync(imagePath)) {
      unlinkSync(imagePath);
    }

    res.json({
      message:
        "El equipo y sus componentes (si son computadora) han sido transferidos a bodega correctamente.",
    });
  } catch (error) {
    console.error("Error al transferir el equipo:", error);
    res.status(500).json({ error: "Error al transferir el equipo a bodega." });
  }
};

export const pasarBodegaAActivo = async (req, res) => {
  const { equipoId } = req.params;
  const { id_usuario, id_ubicacion, imagenRuta } = req.body;

  try {
    const isComponente = await db.query(
      `SELECT 1 FROM componente WHERE id_componente = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (isComponente.length > 0) {
      return res.status(400).json({
        error: "No se puede mover un componente a bodega directamente.",
      });
    }

    const equipoBodega = await db.query(
      `SELECT * FROM equipo_bodega WHERE id_equipo = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    if (!equipoBodega.length) {
      return res
        .status(400)
        .json({ error: "El equipo no se encuentra en bodega." });
    }

    const computadora = await db.query(
      `SELECT * FROM computadora WHERE id_computadora = :equipoId`,
      {
        replacements: { equipoId },
        type: QueryTypes.SELECT,
      }
    );

    const imagenInsert = await db.query(
      `INSERT INTO imagen (ruta) VALUES (:imagenRuta)`,
      {
        replacements: { imagenRuta },
        type: QueryTypes.INSERT,
      }
    );
    const imagenId = imagenInsert[0];

    if (computadora.length) {
      const componentes = await db.query(
        `SELECT id_componente FROM componente WHERE id_computadora = :equipoId`,
        {
          replacements: { equipoId },
          type: QueryTypes.SELECT,
        }
      );

      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:idComponente, :id_usuario, :id_ubicacion)`,
            {
              replacements: {
                idComponente: componente.id_componente,
                id_usuario,
                id_ubicacion,
              },
              type: QueryTypes.INSERT,
            }
          );

          await db.query(
            `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, :imagenId)`,
            {
              replacements: {
                idComponente: componente.id_componente,
                imagenId,
              },
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });

      if (componentes.length) {
        for (const componente of componentes) {
          await db.query(
            `DELETE FROM equipo_bodega WHERE id_equipo = :idComponente`,
            {
              replacements: { idComponente: componente.id_componente },
              type: QueryTypes.DELETE,
            }
          );
        }
      }
    } else {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_usuario, id_ubicacion) VALUES (:equipoId, :id_usuario, :id_ubicacion)`,
        {
          replacements: { equipoId, id_usuario, id_ubicacion },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, :imagenId)`,
        {
          replacements: { equipoId, imagenId },
          type: QueryTypes.INSERT,
        }
      );

      await db.query(`DELETE FROM equipo_bodega WHERE id_equipo = :equipoId`, {
        replacements: { equipoId },
        type: QueryTypes.DELETE,
      });
    }

    res.json({
      message:
        "El equipo ha sido transferido a activo correctamente, y la imagen asociada.",
    });
  } catch (error) {
    console.error("Error al transferir el equipo:", error);
    res
      .status(500)
      .json({ error: "Error al transferir el equipo de bodega a activo." });
  }
};

export async function insertarEquiposDesdeJSON(req, res) {
  const { equipos: equiposData, autor } = req.body;
  const autorValue = typeof autor === 'string' ? autor.trim().slice(0, 30) : '';
  const registrados = [];
  const noRegistrados = [];
  const componentesRegistrados = [];
  const monitorsToProcess = [];
  let equiposAgregados = 0;
  let seInsertaronNuevos = false;

  try {
    const existentes = await db.query(
      `SELECT inventario, s.nombre AS serie FROM equipo e JOIN serie s ON e.id_serie = s.id_serie`,
      { type: QueryTypes.SELECT }
    );
    const inventariosExistentes = new Set(existentes.map((e) => e.inventario));
    const seriesExistentes = new Set(
      existentes.map((e) => (e.serie || "").toUpperCase())
    );

    for (const equipoJson of equiposData) {
      try {
        const inventarioEquipo = (equipoJson.inventario || "").trim();
        const serieEquipo = (equipoJson.serie || "").trim().toUpperCase();

        const inventarioEsSN =
          !inventarioEquipo ||
          inventarioEquipo.replace(/\s/g, "").toUpperCase() === "S/N";
        const serieEsSN =
          !serieEquipo ||
          serieEquipo.replace(/\s/g, "").toUpperCase() === "S/N";

        if (
          (!inventarioEsSN && inventariosExistentes.has(inventarioEquipo)) ||
          (!serieEsSN && serieEquipo && seriesExistentes.has(serieEquipo))
        ) {
          noRegistrados.push({
            inventario: equipoJson.inventario,
            serie: equipoJson.serie,
            motivo: "Ya existe un equipo con el mismo inventario o serie",
            datos: equipoJson,
          });
          continue;
        }

        const tipoLower = (equipoJson.tipo || "").toString().toLowerCase();
        const hasMonitorComponent =
          Array.isArray(equipoJson.componentes) &&
          equipoJson.componentes.some((c) => {
            if (!c || !c.tipo) return false;
            if (!c.tipo.toString().toLowerCase().includes("monitor")) return false;
            const inv = (c.inventario || "").toString().trim().toUpperCase();
            const mod = (c.modelo || "").toString().trim().toUpperCase();
            const ser = (c.serie || "").toString().trim().toUpperCase();
            const mar = (c.marca || "").toString().trim().toUpperCase();
            const meaningful = (val) => val !== "" && val !== "S/N" && val !== "SN";
            return meaningful(inv) || meaningful(mod) || meaningful(ser) || meaningful(mar);
          });

        if (tipoLower.includes("monitor")) {
          if (hasMonitorComponent) {
            const inserted = await procesarComponenteIndividual(
              equipoJson,
              componentesRegistrados,
              noRegistrados
            );
            if (inserted) {
              equiposAgregados++;
              seInsertaronNuevos = true;
            }
            if (!inventarioEsSN) inventariosExistentes.add(inventarioEquipo);
            if (!serieEsSN && serieEquipo) seriesExistentes.add(serieEquipo);
            continue;
          } else {
            monitorsToProcess.push(equipoJson);
            if (!inventarioEsSN) inventariosExistentes.add(inventarioEquipo);
            if (!serieEsSN && serieEquipo) seriesExistentes.add(serieEquipo);
            continue;
          }
        }

        let fueInsertado = false;

        if (
          tipoLower === "computadora" ||
          tipoLower === "laptop" ||
          tipoLower === "desktop" ||
          tipoLower === "imac" ||
          tipoLower === "all-in-one"
        ) {
          fueInsertado = await procesarComputadoraOLaptop(
            equipoJson,
            registrados,
            noRegistrados,
            componentesRegistrados,
            autorValue
          );
        } else if (tipoLower === "switch") {
          fueInsertado = await procesarSwitch(
            equipoJson,
            registrados,
            noRegistrados,
            autorValue
          );
        } else if (tipoLower === "accesspoint" || tipoLower === "access point") {
          fueInsertado = await procesarAccessPoint(
            equipoJson,
            registrados,
            noRegistrados,
            autorValue
          );
        } else if (tipoLower === "proyector") {
          fueInsertado = await procesarProyector(
            equipoJson,
            registrados,
            noRegistrados,
            autorValue
          );
        } else {
          fueInsertado = await procesarComponenteIndividual(
            equipoJson,
            componentesRegistrados,
            noRegistrados
          );
        }

        if (fueInsertado) {
          equiposAgregados++;
          seInsertaronNuevos = true;
          inventariosExistentes.add(inventarioEquipo);
          if (serieEquipo) seriesExistentes.add(serieEquipo);
        }

        if (equiposAgregados - 3 === 0) {
          equiposAgregados = 0;
          seInsertaronNuevos = false;
        }
      } catch (equipoError) {
        console.error(
          `Error al procesar equipo ${equipoJson.inventario}:`,
          equipoError
        );
        noRegistrados.push({
          inventario: equipoJson.inventario,
          motivo: equipoError.message,
          datos: equipoJson,
        });
      }
    }

    for (const monitorJson of monitorsToProcess) {
      try {
        const procesado = await procesarMonitorStandalone(
          monitorJson,
          registrados,
          noRegistrados,
          componentesRegistrados
        );
        if (procesado) {
          equiposAgregados++;
          seInsertaronNuevos = true;
        }
      } catch (mErr) {
        console.error(`Error al procesar monitor ${monitorJson.inventario}:`, mErr);
        noRegistrados.push({
          inventario: monitorJson.inventario,
          motivo: mErr.message,
          datos: monitorJson,
        });
      }
    }

    const respuesta = {
      success: true,
      message: "Proceso completado",
      resumen: {
        totalProcesados: equiposData.length,
        registrados: registrados.length,
        noRegistrados: noRegistrados.length,
        equiposAgregados,
        seInsertaronNuevos,
      },
      registrados,
      noRegistrados,
    };

    guardarLogImportacion(respuesta);

    res.json(respuesta);
  } catch (error) {
    console.error("Error general al insertar equipos:", error);
    const errorRespuesta = {
      success: false,
      error: "Error al insertar equipos desde JSON",
      message: error.message,
      stack: error.stack,
    };

    guardarLogImportacion(errorRespuesta);

    res.status(500).json(errorRespuesta);
  }
}

async function agregarComponentesAEquipoPrincipal(
  componentes,
  equipoId,
  equipoJson,
  ubicacionId,
  usuarioId,
  componentesRegistrados
) {
  if (!Array.isArray(componentes)) return;

  for (const componente of componentes) {
    if (!componente.inventario || String(componente.inventario).trim() === "") {
      componente.inventario = "S/N";
    }
    const campos = [componente.modelo, componente.serie, componente.inventario];
    const tieneDatos = campos.some(
      (v) => v && String(v).trim().toUpperCase() !== "S/N"
    );
    if (!tieneDatos) continue;

    try {
      const perifericoIdComponente =
        (await obtenerIdPeriferico(componente.tipo)) || componente.perifericoId;

      const id_marca = await obtenerOCrearMarca(
        componente.marca,
        perifericoIdComponente
      );

      const modeloIdComponente = await obtenerOCrearModelo(
        componente.modelo,
        id_marca
      );

      const id_serie_componente = await obtenerOCrearSerie(componente.serie);

      if (id_serie_componente && modeloIdComponente) {
        const existeRelacionComp = await db.query(
          `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
          {
            replacements: {
              modeloId: modeloIdComponente,
              id_serie: id_serie_componente,
            },
            type: QueryTypes.SELECT,
          }
        );
        if (!existeRelacionComp.length) {
          await db.query(
            `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
            {
              replacements: {
                modeloId: modeloIdComponente,
                id_serie: id_serie_componente,
              },
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      if (id_marca && modeloIdComponente) {
        const existeMarcaModelo = await db.query(
          `SELECT 1 FROM marca_modelo WHERE id_marca = :id_marca AND id_modelo = :id_modelo`,
          {
            replacements: { id_marca, id_modelo: modeloIdComponente },
            type: QueryTypes.SELECT,
          }
        );
        if (!existeMarcaModelo.length) {
          await db.query(
            `INSERT INTO marca_modelo (id_marca, id_modelo) VALUES (:id_marca, :id_modelo)`,
            {
              replacements: { id_marca, id_modelo: modeloIdComponente },
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      const resultComp = await db.query(
        `INSERT INTO equipo (inventario, id_serie, id_periferico) VALUES (:inventario, :serieId, :perifericoId);`,
        {
          replacements: {
            inventario: componente.inventario,
            serieId: id_serie_componente,
            perifericoId: perifericoIdComponente,
          },
        }
      );
      const idComponente = resultComp[0];

      await db.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :equipoId);`,
        {
          replacements: {
            idComponente,
            equipoId,
          },
        }
      );

      if ((equipoJson.tipo_inventario || "activo") === "activo") {
        await db.query(
          `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId);`,
          {
            replacements: {
              idComponente,
              ubicacionId,
              usuarioId,
            },
          }
        );

        await db.query(
          `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, 1);`,
          {
            replacements: {
              idComponente,
            },
          }
        );
      } else if ((equipoJson.tipo_inventario || "activo") === "bodega") {
        await db.query(
          `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente);`,
          {
            replacements: {
              idComponente,
            },
          }
        );
      }

      componentesRegistrados.push(componente);
    } catch (componenteError) {
      console.error(
        `Error al insertar componente ${componente.serie}:`,
        componenteError
      );
    }
  }
}

async function procesarComputadoraOLaptop(
  equipoJson,
  registrados,
  noRegistrados,
  componentesRegistrados,
  autor
) {
  const perifericoId = equipoJson.tipo.toLowerCase() === "laptop" ? 2 : 1;
  if (equipoJson.nombreEquipo && String(equipoJson.nombreEquipo).length > 30) {
    throw new Error("El nombre del equipo excede 30 caracteres.");
  }

  const id_marca = await obtenerOCrearMarca(equipoJson.marca, perifericoId);
  const modeloId = await obtenerOCrearModelo(equipoJson.modelo, id_marca);
  const ubicacionId = await obtenerOCrearUbicacion(
    equipoJson.ubicacion,
    equipoJson.edificio
  );
  const usuarioId = await obtenerOCrearUsuario(
    equipoJson.usuario,
    equipoJson.uso
  );
  const dominioId = await obtenerOCrearDominio(equipoJson.dominio);
  const sistemaOperativoId = await obtenerIdSistemaOperativo(
    equipoJson.versionso
  );
  const procesadorId = await obtenerOCrearProcesador(equipoJson.procesador);
  const ramId = await obtenerOCrearRam(equipoJson.ram, equipoJson.tipo_ram);
  const versionOfficeId = 2;
  const discoId = await obtenerOCrearDisco(equipoJson.disco);

  if (!ubicacionId || !usuarioId) {
    noRegistrados.push({
      inventario: equipoJson.inventario,
      motivo: "No se encontró ubicación o usuario",
      datos: equipoJson,
    });
    return false;
  }

  const id_serie = await obtenerOCrearSerie(equipoJson.serie);

  if (id_serie && modeloId) {
    const existeRelacion = await db.query(
      `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
      {
        replacements: { modeloId, id_serie },
        type: QueryTypes.SELECT,
      }
    );
    if (!existeRelacion.length) {
      await db.query(
        `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.INSERT,
        }
      );
    }
  }

  if (id_marca && modeloId) {
    const existeMarcaModelo = await db.query(
      `SELECT 1 FROM marca_modelo WHERE id_marca = :id_marca AND id_modelo = :id_modelo`,
      {
        replacements: { id_marca, id_modelo: modeloId },
        type: QueryTypes.SELECT,
      }
    );
    if (!existeMarcaModelo.length) {
      await db.query(
        `INSERT INTO marca_modelo (id_marca, id_modelo) VALUES (:id_marca, :id_modelo)`,
        {
          replacements: { id_marca, id_modelo: modeloId },
          type: QueryTypes.INSERT,
        }
      );
    }
  }

  if (!equipoJson.inventario || String(equipoJson.inventario).trim() === "") {
    equipoJson.inventario = "S/N";
  }

  const parametrosEquipo = {
    p_tipo: equipoJson.tipo_inventario || "activo",
    p_inventario: equipoJson.inventario,
    p_anio_compra:
      equipoJson.anio_compra === "S/N" || !equipoJson.anio_compra ? 2026 : equipoJson.anio_compra,
    p_id_periferico: perifericoId,
    p_id_serie: id_serie,
    p_nombre_equipo: equipoJson.nombreEquipo,
    p_direccion_ip: equipoJson.direccionIp || null,
    p_versionso: sistemaOperativoId || null,
    p_versionoffice: versionOfficeId || null,
    p_ram: ramId || null,
    p_disco: discoId || null,
    p_procesador: procesadorId || null,
    p_antivirus: 1,
    p_dominio: dominioId || null,
    p_id_ubicacion: ubicacionId,
    p_id_usuario: usuarioId,
    p_observacion: equipoJson.observacion || null,
    p_autor: autor || null,
    p_empresa: equipoJson.empresa || null,
  };

  const result = await db.query(
    `CALL importar_equipo(
            :p_tipo,
            :p_inventario,
            :p_anio_compra,
            :p_id_periferico,
            :p_id_serie,
            :p_nombre_equipo,
            :p_direccion_ip,
            :p_versionso,
            :p_versionoffice,
            :p_ram,
            :p_disco,
            :p_procesador,
            :p_antivirus,
            :p_dominio,
            :p_id_ubicacion,
            :p_id_usuario,
            :p_observacion,
            :p_autor,
            :p_empresa
        );`,
    { replacements: parametrosEquipo }
  );

  const equipoId = result[0]?.id_equipo;

  await agregarComponentesAEquipoPrincipal(
    equipoJson.componentes,
    equipoId,
    equipoJson,
    ubicacionId,
    usuarioId,
    componentesRegistrados
  );

  registrados.push({
    inventario: equipoJson.inventario,
    equipoId: equipoId,
    componentesRegistrados: componentesRegistrados.length,
    datos: equipoJson,
  });

  return true;
}

async function procesarComponenteIndividual(
  equipoJson,
  componentesRegistrados,
  noRegistrados
) {
  let insertado = false;
  if (equipoJson.componentes && Array.isArray(equipoJson.componentes)) {
    for (const componente of equipoJson.componentes) {
      if (componente.tipo.toLowerCase() === equipoJson.tipo.toLowerCase()) {
        try {
          const inventarioComp = (componente.inventario || "").trim();
          const inventarioEsSN =
            !inventarioComp ||
            inventarioComp.replace(/\s/g, "").toUpperCase() === "S/N";
          if (!inventarioEsSN) {
            const equipoExistente = await db.query(
              `SELECT id_equipo FROM equipo WHERE inventario = :inventario`,
              {
                replacements: { inventario: inventarioComp },
                type: QueryTypes.SELECT,
              }
            );
            if (equipoExistente.length > 0) {
              noRegistrados.push({
                inventario: equipoJson.inventario,
                motivo: "Ya existe en la base de datos",
                datos: equipoJson,
              });
              continue;
            }
          }

          const ubicacionId = await obtenerOCrearUbicacion(
            equipoJson.ubicacion,
            equipoJson.edificio
          );
          const usuarioId = await obtenerOCrearUsuario(
            equipoJson.usuario,
            equipoJson.uso
          );

          await procesarComponente(
            componente,
            equipoJson,
            ubicacionId,
            usuarioId,
            componentesRegistrados
          );
          insertado = true;
        } catch (componenteError) {
          console.error(
            `Error al insertar componente ${componente.serie}:`,
            componenteError
          );
        }
      }
    }
  }
  return insertado;
}

async function procesarSwitch(
  equipoJson,
  registrados,
  noRegistrados,
  autor
) {
  try {
    const tipoInventario = equipoJson.tipo_inventario || "activo";
    let ubicacionId = null;
    let usuarioId = null;

    // Solo obtener ubicación y usuario si es equipo activo
    if (tipoInventario === "activo") {
      ubicacionId = await obtenerOCrearUbicacion(
        equipoJson.ubicacion,
        equipoJson.edificio
      );

      if (!ubicacionId) {
        noRegistrados.push({
          inventario: equipoJson.inventario,
          motivo: "No se pudo obtener o crear la ubicación",
          datos: equipoJson,
        });
        return false;
      }

      usuarioId = await obtenerOCrearUsuario("Red", "Red");
    }

    const perifericoId = await obtenerOCrearPeriferico("Switch");

    const id_marca = await obtenerOCrearMarca(equipoJson.marca, perifericoId);
    const modeloId = await obtenerOCrearModelo(equipoJson.modelo, id_marca);
    const id_serie = await obtenerOCrearSerie(equipoJson.serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (id_marca && perifericoId) {
      const relacionMarcaPeriferico = await db.query(
        `SELECT 1 FROM marca_periferico WHERE id_marca = :id_marca AND id_periferico = :perifericoId`,
        {
          replacements: { id_marca, perifericoId },
          type: QueryTypes.SELECT,
        }
      );
      if (!relacionMarcaPeriferico.length) {
        await db.query(
          `INSERT INTO marca_periferico (id_marca, id_periferico) VALUES (:id_marca, :perifericoId)`,
          {
            replacements: { id_marca, perifericoId },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (!equipoJson.inventario || String(equipoJson.inventario).trim() === "") {
      equipoJson.inventario = "S/N";
    }

    const insertRes = await db.query(
      `INSERT INTO equipo (inventario, anio_compra, id_serie, id_periferico, observacion, autor, empresa) 
       VALUES (:inventario, :anio_compra, :id_serie, :perifericoId, :observacion, :autor, :empresa)`,
      {
        replacements: {
          inventario: equipoJson.inventario,
          anio_compra: equipoJson.anio_compra === "S/N" || !equipoJson.anio_compra ? 2026 : equipoJson.anio_compra,
          id_serie,
          perifericoId,
          observacion: equipoJson.observacion || null,
          autor: autor || null,
          empresa: equipoJson.empresa || null,
        },
        type: QueryTypes.INSERT,
      }
    );
    const equipoId = insertRes[0];

    if (tipoInventario === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) 
         VALUES (:equipoId, :ubicacionId, :usuarioId)`,
        {
          replacements: { equipoId, ubicacionId, usuarioId },
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, 1)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "bodega") {
      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "baja") {
      await db.query(
        `INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    }

    await db.query(
      `INSERT INTO equipo_red (id_equipo_red, mac, puertos, puerto_ftp, nombre_equipo) 
       VALUES (:equipoId, :mac, :puertos, :puerto_ftp, :nombre_equipo)`,
      {
        replacements: {
          equipoId,
          mac: equipoJson.mac || null,
          puertos: equipoJson.puertos || null,
          puerto_ftp: equipoJson.puerto_ftp || null,
          nombre_equipo: equipoJson.nombre || null,
        },
      }
    );

    registrados.push({
      inventario: equipoJson.inventario,
      equipoId,
      tipo: "Switch",
      datos: equipoJson,
    });

    return true;
  } catch (error) {
    console.error("Error procesando switch:", error);
    noRegistrados.push({
      inventario: equipoJson.inventario,
      motivo: error.message,
      datos: equipoJson,
    });
    return false;
  }
}

async function procesarAccessPoint(
  equipoJson,
  registrados,
  noRegistrados,
  autor
) {
  try {
    const tipoInventario = equipoJson.tipo_inventario || "activo";
    let ubicacionId = null;
    let usuarioId = null;

    // Solo obtener ubicación y usuario si es equipo activo
    if (tipoInventario === "activo") {
      ubicacionId = await obtenerOCrearUbicacion(
        equipoJson.ubicacion,
        equipoJson.edificio
      );

      if (!ubicacionId) {
        noRegistrados.push({
          inventario: equipoJson.inventario,
          motivo: "No se pudo obtener o crear la ubicación",
          datos: equipoJson,
        });
        return false;
      }

      usuarioId = await obtenerOCrearUsuario("Red", "Red");
    }

    const perifericoId = await obtenerOCrearPeriferico("AccessPoint");

    const id_marca = await obtenerOCrearMarca(equipoJson.marca, perifericoId);
    const modeloId = await obtenerOCrearModelo(equipoJson.modelo, id_marca);
    const id_serie = await obtenerOCrearSerie(equipoJson.serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (id_marca && perifericoId) {
      const relacionMarcaPeriferico = await db.query(
        `SELECT 1 FROM marca_periferico WHERE id_marca = :id_marca AND id_periferico = :perifericoId`,
        {
          replacements: { id_marca, perifericoId },
          type: QueryTypes.SELECT,
        }
      );
      if (!relacionMarcaPeriferico.length) {
        await db.query(
          `INSERT INTO marca_periferico (id_marca, id_periferico) VALUES (:id_marca, :perifericoId)`,
          {
            replacements: { id_marca, perifericoId },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (!equipoJson.inventario || String(equipoJson.inventario).trim() === "") {
      equipoJson.inventario = "S/N";
    }

    const insertRes = await db.query(
      `INSERT INTO equipo (inventario, anio_compra, id_serie, id_periferico, observacion, autor, empresa) 
       VALUES (:inventario, :anio_compra, :id_serie, :perifericoId, :observacion, :autor, :empresa)`,
      {
        replacements: {
          inventario: equipoJson.inventario,
          anio_compra: equipoJson.anio_compra === "S/N" || !equipoJson.anio_compra ? 2026 : equipoJson.anio_compra,
          id_serie,
          perifericoId,
          observacion: equipoJson.observacion || null,
          autor: autor || null,
          empresa: equipoJson.empresa || null,
        },
        type: QueryTypes.INSERT,
      }
    );
    const equipoId = insertRes[0];

    if (tipoInventario === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) 
         VALUES (:equipoId, :ubicacionId, :usuarioId)`,
        {
          replacements: { equipoId, ubicacionId, usuarioId },
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, 1)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "bodega") {
      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "baja") {
      await db.query(
        `INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    }

    await db.query(
      `INSERT INTO equipo_red (id_equipo_red, mac, puertos, puerto_ftp, nombre_equipo) 
       VALUES (:equipoId, :mac, NULL, NULL, :nombre_equipo)`,
      {
        replacements: {
          equipoId,
          mac: equipoJson.mac || null,
          nombre_equipo: equipoJson.nombre || null,
        },
      }
    );

    registrados.push({
      inventario: equipoJson.inventario,
      equipoId,
      tipo: "AccessPoint",
      datos: equipoJson,
    });

    return true;
  } catch (error) {
    console.error("Error procesando access point:", error);
    noRegistrados.push({
      inventario: equipoJson.inventario,
      motivo: error.message,
      datos: equipoJson,
    });
    return false;
  }
}

async function procesarProyector(
  equipoJson,
  registrados,
  noRegistrados,
  autor
) {
  try {
    const tipoInventario = equipoJson.tipo_inventario || "activo";
    let ubicacionId = null;
    let usuarioId = null;

    // Solo obtener ubicación y usuario si es equipo activo
    if (tipoInventario === "activo") {
      ubicacionId = await obtenerOCrearUbicacion(
        equipoJson.ubicacion,
        equipoJson.edificio
      );

      if (!ubicacionId) {
        noRegistrados.push({
          inventario: equipoJson.inventario,
          motivo: "No se pudo obtener o crear la ubicación",
          datos: equipoJson,
        });
        return false;
      }

      usuarioId = await obtenerOCrearUsuario("Aula", "Aula");
    }

    const perifericoId = await obtenerOCrearPeriferico("Proyector");

    const id_marca = await obtenerOCrearMarca(equipoJson.marca, perifericoId);
    
    // Concatenar categoría con modelo si la categoría está presente
    let nombreModelo = equipoJson.modelo;
    if (equipoJson.categoria && equipoJson.categoria.trim() !== "" && equipoJson.categoria !== "S/N") {
      nombreModelo = `${equipoJson.categoria}-${equipoJson.modelo}`;
    }
    
    const modeloId = await obtenerOCrearModelo(nombreModelo, id_marca);
    const id_serie = await obtenerOCrearSerie(equipoJson.serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (id_marca && perifericoId) {
      const relacionMarcaPeriferico = await db.query(
        `SELECT 1 FROM marca_periferico WHERE id_marca = :id_marca AND id_periferico = :perifericoId`,
        {
          replacements: { id_marca, perifericoId },
          type: QueryTypes.SELECT,
        }
      );
      if (!relacionMarcaPeriferico.length) {
        await db.query(
          `INSERT INTO marca_periferico (id_marca, id_periferico) VALUES (:id_marca, :perifericoId)`,
          {
            replacements: { id_marca, perifericoId },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    if (!equipoJson.inventario || String(equipoJson.inventario).trim() === "") {
      equipoJson.inventario = "S/N";
    }

    let idLampara = null;
    if (equipoJson.lampara && equipoJson.lampara !== "S/N") {
      idLampara = await obtenerOCrearLampara(equipoJson.lampara, modeloId);
    }

    const insertRes = await db.query(
      `INSERT INTO equipo (inventario, anio_compra, id_serie, id_periferico, observacion, autor, empresa) 
       VALUES (:inventario, :anio_compra, :id_serie, :perifericoId, :observacion, :autor, :empresa)`,
      {
        replacements: {
          inventario: equipoJson.inventario,
          anio_compra: equipoJson.anio_compra === "S/N" || !equipoJson.anio_compra ? 2026 : equipoJson.anio_compra,
          id_serie,
          perifericoId,
          observacion: equipoJson.observacion || null,
          autor: autor || null,
          empresa: equipoJson.empresa || null,
        },
        type: QueryTypes.INSERT,
      }
    );
    const equipoId = insertRes[0];

    if (tipoInventario === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) 
         VALUES (:equipoId, :ubicacionId, :usuarioId)`,
        {
          replacements: { equipoId, ubicacionId, usuarioId },
        }
      );

      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:equipoId, 1)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "bodega") {
      await db.query(
        `INSERT INTO equipo_bodega (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    } else if (tipoInventario === "baja") {
      await db.query(
        `INSERT INTO equipo_baja (id_equipo) VALUES (:equipoId)`,
        { replacements: { equipoId } }
      );
    }

    if (idLampara) {
      await db.query(
        `INSERT INTO equipo_proyector (id_equipo_proyector, id_lampara) 
         VALUES (:equipoId, :idLampara)`,
        {
          replacements: { equipoId, idLampara },
        }
      );
    } else {
      await db.query(
        `INSERT INTO equipo_proyector (id_equipo_proyector) 
         VALUES (:equipoId)`,
        {
          replacements: { equipoId },
        }
      );
    }

    registrados.push({
      inventario: equipoJson.inventario,
      equipoId,
      tipo: "Proyector",
      datos: equipoJson,
    });

    return true;
  } catch (error) {
    console.error("Error procesando proyector:", error);
    noRegistrados.push({
      inventario: equipoJson.inventario,
      motivo: error.message,
      datos: equipoJson,
    });
    return false;
  }
}

async function obtenerOCrearLampara(nombreLampara, modeloId) {
  if (!nombreLampara || nombreLampara.trim().toUpperCase() === "S/N") {
    return null;
  }
  if (nombreLampara.length > 30) {
    throw new Error("El nombre de la lámpara excede 30 caracteres.");
  }
  try {
    const nombre = nombreLampara.trim();
    let lampara = await db.query(
      `SELECT id_lampara FROM lampara WHERE nombre = :nombre`,
      {
        replacements: { nombre },
        type: QueryTypes.SELECT,
      }
    );
    
    if (lampara.length) {
      const idLampara = lampara[0].id_lampara;
      
      if (modeloId) {
        const relacionExiste = await db.query(
          `SELECT 1 FROM modelo_lampara WHERE id_modelo = :modeloId AND id_lampara = :idLampara`,
          {
            replacements: { modeloId, idLampara },
            type: QueryTypes.SELECT,
          }
        );
        
        if (!relacionExiste.length) {
          await db.query(
            `INSERT INTO modelo_lampara (id_modelo, id_lampara) VALUES (:modeloId, :idLampara)`,
            {
              replacements: { modeloId, idLampara },
              type: QueryTypes.INSERT,
            }
          );
        }
      }
      
      return idLampara;
    }
    
    const [result] = await db.query(
      `INSERT INTO lampara (nombre) VALUES (:nombre)`,
      {
        replacements: { nombre },
        type: QueryTypes.INSERT,
      }
    );
    const idLampara = result;
    
    if (modeloId) {
      await db.query(
        `INSERT INTO modelo_lampara (id_modelo, id_lampara) VALUES (:modeloId, :idLampara)`,
        {
          replacements: { modeloId, idLampara },
          type: QueryTypes.INSERT,
        }
      );
    }
    
    return idLampara;
  } catch (error) {
    throw new Error("Error al obtener/crear lámpara: " + error.message);
  }
}

async function procesarComponente(
  componente,
  equipoJson,
  ubicacionId,
  usuarioId,
  componentesRegistrados
) {
  const perifericoIdComponente =
    (await obtenerIdPeriferico(componente.tipo)) || componente.perifericoId;

  const id_marca = await obtenerOCrearMarca(
    componente.marca,
    perifericoIdComponente
  );

  const modeloIdComponente = await obtenerOCrearModelo(
    componente.modelo,
    id_marca
  );

  const id_serie_componente = await obtenerOCrearSerie(componente.serie);

  if (id_serie_componente && modeloIdComponente) {
    const existeRelacionComp = await db.query(
      `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
      {
        replacements: {
          modeloId: modeloIdComponente,
          id_serie: id_serie_componente,
        },
        type: QueryTypes.SELECT,
      }
    );
    if (!existeRelacionComp.length) {
      await db.query(
        `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
        {
          replacements: {
            modeloId: modeloIdComponente,
            id_serie: id_serie_componente,
          },
          type: QueryTypes.INSERT,
        }
      );
    }
  }

  if (id_marca && modeloIdComponente) {
    const existeMarcaModelo = await db.query(
      `SELECT 1 FROM marca_modelo WHERE id_marca = :id_marca AND id_modelo = :id_modelo`,
      {
        replacements: { id_marca, id_modelo: modeloIdComponente },
        type: QueryTypes.SELECT,
      }
    );
    if (!existeMarcaModelo.length) {
      await db.query(
        `INSERT INTO marca_modelo (id_marca, id_modelo) VALUES (:id_marca, :id_modelo)`,
        {
          replacements: { id_marca, id_modelo: modeloIdComponente },
          type: QueryTypes.INSERT,
        }
      );
    }
  }

  if (!componente.inventario || String(componente.inventario).trim() === "") {
    componente.inventario = "S/N";
  }

  const resultComp = await db.query(
    `INSERT INTO equipo (inventario, id_serie, id_periferico) VALUES (:inventario, :serieId, :perifericoId);`,
    {
      replacements: {
        inventario: componente.inventario,
        serieId: id_serie_componente,
        perifericoId: perifericoIdComponente,
      },
    }
  );
  const idComponente = resultComp[0];
  const tipoInventario = componente.tipo_inventario || equipoJson.tipo_inventario || "activo";
  if (tipoInventario === "activo") {
    await db.query(
      `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:idComponente, :ubicacionId, :usuarioId);`,
      {
        replacements: {
          idComponente,
          ubicacionId,
          usuarioId,
        },
      }
    );

    await db.query(
      `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:idComponente, 1);`,
      {
        replacements: {
          idComponente,
        },
      }
    );
  } else if (tipoInventario === "bodega") {
    await db.query(
      `INSERT INTO equipo_bodega (id_equipo) VALUES (:idComponente);`,
      {
        replacements: { idComponente },
      }
    );
  } else if (tipoInventario === "baja") {
    await db.query(
      `INSERT INTO equipo_baja (id_equipo) VALUES (:idComponente);`,
      {
        replacements: { idComponente },
      }
    );
  }

  const tipoLower = (componente.tipo || "").toString().toLowerCase();
  if (tipoLower.includes("monitor") && usuarioId) {
    const posibles = await db.query(
      `SELECT ea.id_equipo FROM equipo_activo ea
         JOIN equipo e ON ea.id_equipo = e.id_equipo
         WHERE ea.id_usuario = :usuarioId
           AND e.id_periferico IN (:ids)
         LIMIT 1`,
      {
        replacements: { usuarioId, ids: [1, 2] },
        type: QueryTypes.SELECT,
      }
    );
    if (posibles.length) {
      const idComputadora = posibles[0].id_equipo;
      await db.query(
        `INSERT INTO componente (id_componente, id_computadora) VALUES (:idComponente, :idComputadora)`,
        {
          replacements: { idComponente, idComputadora },
        }
      );
    }
  }

  componentesRegistrados.push(componente);
}

async function procesarMonitorStandalone(
  monitorJson,
  registrados,
  noRegistrados,
  componentesRegistrados
) {
  try {
    if (!monitorJson.inventario || String(monitorJson.inventario).trim() === "") {
      monitorJson.inventario = "S/N";
    }

    const perifericoId = (await obtenerIdPeriferico(monitorJson.tipo)) || monitorJson.perifericoId;
    const id_marca = await obtenerOCrearMarca(monitorJson.marca, perifericoId);
    const modeloId = await obtenerOCrearModelo(monitorJson.modelo, id_marca);
    const id_serie = await obtenerOCrearSerie(monitorJson.serie);

    if (id_serie && modeloId) {
      const existeRelacion = await db.query(
        `SELECT 1 FROM modelo_serie WHERE id_modelo = :modeloId AND id_serie = :id_serie`,
        {
          replacements: { modeloId, id_serie },
          type: QueryTypes.SELECT,
        }
      );
      if (!existeRelacion.length) {
        await db.query(
          `INSERT INTO modelo_serie (id_modelo, id_serie) VALUES (:modeloId, :id_serie)`,
          {
            replacements: { modeloId, id_serie },
            type: QueryTypes.INSERT,
          }
        );
      }
    }

    const ubicacionId = await obtenerOCrearUbicacion(monitorJson.ubicacion, monitorJson.edificio);
    const usuarioId = await obtenerOCrearUsuario(monitorJson.usuario, monitorJson.uso);

    const insertRes = await db.query(
      `INSERT INTO equipo (inventario, id_serie, id_periferico) VALUES (:inventario, :serieId, :perifericoId)`,
      {
        replacements: {
          inventario: monitorJson.inventario,
          serieId: id_serie,
          perifericoId: perifericoId,
        },
      }
    );
    const monitorId = insertRes[0];

    const tipoInventario = monitorJson.tipo_inventario || "activo";
    if (tipoInventario === "activo") {
      await db.query(
        `INSERT INTO equipo_activo (id_equipo, id_ubicacion, id_usuario) VALUES (:monitorId, :ubicacionId, :usuarioId)`,
        {
          replacements: { monitorId, ubicacionId, usuarioId },
        }
      );
      await db.query(
        `INSERT INTO equipo_imagen (id_equipo, id_imagen) VALUES (:monitorId, 1)`,
        { replacements: { monitorId } }
      );
    } else if (tipoInventario === "bodega") {
      await db.query(`INSERT INTO equipo_bodega (id_equipo) VALUES (:monitorId)`, {
        replacements: { monitorId },
      });
    } else if (tipoInventario === "baja") {
      await db.query(`INSERT INTO equipo_baja (id_equipo) VALUES (:monitorId)`, {
        replacements: { monitorId },
      });
    }

    if (usuarioId) {
      const posibles = await db.query(
        `SELECT ea.id_equipo FROM equipo_activo ea
           JOIN equipo e ON ea.id_equipo = e.id_equipo
           WHERE ea.id_usuario = :usuarioId
             AND e.id_periferico IN (:ids)
           LIMIT 1`,
        {
          replacements: { usuarioId, ids: [1, 2] },
          type: QueryTypes.SELECT,
        }
      );
      if (posibles.length) {
        const idComputadora = posibles[0].id_equipo;
        await db.query(
          `INSERT INTO componente (id_componente, id_computadora) VALUES (:monitorId, :idComputadora)`,
          { replacements: { monitorId, idComputadora } }
        );
      }
    }

    registrados.push({
      inventario: monitorJson.inventario,
      equipoId: monitorId,
      datos: monitorJson,
    });

    componentesRegistrados.push(monitorJson);
    return true;
  } catch (error) {
    console.error("Error procesando monitor standalone:", error);
    noRegistrados.push({ inventario: monitorJson.inventario, motivo: error.message, datos: monitorJson });
    return false;
  }
}

async function obtenerIdPeriferico(nombrePeriferico) {
  if (!nombrePeriferico) return null;
  try {
    const periferico = await db.query(
      `SELECT id_periferico FROM periferico WHERE nombre = :nombrePeriferico`,
      {
        replacements: { nombrePeriferico: nombrePeriferico },
        type: QueryTypes.SELECT,
      }
    );
    return periferico.length ? periferico[0].id_periferico : null;
  } catch (error) {
    console.error("Error al obtener periferico:", error);
    return null;
  }
}

async function obtenerOCrearEdificio(nombreEdificio) {
  if (!nombreEdificio) return null;
  if (nombreEdificio.length > 50)
    throw new Error("El nombre del edificio excede 50 caracteres.");
  try {
    let edificio = await db.query(
      `SELECT id_edificio FROM edificio WHERE nombre = :nombreEdificio`,
      { replacements: { nombreEdificio }, type: QueryTypes.SELECT }
    );
    if (edificio.length) return edificio[0].id_edificio;
    const [result] = await db.query(
      `INSERT INTO edificio (nombre) VALUES (:nombreEdificio)`,
      { replacements: { nombreEdificio }, type: QueryTypes.INSERT }
    );
    return result;
  } catch (error) {
    throw new Error("Error al obtener/crear edificio: " + error.message);
  }
}

async function obtenerOCrearUso(nombreUso) {
  if (!nombreUso || nombreUso === "S/N") return null;
  if (nombreUso.length > 20)
    throw new Error("El nombre de uso excede 20 caracteres.");
  try {
    let uso = await db.query(
      `SELECT id_uso FROM uso WHERE nombre = :nombreUso`,
      { replacements: { nombreUso }, type: QueryTypes.SELECT }
    );
    if (uso.length) return uso[0].id_uso;
    const [result] = await db.query(
      `INSERT INTO uso (nombre) VALUES (:nombreUso)`,
      { replacements: { nombreUso }, type: QueryTypes.INSERT }
    );
    return result;
  } catch (error) {
    throw new Error("Error al obtener/crear uso: " + error.message);
  }
}

async function obtenerOCrearUbicacion(nombreUbicacion, nombreEdificio) {
  if (!nombreUbicacion || !nombreEdificio)
    return null;
  if (nombreUbicacion.length > 100)
    throw new Error("El nombre de la ubicación excede 100 caracteres.");
  try {
    const id_edificio = await obtenerOCrearEdificio(nombreEdificio);
    let ubicacion = await Ubicacion.findOne({
      where: { nombre: nombreUbicacion },
      attributes: ["id_ubicacion"],
    });
    if (ubicacion) return ubicacion.id_ubicacion;
    const nuevaUbicacion = await Ubicacion.create({
      nombre: nombreUbicacion,
      id_edificio: id_edificio,
    });
    return nuevaUbicacion.id_ubicacion;
  } catch (error) {
    throw new Error("Error al obtener/crear ubicación: " + error.message);
  }
}

async function obtenerOCrearUsuario(nombreUsuario, nombreUso) {
  if (!nombreUsuario || nombreUsuario === "S/N" || !nombreUso) return null;
  if (nombreUsuario.length > 30)
    throw new Error("El nombre del usuario excede 30 caracteres.");
  try {
    const id_uso = await obtenerOCrearUso(nombreUso);
    let usuario = await Usuario.findOne({
      where: { nombre: nombreUsuario },
      attributes: ["id_usuario"],
    });
    if (usuario) return usuario.id_usuario;
    const nuevoUsuario = await Usuario.create({
      nombre: nombreUsuario,
      id_uso: id_uso,
    });
    return nuevoUsuario.id_usuario;
  } catch (error) {
    throw new Error("Error al obtener/crear usuario: " + error.message);
  }
}

async function obtenerOCrearDominio(nombreDominio) {
  if (!nombreDominio || nombreDominio.trim().toUpperCase() === "S/N") {
    return 1;
  }
  if (nombreDominio.length > 50)
    throw new Error("El nombre del dominio excede 50 caracteres.");
  try {
    const nombre = nombreDominio.trim();
    let dominio = await Dominio.findOne({
      where: { nombre },
      attributes: ["id_dominio"],
    });
    if (dominio) return dominio.id_dominio;
    dominio = await Dominio.create({ nombre });
    return dominio.id_dominio;
  } catch (error) {
    throw new Error("Error al obtener/crear dominio: " + error.message);
  }
}

async function obtenerOCrearProcesador(nombreProcesador) {
  if (!nombreProcesador || nombreProcesador.trim().toUpperCase() === "S/N") {
    return 1;
  }
  if (nombreProcesador.length > 50)
    throw new Error("El nombre del procesador excede 50 caracteres.");
  try {
    const nombre = nombreProcesador.trim();
    let procesador = await Procesador.findOne({
      where: { nombre },
      attributes: ["id_procesador"],
    });
    if (procesador) return procesador.id_procesador;
    procesador = await Procesador.create({ nombre });
    return procesador.id_procesador;
  } catch (error) {
    throw new Error("Error al obtener/crear procesador: " + error.message);
  }
}

import { Op } from "sequelize";

function esSN(valor) {
  if (!valor) return true;
  const v = String(valor).replace(/\s/g, "").toUpperCase();
  return v === "S/N" || v === "SN" || v === "S/NS/N";
}

async function obtenerIdSistemaOperativo(nombreSO) {
  if (
    nombreSO === undefined ||
    nombreSO === null ||
    String(nombreSO).trim() === "" ||
    esSN(nombreSO)
  ) {
    return 1;
  }
  try {
    const nombre = String(nombreSO).replace(/\s/g, "").toLowerCase();
    const so = await VersionSo.findOne({
      where: db.where(
        db.fn("LOWER", db.fn("REPLACE", db.col("nombre"), " ", "")),
        nombre
      ),
      attributes: ["id_versionso"],
    });
    return so?.id_versionso || 1;
  } catch (error) {
    console.error("Error al obtener sistema operativo:", error);
    return 1;
  }
}

async function obtenerOCrearDisco(capacidad) {
  if (
    capacidad === undefined ||
    capacidad === null ||
    String(capacidad).trim() === "" ||
    esSN(capacidad)
  ) {
    return 1;
  }
  if (String(capacidad).trim().length > 10) {
    throw new Error("La capacidad del disco excede 10 caracteres.");
  }
  try {
    const cap = String(capacidad).replace(/\s/g, "").toLowerCase();
    let disco = await Disco.findOne({
      where: db.where(
        db.fn("LOWER", db.fn("REPLACE", db.col("capacidad"), " ", "")),
        cap
      ),
      attributes: ["id_disco"],
    });
    if (disco) return disco.id_disco;
    disco = await Disco.create({ capacidad: String(capacidad).trim() });
    return disco.id_disco;
  } catch (error) {
    throw new Error("Error al obtener/crear disco: " + error.message);
  }
}

async function obtenerOCrearRam(capacidad, tipo) {
  if (
    capacidad === undefined ||
    capacidad === null ||
    String(capacidad).trim() === "" ||
    esSN(capacidad)
  ) {
    return 1;
  }
  if (
    tipo === undefined ||
    tipo === null ||
    String(tipo).trim() === "" ||
    esSN(tipo)
  ) {
    return 1;
  }
  if (String(capacidad).trim().length > 6) {
    throw new Error("La capacidad de la RAM excede 6 caracteres.");
  }
  if (String(tipo).trim().length > 20) {
    throw new Error("El tipo de RAM excede 20 caracteres.");
  }
  try {
    const capacidadNorm = String(capacidad).trim().toLowerCase();
    const tipoNorm = String(tipo).trim().toLowerCase();
    const whereClause = {
      [Op.and]: [
        db.where(db.fn("LOWER", db.col("capacidad")), capacidadNorm),
        db.where(db.fn("LOWER", db.col("tipo")), tipoNorm),
      ],
    };
    let ram = await Ram.findOne({
      where: whereClause,
      attributes: ["id_ram"],
    });
    if (ram) return ram.id_ram;
    ram = await Ram.create({
      capacidad: String(capacidad).trim(),
      tipo: String(tipo).trim(),
    });
    return ram.id_ram;
  } catch (error) {
    throw new Error("Error al obtener/crear RAM: " + error.message);
  }
}

export async function obtenerComputadorasPorPeriferico(req, res) {
  const { id } = req.params;
  const { tipo = "activo" } = req.query; // espera "activo" o "bodega"
  const id_periferico = parseInt(id, 10);

  if (isNaN(id_periferico)) {
    return res.status(400).json({ error: "id_periferico inválido" });
  }
  if (tipo !== "activo" && tipo !== "bodega") {
    return res.status(400).json({ error: "tipo inválido. Debe ser 'activo' o 'bodega'" });
  }

  try {
    const joinInventario =
      tipo === "activo"
        ? "JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo"
        : "JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo";

    const computadoras = await db.query(
      `SELECT
         e.id_equipo AS id_equipo,
         s.id_serie AS id_serie,
         s.nombre AS serie
       FROM equipo e
       JOIN computadora c ON e.id_equipo = c.id_computadora
       LEFT JOIN serie s ON e.id_serie = s.id_serie
       ${joinInventario}
       WHERE e.id_periferico = :id_periferico
       ORDER BY s.nombre, e.id_equipo`,
      {
        replacements: { id_periferico },
        type: QueryTypes.SELECT,
      }
    );

    res.json({ computadoras, tipo });
  } catch (error) {
    console.error("Error al obtener computadoras por periferico:", error);
    res.status(500).json({ error: "Error al obtener computadoras por periférico" });
  }
}
