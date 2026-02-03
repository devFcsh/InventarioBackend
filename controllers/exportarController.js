import { QueryTypes } from "sequelize";
import db from "../models/index.js";

export async function exportarEquiposActivos(req, res) {
    try {
      const [computadoras, accesspoint, switches, proyectores, simples] =
        await Promise.all([
          exportarComputadorasActivos(),
          exportarEquiposRedAPActivos(),
          exportarEquiposRedSwitchActivos(),
          exportarProyectoresActivos(),
          exportarEquiposSimplesActivos(),
        ]);
  
      const resultado = {
        Computadoras: computadoras,
        AccessPoint: accesspoint,
        Switch: switches,
        Proyector: proyectores,
        EquiposSimples: simples,
      };
  
      res.json(resultado);
    } catch (error) {
      console.error("Error al exportar todos los equipos:", error);
      res.status(500).json({ error: "Error al exportar todos los equipos" });
    }
  }

  export async function exportarEquiposBodega(req, res) {
    try {
      const [computadoras, accesspoint, switches, proyectores, simples] =
        await Promise.all([
          exportarComputadorasBodega(),
          exportarEquiposRedAPBodega(),
          exportarEquiposRedSwitchBodega(),
          exportarProyectoresBodega(),
          exportarEquiposSimplesBodega(),
        ]);
  
      const resultado = {
        Computadoras: computadoras,
        AccessPoint: accesspoint,
        Switch: switches,
        Proyector: proyectores,
        EquiposSimples: simples,
      };
  
      res.json(resultado);
    } catch (error) {
      console.error("Error al exportar todos los equipos:", error);
      res.status(500).json({ error: "Error al exportar todos los equipos" });
    }
  }
  
  export async function exportarComputadorasActivos(req, res) {
    try {
      const query = `
        SELECT 
    e.id_equipo AS id,
    CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
    ed.nombre AS edificio,
    ub.nombre AS ubicacion,
    uo.nombre AS uso,
    us.nombre AS usuario,
  
    -- Mouse
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN ma.nombre END) AS mouse_marca,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN mo.nombre END) AS mouse_modelo,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN se.nombre END) AS mouse_serie,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN eqc.inventario END) AS mouse_inventario,
  
    -- Teclado
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN ma.nombre END) AS teclado_marca,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN mo.nombre END) AS teclado_modelo,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN se.nombre END) AS teclado_serie,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN eqc.inventario END) AS teclado_inventario,
  
    -- Monitor
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN ma.nombre END) AS monitor_marca,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN mo.nombre END) AS monitor_modelo,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN se.nombre END) AS monitor_serie,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN eqc.inventario END) AS monitor_inventario,
  
    c.direccion_ip,
    c.nombre_equipo,
    d.nombre AS dominio,
    so.nombre AS sistema_operativo,
    vso.nombre AS version_sistema_operativo,
    p.nombre AS procesador,
    r.tipo AS tipo_ram,
    r.capacidad AS capacidad_ram,
    di.capacidad AS capacidad_disco,
    mar.nombre AS marca,
    m.nombre AS modelo,
    se.nombre AS serie,
    e.inventario,
    ea.fecha_ultima_modificacion AS fecha_ultimo_cambio,
    e.observacion
  FROM computadora c
  JOIN equipo e ON c.id_computadora = e.id_equipo
  JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
  JOIN ubicacion ub ON ea.id_ubicacion = ub.id_ubicacion
  JOIN edificio ed ON ub.id_edificio = ed.id_edificio
  JOIN usuario us ON ea.id_usuario = us.id_usuario
  JOIN uso uo ON us.id_uso = uo.id_uso
  JOIN dominio d ON c.id_dominio = d.id_dominio
  JOIN version_so vso ON c.id_versionso = vso.id_versionso
  JOIN sistema_operativo so ON vso.id_sistemaoperativo = so.id_sistemaoperativo
  JOIN procesador p ON c.id_procesador = p.id_procesador
  JOIN ram r ON c.id_ram = r.id_ram
  JOIN disco di ON c.id_disco = di.id_disco
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo m ON ms.id_modelo = m.id_modelo
  JOIN marca_modelo mm ON m.id_modelo = mm.id_modelo
  JOIN marca mar ON mm.id_marca = mar.id_marca
  LEFT JOIN componente comp ON c.id_computadora = comp.id_computadora
  LEFT JOIN equipo eqc ON comp.id_componente = eqc.id_equipo
  LEFT JOIN serie se_com ON eqc.id_serie = se_com.id_serie
  LEFT JOIN modelo_serie ms_com ON se_com.id_serie = ms_com.id_serie
  LEFT JOIN modelo mo ON ms_com.id_modelo = mo.id_modelo
  LEFT JOIN marca_modelo mm_com ON mo.id_modelo = mm_com.id_modelo
  LEFT JOIN marca ma ON mm_com.id_marca = ma.id_marca
  LEFT JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
  LEFT JOIN periferico pe ON mp.id_periferico = pe.id_periferico
  GROUP BY e.id_equipo, ed.nombre, ub.nombre, uo.nombre, us.nombre, c.direccion_ip, c.nombre_equipo, d.nombre, so.nombre, vso.nombre, p.nombre, r.tipo, r.capacidad, di.capacidad, mar.nombre, m.nombre, se.nombre, e.inventario, ea.fecha_ultima_modificacion, e.observacion
  ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener todos los equipos con componentes:", error);
      return [];
    }
  }
  
  export async function exportarComputadorasBodega(req, res) {
    try {
      const query = `
        SELECT 
    e.id_equipo AS id,
    CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
    -- Mouse
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN ma.nombre END) AS mouse_marca,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN mo.nombre END) AS mouse_modelo,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN se.nombre END) AS mouse_serie,
    MAX(CASE WHEN pe.nombre = 'Mouse' THEN eqc.inventario END) AS mouse_inventario,
  
    -- Teclado
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN ma.nombre END) AS teclado_marca,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN mo.nombre END) AS teclado_modelo,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN se.nombre END) AS teclado_serie,
    MAX(CASE WHEN pe.nombre = 'Teclado' THEN eqc.inventario END) AS teclado_inventario,
  
    -- Monitor
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN ma.nombre END) AS monitor_marca,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN mo.nombre END) AS monitor_modelo,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN se.nombre END) AS monitor_serie,
    MAX(CASE WHEN pe.nombre = 'Monitor' THEN eqc.inventario END) AS monitor_inventario,
  
    c.direccion_ip,
    c.nombre_equipo,
    d.nombre AS dominio,
    so.nombre AS sistema_operativo,
    vso.nombre AS version_sistema_operativo,
    p.nombre AS procesador,
    r.tipo AS tipo_ram,
    r.capacidad AS capacidad_ram,
    di.capacidad AS capacidad_disco,
    mar.nombre AS marca,
    m.nombre AS modelo,
    se.nombre AS serie,
    e.inventario,
    eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
    e.observacion
  FROM computadora c
  JOIN equipo e ON c.id_computadora = e.id_equipo
  JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
  JOIN dominio d ON c.id_dominio = d.id_dominio
  JOIN version_so vso ON c.id_versionso = vso.id_versionso
  JOIN sistema_operativo so ON vso.id_sistemaoperativo = so.id_sistemaoperativo
  JOIN procesador p ON c.id_procesador = p.id_procesador
  JOIN ram r ON c.id_ram = r.id_ram
  JOIN disco di ON c.id_disco = di.id_disco
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo m ON ms.id_modelo = m.id_modelo
  JOIN marca_modelo mm ON m.id_modelo = mm.id_modelo
  JOIN marca mar ON mm.id_marca = mar.id_marca
  LEFT JOIN componente comp ON c.id_computadora = comp.id_computadora
  LEFT JOIN equipo eqc ON comp.id_componente = eqc.id_equipo
  LEFT JOIN serie se_com ON eqc.id_serie = se_com.id_serie
  LEFT JOIN modelo_serie ms_com ON se_com.id_serie = ms_com.id_serie
  LEFT JOIN modelo mo ON ms_com.id_modelo = mo.id_modelo
  LEFT JOIN marca_modelo mm_com ON mo.id_modelo = mm_com.id_modelo
  LEFT JOIN marca ma ON mm_com.id_marca = ma.id_marca
  LEFT JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
  LEFT JOIN periferico pe ON mp.id_periferico = pe.id_periferico
  GROUP BY e.id_equipo, c.direccion_ip, c.nombre_equipo, d.nombre, so.nombre, vso.nombre, p.nombre, r.tipo, r.capacidad, di.capacidad, mar.nombre, m.nombre, se.nombre, e.inventario, eb.fecha_ultima_modificacion, e.observacion
  ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener todos los equipos con componentes:", error);
      return [];
    }
  }
  
  export async function exportarEquiposRedAPActivos(req, res) {
    try {
      const query = `
        SELECT 
          e.id_equipo AS id,
          er.nombre_equipo,
          CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
          e.inventario,
          ed.nombre AS edificio,
          ub.nombre AS ubicacion,
          ma.nombre AS marca,
          mo.nombre AS modelo,
          se.nombre AS serie,
          er.mac,
          ea.fecha_ultima_modificacion AS fecha_ultimo_cambio,
          e.observacion
        FROM equipo_red er
        JOIN equipo e ON er.id_equipo_red = e.id_equipo
        JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
        JOIN ubicacion ub ON ea.id_ubicacion = ub.id_ubicacion
        JOIN edificio ed ON ub.id_edificio = ed.id_edificio
        JOIN serie se ON e.id_serie = se.id_serie
        JOIN modelo_serie ms ON se.id_serie = ms.id_serie
        JOIN modelo mo ON ms.id_modelo = mo.id_modelo
        JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
        JOIN marca ma ON mm.id_marca = ma.id_marca
        JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
        JOIN periferico pe ON mp.id_periferico = pe.id_periferico
        WHERE pe.nombre = 'AccessPoint'
        ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los equipos de red AccessPoint:", error);
      return [];
    }
  }

  export async function exportarEquiposRedAPBodega(req, res) {
    try {
      const query = `
        SELECT 
          e.id_equipo AS id,
          er.nombre_equipo,
          CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
          e.inventario,
          ma.nombre AS marca,
          mo.nombre AS modelo,
          se.nombre AS serie,
          er.mac,
          eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
          e.observacion
        FROM equipo_red er
        JOIN equipo e ON er.id_equipo_red = e.id_equipo
        JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
        JOIN serie se ON e.id_serie = se.id_serie
        JOIN modelo_serie ms ON se.id_serie = ms.id_serie
        JOIN modelo mo ON ms.id_modelo = mo.id_modelo
        JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
        JOIN marca ma ON mm.id_marca = ma.id_marca
        JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
        JOIN periferico pe ON mp.id_periferico = pe.id_periferico
        WHERE pe.nombre = 'AccessPoint'
        ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los equipos de red AccessPoint:", error);
      return [];
    }
  }
  
  export async function exportarEquiposRedSwitchActivos(req, res) {
    try {
      const query = `
        SELECT 
          e.id_equipo AS id,
          er.nombre_equipo,
          CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
          e.inventario,
          ed.nombre AS edificio,
          ub.nombre AS ubicacion,
          ma.nombre AS marca,
          mo.nombre AS modelo,
          se.nombre AS serie,
          er.mac,
          er.puertos,
          er.puerto_ftp,
          ea.fecha_ultima_modificacion AS fecha_ultimo_cambio,
          e.observacion
        FROM equipo_red er
        JOIN equipo e ON er.id_equipo_red = e.id_equipo
        JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
        JOIN ubicacion ub ON ea.id_ubicacion = ub.id_ubicacion
        JOIN edificio ed ON ub.id_edificio = ed.id_edificio
        JOIN serie se ON e.id_serie = se.id_serie
        JOIN modelo_serie ms ON se.id_serie = ms.id_serie
        JOIN modelo mo ON ms.id_modelo = mo.id_modelo
        JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
        JOIN marca ma ON mm.id_marca = ma.id_marca
        JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
        JOIN periferico pe ON mp.id_periferico = pe.id_periferico
        WHERE pe.nombre = 'Switch'
        ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los equipos de red Switch:", error);
      return [];
    }
  }

  export async function exportarEquiposRedSwitchBodega(req, res) {
    try {
      const query = `
        SELECT 
          e.id_equipo AS id,
          er.nombre_equipo,
          CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
          e.inventario,
          ma.nombre AS marca,
          mo.nombre AS modelo,
          se.nombre AS serie,
          er.mac,
          er.puertos,
          er.puerto_ftp,
          eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
          e.observacion
        FROM equipo_red er
        JOIN equipo e ON er.id_equipo_red = e.id_equipo
        JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
        JOIN serie se ON e.id_serie = se.id_serie
        JOIN modelo_serie ms ON se.id_serie = ms.id_serie
        JOIN modelo mo ON ms.id_modelo = mo.id_modelo
        JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
        JOIN marca ma ON mm.id_marca = ma.id_marca
        JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
        JOIN periferico pe ON mp.id_periferico = pe.id_periferico
        WHERE pe.nombre = 'Switch'
        ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los equipos de red Switch:", error);
      return [];
    }
  }
  
  export async function exportarProyectoresActivos(req, res) {
    try {
      const query = `
      SELECT
      e.id_equipo AS id,
      CASE
          WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
          WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
          ELSE 'DESCONOCIDO'
      END AS empresa,
      e.inventario,
      ed.nombre AS edificio,
      ub.nombre AS ubicacion,
      ma.nombre AS marca,
      mo.nombre AS modelo,
      se.nombre AS serie,
      l.nombre as lampara,
      ea.fecha_ultima_modificacion AS fecha_ultimo_cambio,
      e.observacion
  FROM equipo e
  JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
  JOIN ubicacion ub ON ea.id_ubicacion = ub.id_ubicacion
  JOIN edificio ed ON ub.id_edificio = ed.id_edificio
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo mo ON ms.id_modelo = mo.id_modelo
  JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
  JOIN marca ma ON mm.id_marca = ma.id_marca
  JOIN modelo_lampara ml ON mo.id_modelo = ml.id_modelo
  JOIN lampara l ON ml.id_lampara = l.id_lampara 
  JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
  JOIN periferico p ON mp.id_periferico = p.id_periferico
  WHERE p.nombre = 'Proyector'
  ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los proyectores:", error);
      return [];
    }
  }

  export async function exportarProyectoresBodega(req, res) {
    try {
      const query = `
        SELECT 
      e.id_equipo AS id,
      CASE 
          WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
          WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
          ELSE 'DESCONOCIDO'
      END AS empresa,
      e.inventario,
      ma.nombre AS marca,
      mo.nombre AS modelo,
      se.nombre AS serie,
      l.nombre as lampara,
      eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
      e.observacion
  FROM equipo e
  JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo mo ON ms.id_modelo = mo.id_modelo
  JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
  JOIN marca ma ON mm.id_marca = ma.id_marca
  JOIN modelo_lampara ml ON mo.id_modelo = ml.id_modelo
  JOIN lampara l ON ml.id_lampara = l.id_lampara 
  JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
  JOIN periferico p ON mp.id_periferico = p.id_periferico
  WHERE p.nombre = 'Proyector'
  ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener los proyectores:", error);
      return [];
    }
  }
  
  export async function exportarEquiposSimplesActivos(req, res) {
    try {
      const query = `
        SELECT 
      e.id_equipo AS id,
      CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
      ed.nombre AS edificio,
      ub.nombre AS ubicacion,
      u.nombre AS uso,
      us.nombre AS usuario,
      pe.nombre AS periferico,
      ma.nombre AS marca,
      mo.nombre AS modelo,
      se.nombre AS serie,
      e.inventario,
      ea.fecha_ultima_modificacion AS fecha_ultimo_cambio,
      e.observacion
  FROM equipo e
  JOIN equipo_activo ea ON e.id_equipo = ea.id_equipo
  JOIN ubicacion ub ON ea.id_ubicacion = ub.id_ubicacion
  JOIN edificio ed ON ub.id_edificio = ed.id_edificio
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo mo ON ms.id_modelo = mo.id_modelo
  JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
  JOIN marca ma ON mm.id_marca = ma.id_marca
  JOIN periferico pe ON e.id_periferico = pe.id_periferico
  LEFT JOIN usuario us ON ea.id_usuario = us.id_usuario
  LEFT JOIN uso u ON us.id_uso = u.id_uso
  WHERE pe.nombre != 'Proyector' 
    AND e.id_equipo NOT IN (
      SELECT id_equipo_red FROM equipo_red
      UNION
      SELECT id_componente FROM componente
      UNION
      SELECT id_computadora FROM computadora
    )
  ORDER BY e.id_equipo;
  
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener otros equipos:", error);
      return [];
    }
  }

  export async function exportarEquiposSimplesBodega(req, res) {
    try {
      const query = `
        SELECT 
      e.id_equipo AS id,
      CASE 
            WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
            WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
            ELSE 'DESCONOCIDO'
          END AS empresa,
      pe.nombre AS periferico,
      ma.nombre AS marca,
      mo.nombre AS modelo,
      se.nombre AS serie,
      e.inventario,
      eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
      e.observacion
  FROM equipo e
  JOIN equipo_bodega eb ON e.id_equipo = eb.id_equipo
  JOIN serie se ON e.id_serie = se.id_serie
  JOIN modelo_serie ms ON se.id_serie = ms.id_serie
  JOIN modelo mo ON ms.id_modelo = mo.id_modelo
  JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
  JOIN marca ma ON mm.id_marca = ma.id_marca
  JOIN periferico pe ON e.id_periferico = pe.id_periferico
  WHERE pe.nombre != 'Proyector' 
    AND e.id_equipo NOT IN (
      SELECT id_equipo_red FROM equipo_red
      UNION
      SELECT id_componente FROM componente
      UNION
      SELECT id_computadora FROM computadora
    )
  ORDER BY e.id_equipo;
      `;
  
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener otros equipos:", error);
      return [];
    }
  }

  export async function exportarEquiposBaja(req, res) {
      try {
          const query = `
              SELECT 
                  e.id_equipo AS id,
                  CASE 
                      WHEN LENGTH(e.inventario) = 6 THEN 'ESPOL'
                      WHEN LENGTH(e.inventario) > 6 THEN 'ESPOLTECH'
                      ELSE 'DESCONOCIDO'
                  END AS empresa,
                  pe.nombre AS periferico,
                  ma.nombre AS marca,
                  mo.nombre AS modelo,
                  se.nombre AS serie,
                  e.inventario,
                  eb.fecha_ultima_modificacion AS fecha_ultimo_cambio,
                  e.observacion AS estado
              FROM equipo e
              JOIN equipo_baja eb ON e.id_equipo = eb.id_equipo
              JOIN serie se ON e.id_serie = se.id_serie
              JOIN modelo_serie ms ON se.id_serie = ms.id_serie
              JOIN modelo mo ON ms.id_modelo = mo.id_modelo
              JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
              JOIN marca ma ON mm.id_marca = ma.id_marca
              JOIN marca_periferico mp ON ma.id_marca = mp.id_marca
              JOIN periferico pe ON mp.id_periferico = pe.id_periferico
              ORDER BY e.id_equipo;
          `;
  
          const equiposBaja = await db.query(query, { type: QueryTypes.SELECT });
  
          if (equiposBaja.length === 0) {
              return res.status(404).json({ message: "No se encontraron equipos para exportar" });
          }
  
          return res.json(equiposBaja);
      } catch (error) {
          console.error("Error al obtener equipos:", error);
          return res.status(500).json({ message: "Error al obtener los equipos para exportar", error: error.message });
      }
  }
  