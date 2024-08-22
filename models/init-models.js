var DataTypes = require("sequelize").DataTypes;
var _antivirus = require("./antivirus");
var _clasificacion = require("./clasificacion");
var _componente = require("./componente");
var _computadora = require("./computadora");
var _disco = require("./disco");
var _equipo = require("./equipo");
var _equipo_activo = require("./equipo_activo");
var _equipo_baja = require("./equipo_baja");
var _equipo_bodega = require("./equipo_bodega");
var _marca = require("./marca");
var _marca_modelo = require("./marca_modelo");
var _marca_periferico = require("./marca_periferico");
var _modelo = require("./modelo");
var _modelo_serie = require("./modelo_serie");
var _periferico = require("./periferico");
var _ram = require("./ram");
var _serie = require("./serie");
var _sistema_operativo = require("./sistema_operativo");
var _usuario = require("./usuario");
var _version_office = require("./version_office");
var _version_so = require("./version_so");

function initModels(sequelize) {
  var antivirus = _antivirus(sequelize, DataTypes);
  var clasificacion = _clasificacion(sequelize, DataTypes);
  var componente = _componente(sequelize, DataTypes);
  var computadora = _computadora(sequelize, DataTypes);
  var disco = _disco(sequelize, DataTypes);
  var equipo = _equipo(sequelize, DataTypes);
  var equipo_activo = _equipo_activo(sequelize, DataTypes);
  var equipo_baja = _equipo_baja(sequelize, DataTypes);
  var equipo_bodega = _equipo_bodega(sequelize, DataTypes);
  var marca = _marca(sequelize, DataTypes);
  var marca_modelo = _marca_modelo(sequelize, DataTypes);
  var marca_periferico = _marca_periferico(sequelize, DataTypes);
  var modelo = _modelo(sequelize, DataTypes);
  var modelo_serie = _modelo_serie(sequelize, DataTypes);
  var periferico = _periferico(sequelize, DataTypes);
  var ram = _ram(sequelize, DataTypes);
  var serie = _serie(sequelize, DataTypes);
  var sistema_operativo = _sistema_operativo(sequelize, DataTypes);
  var usuario = _usuario(sequelize, DataTypes);
  var version_office = _version_office(sequelize, DataTypes);
  var version_so = _version_so(sequelize, DataTypes);

  marca.belongsToMany(modelo, { as: 'id_modelo_modelos', through: marca_modelo, foreignKey: "id_marca", otherKey: "id_modelo" });
  marca.belongsToMany(periferico, { as: 'id_periferico_perifericos', through: marca_periferico, foreignKey: "id_marca", otherKey: "id_periferico" });
  modelo.belongsToMany(marca, { as: 'id_marca_marcas', through: marca_modelo, foreignKey: "id_modelo", otherKey: "id_marca" });
  modelo.belongsToMany(serie, { as: 'id_serie_series', through: modelo_serie, foreignKey: "id_modelo", otherKey: "id_serie" });
  periferico.belongsToMany(marca, { as: 'id_marca_marca_marca_perifericos', through: marca_periferico, foreignKey: "id_periferico", otherKey: "id_marca" });
  serie.belongsToMany(modelo, { as: 'id_modelo_modelo_modelo_series', through: modelo_serie, foreignKey: "id_serie", otherKey: "id_modelo" });
  computadora.belongsTo(antivirus, { as: "id_antivirus_antivirus", foreignKey: "id_antivirus"});
  antivirus.hasMany(computadora, { as: "computadoras", foreignKey: "id_antivirus"});
  equipo.belongsTo(clasificacion, { as: "id_clasificacion_clasificacion", foreignKey: "id_clasificacion"});
  clasificacion.hasMany(equipo, { as: "equipos", foreignKey: "id_clasificacion"});
  equipo_activo.belongsTo(clasificacion, { as: "id_activo_clasificacion", foreignKey: "id_activo"});
  clasificacion.hasOne(equipo_activo, { as: "equipo_activo", foreignKey: "id_activo"});
  equipo_baja.belongsTo(clasificacion, { as: "id_eqbaja_clasificacion", foreignKey: "id_eqbaja"});
  clasificacion.hasOne(equipo_baja, { as: "equipo_baja", foreignKey: "id_eqbaja"});
  equipo_bodega.belongsTo(clasificacion, { as: "id_eqbodega_clasificacion", foreignKey: "id_eqbodega"});
  clasificacion.hasOne(equipo_bodega, { as: "equipo_bodega", foreignKey: "id_eqbodega"});
  componente.belongsTo(computadora, { as: "id_computadora_computadora", foreignKey: "id_computadora"});
  computadora.hasMany(componente, { as: "componentes", foreignKey: "id_computadora"});
  computadora.belongsTo(disco, { as: "id_disco_disco", foreignKey: "id_disco"});
  disco.hasMany(computadora, { as: "computadoras", foreignKey: "id_disco"});
  componente.belongsTo(equipo, { as: "id_componente_equipo", foreignKey: "id_componente"});
  equipo.hasOne(componente, { as: "componente", foreignKey: "id_componente"});
  computadora.belongsTo(equipo, { as: "id_computadora_equipo", foreignKey: "id_computadora"});
  equipo.hasOne(computadora, { as: "computadora", foreignKey: "id_computadora"});
  marca_modelo.belongsTo(marca, { as: "id_marca_marca", foreignKey: "id_marca"});
  marca.hasMany(marca_modelo, { as: "marca_modelos", foreignKey: "id_marca"});
  marca_periferico.belongsTo(marca, { as: "id_marca_marca", foreignKey: "id_marca"});
  marca.hasMany(marca_periferico, { as: "marca_perifericos", foreignKey: "id_marca"});
  marca_modelo.belongsTo(modelo, { as: "id_modelo_modelo", foreignKey: "id_modelo"});
  modelo.hasMany(marca_modelo, { as: "marca_modelos", foreignKey: "id_modelo"});
  modelo_serie.belongsTo(modelo, { as: "id_modelo_modelo", foreignKey: "id_modelo"});
  modelo.hasMany(modelo_serie, { as: "modelo_series", foreignKey: "id_modelo"});
  serie.belongsTo(modelo, { as: "id_modelo_modelo", foreignKey: "id_modelo"});
  modelo.hasMany(serie, { as: "series", foreignKey: "id_modelo"});
  computadora.belongsTo(periferico, { as: "id_periferico_periferico", foreignKey: "id_periferico"});
  periferico.hasMany(computadora, { as: "computadoras", foreignKey: "id_periferico"});
  marca_periferico.belongsTo(periferico, { as: "id_periferico_periferico", foreignKey: "id_periferico"});
  periferico.hasMany(marca_periferico, { as: "marca_perifericos", foreignKey: "id_periferico"});
  computadora.belongsTo(ram, { as: "id_ram_ram", foreignKey: "id_ram"});
  ram.hasMany(computadora, { as: "computadoras", foreignKey: "id_ram"});
  modelo_serie.belongsTo(serie, { as: "id_serie_serie", foreignKey: "id_serie"});
  serie.hasMany(modelo_serie, { as: "modelo_series", foreignKey: "id_serie"});
  version_so.belongsTo(sistema_operativo, { as: "id_sistemaoperativo_sistema_operativo", foreignKey: "id_sistemaoperativo"});
  sistema_operativo.hasMany(version_so, { as: "version_sos", foreignKey: "id_sistemaoperativo"});
  equipo_activo.belongsTo(usuario, { as: "id_usuario_usuario", foreignKey: "id_usuario"});
  usuario.hasMany(equipo_activo, { as: "equipo_activos", foreignKey: "id_usuario"});
  computadora.belongsTo(version_office, { as: "id_versionoffice_version_office", foreignKey: "id_versionoffice"});
  version_office.hasMany(computadora, { as: "computadoras", foreignKey: "id_versionoffice"});
  computadora.belongsTo(version_so, { as: "id_versionso_version_so", foreignKey: "id_versionso"});
  version_so.hasMany(computadora, { as: "computadoras", foreignKey: "id_versionso"});

  return {
    antivirus,
    clasificacion,
    componente,
    computadora,
    disco,
    equipo,
    equipo_activo,
    equipo_baja,
    equipo_bodega,
    marca,
    marca_modelo,
    marca_periferico,
    modelo,
    modelo_serie,
    periferico,
    ram,
    serie,
    sistema_operativo,
    usuario,
    version_office,
    version_so,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
