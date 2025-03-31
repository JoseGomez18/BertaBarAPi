const express = require('express');
const { registrarVenta, actualizarEstadoVenta, obtenerVentas, obtenerVentasByID, actualizarVenta, borrarVentas, resumenVentas, borrarTablaDetallesVenta } = require('../controllers/ventasController');

const router = express.Router();

router.post('/ventas', registrarVenta);
router.get('/ventas', obtenerVentas);
router.get('/ventasDetalleId/:id', obtenerVentasByID);
router.put('/ventasEstado/:id', actualizarEstadoVenta);
router.put('/actualizarVenta', actualizarVenta);

router.get('/borrarTablaDetallesVenta', borrarTablaDetallesVenta);
router.get('/borrarventas', borrarVentas);
router.get('/resumenVentas', resumenVentas);


module.exports = router;