const Equipo = require('../models/Equipo');

const equipoController = {
  getAllEquipos: (req, res) => {
    Equipo.getAll((err, equipos) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json(equipos);
    });
  },

  getEquipoById: (req, res) => {
    const id = req.params.id;
    Equipo.getById(id, (err, equipo) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!equipo) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      res.json(equipo);
    });
  },

  createEquipo: (req, res) => {
    const nuevoEquipo = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio
    };

    Equipo.create(nuevoEquipo, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ message: 'Equipo creado correctamente', id: result.insertId });
    });
  },

  updateEquipo: (req, res) => {
    const id = req.params.id;
    const equipoData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio
    };

    Equipo.update(id, equipoData, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: 'Equipo actualizado correctamente' });
    });
  },

  deleteEquipo: (req, res) => {
    const id = req.params.id;

    Equipo.delete(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: 'Equipo eliminado correctamente' });
    });
  }
};

module.exports = equipoController;
