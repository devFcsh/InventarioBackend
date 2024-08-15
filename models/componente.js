const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('componente', {
    id_componente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    },
    id_computadora: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'computadora',
        key: 'id_computadora'
      }
    }
  }, {
    sequelize,
    tableName: 'componente',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_componente" },
        ]
      },
      {
        name: "id_computadora",
        using: "BTREE",
        fields: [
          { name: "id_computadora" },
        ]
      },
    ]
  });
};
