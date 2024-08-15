const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('modelo', {
    id_modelo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
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
    tableName: 'modelo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
        ]
      },
      {
        name: "id_serie",
        using: "BTREE",
        fields: [
          { name: "id_serie" },
        ]
      },
    ]
  });
};
