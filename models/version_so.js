import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('version_so', {
    id_versionso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    id_sistemaoperativo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sistema_operativo',
        key: 'id_sistemaoperativo'
      }
    }
  }, {
    sequelize,
    tableName: 'version_so',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_versionso" },
        ]
      },
      {
        name: "id_sistemaoperativo",
        using: "BTREE",
        fields: [
          { name: "id_sistemaoperativo" },
        ]
      },
    ]
  });
};
