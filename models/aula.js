import { DataTypes } from 'sequelize';
export default (sequelize) => {
  return sequelize.define('aula', {
    id_aula: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_edificio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'edificio',
        key: 'id_edificio'
      }
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'aula',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_aula" },
        ]
      },
      {
        name: "id_edificio",
        using: "BTREE",
        fields: [
          { name: "id_edificio" },
        ]
      },
    ]
  });
};
