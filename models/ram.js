const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ram', {
    id_ram: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    capacidad: {
      type: DataTypes.STRING(6),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ram',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_ram" },
        ]
      },
    ]
  });
};
