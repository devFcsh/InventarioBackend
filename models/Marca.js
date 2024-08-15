const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('marca', {
    id_marca: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modelo',
        key: 'id_modelo'
      }
    }
  }, {
    sequelize,
    tableName: 'marca',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_marca" },
        ]
      },
      {
        name: "id_modelo",
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
        ]
      },
    ]
  });
};
