const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/productos', productoController.getProductos);
router.get('/productoByID', productoController.getProductByID);
router.post('/productos', productoController.createProducto);
router.delete('/deleteProduct', productoController.deleteProductByID);
router.put('/updateProduct', productoController.updateProductByID);

module.exports = router;