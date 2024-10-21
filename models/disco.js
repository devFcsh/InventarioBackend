import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('disco', {
    id_disco: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    capacidad: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'disco',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_disco" },
        ]
      },
    ]
  });
};
