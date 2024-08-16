const express = require('express');
const router = express.Router();

router.get('/marcas/:perifericoId', async (req, res) => {
  const { perifericoId } = req.params;
  const marcas = await getMarcasByPeriferico(perifericoId);

  res.json(marcas);
});

module.exports = router;
