import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('modelo_serie', {
    id_modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'modelo',
        key: 'id_modelo'
      }
    },
    id_serie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'serie',
        key: 'id_serie'
      }
    }
  }, {
    sequelize,
    tableName: 'modelo_serie',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modelo" },
          { name: "id_serie" },
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
