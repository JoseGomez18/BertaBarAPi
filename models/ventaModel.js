const connectDB = require('../config/db');

const ventaModel = {
    async registrarVenta(nombre, productos, servicio = 0) {
        const db = await connectDB();
        await db.run('BEGIN TRANSACTION');

        // Crear la venta y obtener el ID
        const result = await db.run('INSERT INTO tblVentas (nombre,totalVenta, servicio) VALUES (?,?, ?)', [nombre, 0, servicio]);
        const ventaId = result.lastID;

        let totalVenta = 0;

        for (const item of productos) {
            const producto = await db.get('SELECT * FROM tblProductos WHERE id = ?', [item.producto_id]);

            const subtotal = item.cantidad * producto.precio_venta;
            totalVenta += subtotal;

            await db.run(
                'INSERT INTO tblDetalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [ventaId, item.producto_id, item.cantidad, producto.precio_venta, subtotal]
            );

            await db.run('UPDATE tblProductos SET cantidad = cantidad - ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // Actualizar total de la venta
        await db.run('UPDATE tblVentas SET totalVenta = ? WHERE id = ?', [totalVenta + servicio, ventaId]);

        await db.run('COMMIT');
        return { ventaId, totalVenta };
    },

    async validarInventario(productos) {
        const db = await connectDB();

        for (const item of productos) {
            const result = await db.get("SELECT cantidad FROM tblProductos WHERE id = ?", [item.producto_id]);
            if (!result) return { error: `El producto con ID ${item.producto_id} no existe` };
            if (item.cantidad < 0 || item.cantidad === 0) {
                return { error: `del producto ${item.producto_id} debe escoger al menos uno ` };
            }
            else if (item.cantidad > result.cantidad) {
                return { error: `No hay esa cantidad de inventario. El producto ${item.producto_id} solo tiene ${result.cantidad} unidades disponibles` };
            }
        }

        return true;
    },

    async cambiarEstado(id, estado) {
        const db = await connectDB();
        const result = await db.run('UPDATE tblVentas SET estado = ? WHERE id = ?', [estado, id]);

        if (result.changes === 0) {
            return { error: 'Venta no encontrada' };
        }
        return true;
    },

    async obtenerVentas() {
        const db = await connectDB()

        const ventas = await db.all("SELECT v.id, v.nombre, (v.totalVenta - v.servicio) As TotalProductos, v.servicio, v.TotalVenta, v.estado FROM tblVentas v ")
        await db.close()
        return ventas
    },

    async obtenerDetalleVentas(id) {
        const db = await connectDB()
        const ventas = await db.all("SELECT v.id, v.nombre, v.servicio,p.nombre as producto, d.cantidad FROM tblVentas v INNER JOIN tblDetalles_venta d ON v.id = d.venta_id INNER JOIN tblProductos p ON p.id = d.producto_id WHERE v.id = ?", [id])
        await db.close()
        return ventas
    },
    async obtenerDetalleVentas2() {
        const db = await connectDB()
        const ventas = await db.all("SELECT v.id, v.nombre, v.servicio,p.nombre as producto, d.cantidad, v.totalVenta as total, v.estado FROM tblVentas v INNER JOIN tblDetalles_venta d ON v.id = d.venta_id INNER JOIN tblProductos p ON p.id = d.producto_id")
        await db.close()
        return ventas
    },

    async actualizarVenta(id, nombre, productos, servicio = 0) {
        const db = await connectDB();
        await db.run('BEGIN TRANSACTION');

        // Obtener los productos actuales de la venta
        const productosAnteriores = await db.all('SELECT producto_id, cantidad FROM tblDetalles_venta WHERE venta_id = ?', [id]);

        // Revertir los productos anteriores al inventario
        for (const item of productosAnteriores) {
            await db.run('UPDATE tblProductos SET cantidad = cantidad + ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // Eliminar los productos antiguos de la venta
        await db.run('DELETE FROM tblDetalles_venta WHERE venta_id = ?', [id]);

        let totalVenta = 0;

        // Agregar los nuevos productos a la venta
        for (const item of productos) {
            const producto = await db.get('SELECT * FROM tblProductos WHERE id = ?', [item.producto_id]);

            if (!producto) {
                throw new Error(`El producto con ID ${item.producto_id} no existe.`);
            }

            const subtotal = item.cantidad * producto.precio_venta;
            totalVenta += subtotal;

            // Insertar el nuevo detalle de venta
            await db.run(
                'INSERT INTO tblDetalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [id, item.producto_id, item.cantidad, producto.precio_venta, subtotal]
            );

            // Descontar del inventario
            await db.run('UPDATE tblProductos SET cantidad = cantidad - ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // Actualizar la venta con el nuevo total y servicio
        await db.run('UPDATE tblVentas SET nombre = ?, totalVenta = ?, servicio = ? WHERE id = ?', [nombre, totalVenta + servicio, servicio, id]);

        await db.run('COMMIT');
        return { id, totalVenta };
    },

    async borrarVentas() {
        const db = await connectDB();
        await db.run("DELETE FROM tblVentas")
        await db.run("DELETE FROM tblDetalles_venta")
    }
};

module.exports = ventaModel;
