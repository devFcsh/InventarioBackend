const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('equipo', {
    id_equipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_periferico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'periferico',
        key: 'id_periferico'
      }
    },
    id_clasificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clasificacion',
        key: 'id_clasificacion'
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
        name: "id_clasificacion",
        using: "BTREE",
        fields: [
          { name: "id_clasificacion" },
        ]
      },
      {
        name: "id_periferico",
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
        ]
      },
    ]
  });
};
