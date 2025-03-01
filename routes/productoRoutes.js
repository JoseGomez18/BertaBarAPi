const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/productos', productoController.getProductos);
router.get('/productoByID/:id', productoController.getProductByID);
router.post('/productos', productoController.createProducto);
router.delete('/deleteProduct', productoController.deleteProductByID);
router.put('/updateProduct', productoController.updateProductByID);
//categorias despues pasar otro
router.get('/categorias', productoController.getAllCategories);
router.get('/categoriaById/:id', productoController.getCategoryById);
router.post('/crearCategoria', productoController.createCategory);

module.exports = router;