const express = require('express');
const { obtenerMarcasPorPeriferico } = require('../controllers/marcaController');
const router = express.Router();

router.get('/marcasPorPeriferico/:perifericoId', async (req, res) => {
  const { perifericoId } = req.params;
  console.log(req.params);
  const marcas = await obtenerMarcasPorPeriferico(perifericoId);

  res.json(marcas);
});

module.exports = router;
