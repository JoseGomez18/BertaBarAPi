const express = require('express');
const { registrarVenta, actualizarEstadoVenta } = require('../controllers/ventasController');

const router = express.Router();

router.post('/ventas', registrarVenta);
router.put('/ventas/:id/estado', actualizarEstadoVenta);

module.exports = router;