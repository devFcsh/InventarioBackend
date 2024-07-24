const db = require('../config/dbConfig');

const Equipo = {
  getAll: (callback) => {
    db.query('SELECT * FROM equipo', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM equipo WHERE id = ?', [id], callback);
  },

  create: (equipoData, callback) => {
    db.query('INSERT INTO equipo SET ?', equipoData, callback);
  },

  update: (id, equipoData, callback) => {
    db.query('UPDATE equipo SET ? WHERE id = ?', [equipoData, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM equipo WHERE id = ?', [id], callback);
  }
};

module.exports = Equipo;
