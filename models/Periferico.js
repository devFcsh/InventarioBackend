const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('periferico', {
    id_periferico: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_marca: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'marca',
        key: 'id_marca'
      }
    }
  }, {
    sequelize,
    tableName: 'periferico',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
        ]
      },
      {
        name: "id_marca",
        using: "BTREE",
        fields: [
          { name: "id_marca" },
        ]
      },
    ]
  });
};
