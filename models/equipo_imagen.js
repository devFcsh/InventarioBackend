const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('equipo_imagen', {
    id_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    },
    id_imagen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'imagen',
        key: 'id_imagen'
      }
    }
  }, {
    sequelize,
    tableName: 'equipo_imagen',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo" },
          { name: "id_imagen" },
        ]
      },
      {
        name: "id_imagen",
        using: "BTREE",
        fields: [
          { name: "id_imagen" },
        ]
      },
    ]
  });
};
