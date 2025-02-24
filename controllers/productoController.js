const ProductoModel = require('../models/productoModel');

const getProductos = async (req, res) => {
    try {
        const productos = await ProductoModel.getAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductByID = async (req, res) => {
    try {
        const producto = await ProductoModel.getProductById(req.body.id);
        if (!producto) {
            res.status(404).json({ error: "No existe un producto con este id" })
            return;
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: "no se pudo encontrar el producto" + error.message });
    }
};

const deleteProductByID = async (req, res) => {
    try {
        const id = req.body.id
        const validacion = await ProductoModel.getProductById(id);
        if (!validacion) {
            res.status(404).json({ error: "No existe un producto con este id" })
            return;
        }
        const resul = await ProductoModel.deleteProductByID(id);
        res.status(201).json({ message: "Producto eliminado con id: " + id });
    } catch (error) {
        res.status(500).json({ error: "no se pudo encontrar el producto" + error.message });
    }
};

const updateProductByID = async (req, res) => {
    try {
        const { nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento, id } = req.body;

        const validacion = await ProductoModel.getProductById(id);
        if (!validacion) {
            res.status(404).json({ error: "No existe un producto con este id" })
            return;
        }

        if (!nombre || !precio_compra || !precio_venta || !cantidad || !fecha_vencimiento) {
            return res.status(400).json({ error: "Todos los campos obligatorios deben estar llenos." });
        }

        const resul = await ProductoModel.updateProductById({ nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento, id });
        res.status(201).json({ message: "Producto actualizaco con id: " + id });
    } catch (error) {
        res.status(500).json({ error: "no se pudo encontrar el producto" + error.message });
    }
};

const createProducto = async (req, res) => {
    try {
        const { nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento } = req.body;
        if (!nombre || !precio_compra || !precio_venta || !cantidad) {
            return res.status(400).json({ error: "Todos los campos obligatorios deben estar llenos." });
        }

        const id = await ProductoModel.create({ nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento });
        res.status(201).json({ message: "Producto creado", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getProductos, createProducto, getProductByID, deleteProductByID, updateProductByID }