import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('antivirus', {
    id_antivirus: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    estado: {
      type: DataTypes.ENUM('Activado','Desactivado'),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'antivirus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_antivirus" },
        ]
      },
    ]
  });
};
