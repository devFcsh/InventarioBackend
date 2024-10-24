import db from "../models/index.js";
import { DataTypes } from "sequelize";

const Computadora = db.define('computadora', {
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
    id_dominio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dominio',
        key: 'id_dominio'
      }
    }
  }, {
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
        name: "id_dominio",
        using: "BTREE",
        fields: [
          { name: "id_dominio" },
        ]
      },
    ]
  });

export default Computadora;