import { DataTypes } from "sequelize";
import _antivirus from "./antivirus";
import _aula from "./aula";
import _componente from "./componente";
import _computadora from "./computadora";
import _disco from "./disco";
import _dominio from "./dominio";
import _edificio from "./edificio";
import _equipo from "./equipo.js";
import _equipo_activo from "./equipo_activo";
import _equipo_baja from "./equipo_baja";
import _equipo_bodega from "./equipo_bodega";
import _equipo_imagen from "./equipo_imagen";
import _imagen from "./imagen";
import _marca from "./marca";
import _marca_modelo from "./marca_modelo";
import _marca_periferico from "./marca_periferico";
import _modelo from "./modelo";
import _modelo_serie from "./modelo_serie";
import _periferico from "./periferico";
import _ram from "./ram";
import _serie from "./serie";
import _sistema_operativo from "./sistema_operativo";
import _uso from "./uso";
import _usuario from "./usuario";
import _version_office from "./version_office";
import _version_so from "./version_so";

function initModels(sequelize) {
  var antivirus = _antivirus(sequelize, DataTypes);
  var aula = _aula(sequelize, DataTypes);
  var componente = _componente(sequelize, DataTypes);
  var computadora = _computadora(sequelize, DataTypes);
  var disco = _disco(sequelize, DataTypes);
  var dominio = _dominio(sequelize, DataTypes);
  var edificio = _edificio(sequelize, DataTypes);
  var equipo = _equipo(sequelize, DataTypes);
  var equipo_activo = _equipo_activo(sequelize, DataTypes);
  var equipo_baja = _equipo_baja(sequelize, DataTypes);
  var equipo_bodega = _equipo_bodega(sequelize, DataTypes);
  var equipo_imagen = _equipo_imagen(sequelize, DataTypes);
  var imagen = _imagen(sequelize, DataTypes);
  var marca = _marca(sequelize, DataTypes);
  var marca_modelo = _marca_modelo(sequelize, DataTypes);
  var marca_periferico = _marca_periferico(sequelize, DataTypes);
  var modelo = _modelo(sequelize, DataTypes);
  var modelo_serie = _modelo_serie(sequelize, DataTypes);
  var periferico = _periferico(sequelize, DataTypes);
  var ram = _ram(sequelize, DataTypes);
  var serie = _serie(sequelize, DataTypes);
  var sistema_operativo = _sistema_operativo(sequelize, DataTypes);
  var uso = _uso(sequelize, DataTypes);
  var usuario = _usuario(sequelize, DataTypes);
  var version_office = _version_office(sequelize, DataTypes);
  var version_so = _version_so(sequelize, DataTypes);

  equipo.belongsToMany(imagen, { as: 'id_imagen_imagens', through: equipo_imagen, foreignKey: "id_equipo", otherKey: "id_imagen" });
  imagen.belongsToMany(equipo, { as: 'id_equipo_equipos', through: equipo_imagen, foreignKey: "id_imagen", otherKey: "id_equipo" });
  marca.belongsToMany(modelo, { as: 'id_modelo_modelos', through: marca_modelo, foreignKey: "id_marca", otherKey: "id_modelo" });
  marca.belongsToMany(periferico, { as: 'id_periferico_perifericos', through: marca_periferico, foreignKey: "id_marca", otherKey: "id_periferico" });
  modelo.belongsToMany(marca, { as: 'id_marca_marcas', through: marca_modelo, foreignKey: "id_modelo", otherKey: "id_marca" });
  modelo.belongsToMany(serie, { as: 'id_serie_series', through: modelo_serie, foreignKey: "id_modelo", otherKey: "id_serie" });
  periferico.belongsToMany(marca, { as: 'id_marca_marca_marca_perifericos', through: marca_periferico, foreignKey: "id_periferico", otherKey: "id_marca" });
  serie.belongsToMany(modelo, { as: 'id_modelo_modelo_modelo_series', through: modelo_serie, foreignKey: "id_serie", otherKey: "id_modelo" });
  computadora.belongsTo(antivirus, { as: "id_antivirus_antivirus", foreignKey: "id_antivirus"});
  antivirus.hasMany(computadora, { as: "computadoras", foreignKey: "id_antivirus"});
  equipo_activo.belongsTo(aula, { as: "id_aula_aula", foreignKey: "id_aula"});
  aula.hasMany(equipo_activo, { as: "equipo_activos", foreignKey: "id_aula"});
  componente.belongsTo(computadora, { as: "id_computadora_computadora", foreignKey: "id_computadora"});
  computadora.hasMany(componente, { as: "componentes", foreignKey: "id_computadora"});
  computadora.belongsTo(disco, { as: "id_disco_disco", foreignKey: "id_disco"});
  disco.hasMany(computadora, { as: "computadoras", foreignKey: "id_disco"});
  computadora.belongsTo(dominio, { as: "id_dominio_dominio", foreignKey: "id_dominio"});
  dominio.hasMany(computadora, { as: "computadoras", foreignKey: "id_dominio"});
  aula.belongsTo(edificio, { as: "id_edificio_edificio", foreignKey: "id_edificio"});
  edificio.hasMany(aula, { as: "aulas", foreignKey: "id_edificio"});
  componente.belongsTo(equipo, { as: "id_componente_equipo", foreignKey: "id_componente"});
  equipo.hasOne(componente, { as: "componente", foreignKey: "id_componente"});
  computadora.belongsTo(equipo, { as: "id_computadora_equipo", foreignKey: "id_computadora"});
  equipo.hasOne(computadora, { as: "computadora", foreignKey: "id_computadora"});
  equipo_activo.belongsTo(equipo, { as: "id_equipo_equipo", foreignKey: "id_equipo"});
  equipo.hasOne(equipo_activo, { as: "equipo_activo", foreignKey: "id_equipo"});
  equipo_baja.belongsTo(equipo, { as: "id_equipo_equipo", foreignKey: "id_equipo"});
  equipo.hasOne(equipo_baja, { as: "equipo_baja", foreignKey: "id_equipo"});
  equipo_bodega.belongsTo(equipo, { as: "id_equipo_equipo", foreignKey: "id_equipo"});
  equipo.hasOne(equipo_bodega, { as: "equipo_bodega", foreignKey: "id_equipo"});
  equipo_imagen.belongsTo(equipo, { as: "id_equipo_equipo", foreignKey: "id_equipo"});
  equipo.hasMany(equipo_imagen, { as: "equipo_imagens", foreignKey: "id_equipo"});
  equipo_imagen.belongsTo(imagen, { as: "id_imagen_imagen", foreignKey: "id_imagen"});
  imagen.hasMany(equipo_imagen, { as: "equipo_imagens", foreignKey: "id_imagen"});
  marca_modelo.belongsTo(marca, { as: "id_marca_marca", foreignKey: "id_marca"});
  marca.hasMany(marca_modelo, { as: "marca_modelos", foreignKey: "id_marca"});
  marca_periferico.belongsTo(marca, { as: "id_marca_marca", foreignKey: "id_marca"});
  marca.hasMany(marca_periferico, { as: "marca_perifericos", foreignKey: "id_marca"});
  marca_modelo.belongsTo(modelo, { as: "id_modelo_modelo", foreignKey: "id_modelo"});
  modelo.hasMany(marca_modelo, { as: "marca_modelos", foreignKey: "id_modelo"});
  modelo_serie.belongsTo(modelo, { as: "id_modelo_modelo", foreignKey: "id_modelo"});
  modelo.hasMany(modelo_serie, { as: "modelo_series", foreignKey: "id_modelo"});
  marca_periferico.belongsTo(periferico, { as: "id_periferico_periferico", foreignKey: "id_periferico"});
  periferico.hasMany(marca_periferico, { as: "marca_perifericos", foreignKey: "id_periferico"});
  computadora.belongsTo(ram, { as: "id_ram_ram", foreignKey: "id_ram"});
  ram.hasMany(computadora, { as: "computadoras", foreignKey: "id_ram"});
  equipo.belongsTo(serie, { as: "id_serie_serie", foreignKey: "id_serie"});
  serie.hasMany(equipo, { as: "equipos", foreignKey: "id_serie"});
  modelo_serie.belongsTo(serie, { as: "id_serie_serie", foreignKey: "id_serie"});
  serie.hasMany(modelo_serie, { as: "modelo_series", foreignKey: "id_serie"});
  version_so.belongsTo(sistema_operativo, { as: "id_sistemaoperativo_sistema_operativo", foreignKey: "id_sistemaoperativo"});
  sistema_operativo.hasMany(version_so, { as: "version_sos", foreignKey: "id_sistemaoperativo"});
  usuario.belongsTo(uso, { as: "id_uso_uso", foreignKey: "id_uso"});
  uso.hasMany(usuario, { as: "usuarios", foreignKey: "id_uso"});
  equipo_activo.belongsTo(usuario, { as: "id_usuario_usuario", foreignKey: "id_usuario"});
  usuario.hasMany(equipo_activo, { as: "equipo_activos", foreignKey: "id_usuario"});
  computadora.belongsTo(version_office, { as: "id_versionoffice_version_office", foreignKey: "id_versionoffice"});
  version_office.hasMany(computadora, { as: "computadoras", foreignKey: "id_versionoffice"});
  computadora.belongsTo(version_so, { as: "id_versionso_version_so", foreignKey: "id_versionso"});
  version_so.hasMany(computadora, { as: "computadoras", foreignKey: "id_versionso"});

  return {
    antivirus,
    aula,
    componente,
    computadora,
    disco,
    dominio,
    edificio,
    equipo,
    equipo_activo,
    equipo_baja,
    equipo_bodega,
    equipo_imagen,
    imagen,
    marca,
    marca_modelo,
    marca_periferico,
    modelo,
    modelo_serie,
    periferico,
    ram,
    serie,
    sistema_operativo,
    uso,
    usuario,
    version_office,
    version_so,
  };
}
export default initModels;
const _initModels = initModels;
export { _initModels as initModels };
const _default = initModels;
export { _default as default };
