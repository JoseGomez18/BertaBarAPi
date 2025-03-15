const express = require('express');
const { registrarVenta, actualizarEstadoVenta, obtenerVentas, obtenerVentasByID, actualizarVenta, borrarVentas } = require('../controllers/ventasController');

const router = express.Router();

router.post('/ventas', registrarVenta);
router.get('/ventas', obtenerVentas);
router.get('/ventasDetalleId', obtenerVentasByID);
router.put('/ventasEstado/:id', actualizarEstadoVenta);
router.put('/actualizarVenta', actualizarVenta);

router.get('/borrarventas', borrarVentas);


module.exports = router;