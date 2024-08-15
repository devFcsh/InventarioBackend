const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('equipo_baja', {
    id_eqbaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'clasificacion',
        key: 'id_clasificacion'
      }
    }
  }, {
    sequelize,
    tableName: 'equipo_baja',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_eqbaja" },
        ]
      },
    ]
  });
};
