const connectDB = require('../config/db');

const ProductoModel = {
    async getAll() {
        const db = await connectDB();
        const productos = await db.all('SELECT * FROM tblProductos');
        await db.close();
        return productos;
    },

    async getProductById(id) {
        const db = await connectDB();
        const producto = await db.get("SELECT * FROM tblProductos WHERE id = ?", [id]);
        await db.close();
        return producto;
    },

    async updateProductById(producto) {
        const db = await connectDB();

        const result = await db.run(
            `UPDATE tblProductos 
             SET nombre = ?, precio_compra = ?, precio_venta = ?, cantidad = ?, fecha_vencimiento = ? 
             WHERE id = ?`,
            [producto.nombre, producto.precio_compra, producto.precio_venta, producto.cantidad, producto.fecha_vencimiento, producto.id]
        );

        await db.close();
        return result.lastID;
    },

    async create(producto) {
        const db = await connectDB();
        const result = await db.run(
            `INSERT INTO tblProductos (nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento) VALUES (?, ?, ?, ?, ?)`,
            [producto.nombre, producto.precio_compra, producto.precio_venta, producto.cantidad, producto.fecha_vencimiento]
        );
        await db.close();
        return result.lastID;
    },

    async deleteProductByID(id) {
        const db = await connectDB();
        const result = await db.run(
            `DELETE FROM tblProductos WHERE id = ?`, [id]
        );
        await db.close();
        return result.lastID;
    }
};

module.exports = ProductoModel;
