import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('equipo_bodega', {
    id_equipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    }
  }, {
    sequelize,
    tableName: 'equipo_bodega',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_equipo" },
        ]
      },
    ]
  });
};
