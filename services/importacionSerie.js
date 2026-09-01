export function normalizarSerieImportacion(valor) {
  const serie = valor === undefined || valor === null
    ? ""
    : String(valor).trim().replace(/\s+/g, " ");
  const clave = serie.replace(/\s/g, "").toUpperCase();

  if (!serie || clave === "S/N" || clave === "SN" || clave === "S/NS/N") {
    return "S/N";
  }

  return serie;
}
