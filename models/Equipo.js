const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('equipo', {
    id_equipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_clasificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clasificacion',
        key: 'id_clasificacion'
      }
    },
    inventario: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'serie',
        key: 'id_serie'
      }
    }
  }, {
    sequelize,
    tableName: 'equipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo" },
        ]
      },
      {
        name: "id_serie",
        using: "BTREE",
        fields: [
          { name: "id_serie" },
        ]
      },
      {
        name: "id_clasificacion",
        using: "BTREE",
        fields: [
          { name: "id_clasificacion" },
        ]
      },
    ]
  });
};
