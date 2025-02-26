const connectDB = require('../config/db');

const ProductoModel = {
    async getAll() {
        const db = await connectDB();
        const productos = await db.all('SELECT p.id, p.nombre, p.precio_compra, p.precio_venta, p.cantidad, p.fecha_vencimiento, c.nombre as categoria FROM tblProductos p INNER JOIN tblCategorias c ON p.categoria_id = c.id');
        await db.close();
        return productos;
    },

    async getProductById(id) {
        const db = await connectDB();
        const producto = await db.get("SELECT p.id, p.nombre, p.precio_compra, p.precio_venta, p.cantidad, p.fecha_vencimiento, c.nombre as categoria FROM tblProductos p INNER JOIN tblCategorias c ON p.categoria_id = c.id WHERE p.id = ?", [id]);
        await db.close();
        return producto;
    },

    async getCategoryById(id) {
        const db = await connectDB();
        const producto = await db.get("SELECT * FROM tblCategorias WHERE id = ?", [id]);
        await db.close();
        return producto;
    },

    async updateProductById(producto) {
        const db = await connectDB();

        const result = await db.run(
            `UPDATE tblProductos 
             SET nombre = ?, precio_compra = ?, precio_venta = ?, cantidad = ?, fecha_vencimiento = ?, categoria_id = ? 
             WHERE id = ?`,
            [producto.nombre, producto.precio_compra, producto.precio_venta, producto.cantidad, producto.fecha_vencimiento, producto.categoria_id, producto.id]
        );

        await db.close();
        return result.lastID;
    },

    async create(producto) {
        const db = await connectDB();
        const result = await db.run(
            `INSERT INTO tblProductos (nombre, precio_compra, precio_venta, cantidad, fecha_vencimiento, categoria_id) VALUES (?, ?, ?, ?, ?,?)`,
            [producto.nombre, producto.precio_compra, producto.precio_venta, producto.cantidad, producto.fecha_vencimiento, producto.categoria_id]
        );
        await db.close();
        return result.lastID;
    },

    async createCategory(categoria) {
        const db = await connectDB();
        const result = await db.run(
            `INSERT INTO tblCategorias (nombre) VALUES (?)`,
            [categoria.nombre]
        );
        await db.close();
        return result.lastID;
    },
    async getAllCategories() {
        const db = await connectDB();
        const productos = await db.all('SELECT * FROM tblCategorias');
        await db.close();
        return productos;
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
