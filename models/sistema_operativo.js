import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('sistema_operativo', {
    id_sistemaoperativo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sistema_operativo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_sistemaoperativo" },
        ]
      },
    ]
  });
};
