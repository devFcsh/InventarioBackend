const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('computadora', {
    id_computadora: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'equipo',
        key: 'id_equipo'
      }
    },
    nombre_equipo: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    dominio: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    direccion_ip: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    id_versionso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'version_so',
        key: 'id_versionso'
      }
    },
    id_versionoffice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'version_office',
        key: 'id_versionoffice'
      }
    },
    id_ram: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ram',
        key: 'id_ram'
      }
    },
    id_disco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'disco',
        key: 'id_disco'
      }
    },
    id_antivirus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'antivirus',
        key: 'id_antivirus'
      }
    },
    id_periferico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'periferico',
        key: 'id_periferico'
      }
    }
  }, {
    sequelize,
    tableName: 'computadora',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_computadora" },
        ]
      },
      {
        name: "id_versionso",
        using: "BTREE",
        fields: [
          { name: "id_versionso" },
        ]
      },
      {
        name: "id_versionoffice",
        using: "BTREE",
        fields: [
          { name: "id_versionoffice" },
        ]
      },
      {
        name: "id_ram",
        using: "BTREE",
        fields: [
          { name: "id_ram" },
        ]
      },
      {
        name: "id_disco",
        using: "BTREE",
        fields: [
          { name: "id_disco" },
        ]
      },
      {
        name: "id_antivirus",
        using: "BTREE",
        fields: [
          { name: "id_antivirus" },
        ]
      },
      {
        name: "id_periferico",
        using: "BTREE",
        fields: [
          { name: "id_periferico" },
        ]
      },
    ]
  });
};
