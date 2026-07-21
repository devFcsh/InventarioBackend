/**
 * Normaliza rutas que llegan desde Windows o desde la API para que sean
 * compatibles con la URL pública /uploads/....
 */
export function normalizarRutaImagen(valor) {
  if (valor === undefined || valor === null) return null;

  const ruta = String(valor).trim();
  if (!ruta) return null;

  return ruta.replaceAll("\\", "/");
}

/**
 * Busca una imagen importada únicamente por la ruta recibida. Nunca usa una
 * imagen arbitraria de la tabla como valor predeterminado.
 */
export function seleccionarImagenImportada(imagenRuta, imagenes) {
  const rutaNormalizada = normalizarRutaImagen(imagenRuta);
  if (!rutaNormalizada || !Array.isArray(imagenes)) return null;

  const imagen = imagenes.find(
    (item) => normalizarRutaImagen(item.ruta) === rutaNormalizada
  );

  return imagen?.id_imagen ?? null;
}

export function normalizarImagenEnRespuesta(equipo) {
  if (!equipo) return equipo;

  return {
    ...equipo,
    imagenRuta: normalizarRutaImagen(equipo.imagenRuta),
  };
}
