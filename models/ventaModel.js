const connectDB = require('../config/db');
const { resumenVentas } = require('../controllers/ventasController');

const ventaModel = {
    async registrarVenta(nombre, productos, servicioGeneral = 0) {
        const db = await connectDB();
        await db.run('BEGIN TRANSACTION');

        let totalVenta = 0;
        let totalServicio = 0;

        // Calcular el total de servicios por producto
        for (const item of productos) {
            // Asegurarse de que el servicio sea un número
            const servicio = parseFloat(item.servicio || 0);
            totalServicio += servicio;
        }

        // Si no se especificó un servicioGeneral, usar la suma de los servicios por producto
        if (servicioGeneral === 0) {
            servicioGeneral = totalServicio;
        }

        // Crear la venta y obtener el ID
        const result = await db.run('INSERT INTO tblVentas (nombre, totalVenta, servicio) VALUES (?, ?, ?)',
            [nombre, 0, servicioGeneral]);
        const ventaId = result.lastID;

        // Procesar cada producto
        for (const item of productos) {
            const producto = await db.get('SELECT * FROM tblProductos WHERE id = ?', [item.producto_id]);

            const subtotal = item.cantidad * producto.precio_venta;
            // Asegurarse de que el servicio sea un número
            const servicio = parseFloat(item.servicio || 0);

            // El total de la venta incluye el subtotal de productos
            totalVenta += subtotal;

            await db.run(
                'INSERT INTO tblDetalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal, servicio) VALUES (?, ?, ?, ?, ?, ?)',
                [ventaId, item.producto_id, item.cantidad, producto.precio_venta, subtotal, servicio]
            );

            await db.run('UPDATE tblProductos SET cantidad = cantidad - ? WHERE id = ?',
                [item.cantidad, item.producto_id]);
        }

        // Actualizar total de la venta (suma de productos + servicioGeneral)
        await db.run('UPDATE tblVentas SET totalVenta = ? WHERE id = ?',
            [totalVenta + servicioGeneral, ventaId]);

        await db.run('COMMIT');
        return { ventaId, totalVenta, totalServicio, servicioGeneral };
    },

    async validarInventario(productos) {
        const db = await connectDB();

        for (const item of productos) {
            const result = await db.get("SELECT cantidad FROM tblProductos WHERE id = ?", [item.producto_id]);
            if (!result) return { error: `El producto con ID ${item.producto_id} no existe` };
            if (item.cantidad <= 0) {
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

    async obtenerDetalleVentas(id) {
        const db = await connectDB()
        const ventas = await db.all(`
            SELECT 
                v.id, v.nombre, v.servicio as servicio_general, v.fecha,
                (v.totalVenta - v.servicio) As subtotal_sin_servicio_general,
                p.id as productId, p.nombre as producto, 
                d.cantidad, d.precio_unitario, d.servicio as servicio_producto,
                v.totalVenta as total, v.estado 
            FROM tblVentas v 
            INNER JOIN tblDetalles_venta d ON v.id = d.venta_id 
            INNER JOIN tblProductos p ON p.id = d.producto_id 
            WHERE v.id = ?`, [id])
        await db.close()
        return ventas
    },
    async obtenerDetalleVentas2() {
        const db = await connectDB()
        const ventas = await db.all(`
            SELECT 
                v.id, v.nombre, v.servicio as servicio_general, v.fecha,
                (v.totalVenta - v.servicio) As subtotal_sin_servicio_general,
                p.nombre as producto, d.cantidad, d.precio_unitario, 
                d.servicio as servicio_producto,
                v.totalVenta as total, v.estado 
            FROM tblVentas v 
            INNER JOIN tblDetalles_venta d ON v.id = d.venta_id 
            INNER JOIN tblProductos p ON p.id = d.producto_id`)
        await db.close()
        return ventas
    },

    async actualizarVenta(id, nombre, productos, servicioGeneral = 0) {
        const db = await connectDB();
        await db.run('BEGIN TRANSACTION');

        // Obtener los productos actuales de la venta
        const productosAnteriores = await db.all('SELECT producto_id, cantidad FROM tblDetalles_venta WHERE venta_id = ?', [id]);

        // Revertir los productos anteriores al inventario
        for (const item of productosAnteriores) {
            await db.run('UPDATE tblProductos SET cantidad = cantidad + ? WHERE id = ?',
                [item.cantidad, item.producto_id]);
        }

        // Eliminar los productos antiguos de la venta
        await db.run('DELETE FROM tblDetalles_venta WHERE venta_id = ?', [id]);

        let totalVenta = 0;
        let totalServicio = 0;

        // Calcular el total de servicios por producto
        for (const item of productos) {
            // Asegurarse de que el servicio sea un número
            const servicio = parseFloat(item.servicio || 0);
            totalServicio += servicio;
        }

        // Si no se especificó un servicioGeneral, usar la suma de los servicios por producto
        if (servicioGeneral === 0) {
            servicioGeneral = totalServicio;
        }

        // Agregar los nuevos productos a la venta
        for (const item of productos) {
            const producto = await db.get('SELECT * FROM tblProductos WHERE id = ?', [item.producto_id]);

            if (!producto) {
                throw new Error(`El producto con ID ${item.producto_id} no existe.`);
            }

            const subtotal = item.cantidad * producto.precio_venta;
            // Asegurarse de que el servicio sea un número
            const servicio = parseFloat(item.servicio || 0);

            // El total de la venta incluye el subtotal de productos
            totalVenta += subtotal;

            // Insertar el nuevo detalle de venta con servicio individual
            await db.run(
                'INSERT INTO tblDetalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal, servicio) VALUES (?, ?, ?, ?, ?, ?)',
                [id, item.producto_id, item.cantidad, producto.precio_venta, subtotal, servicio]
            );

            // Descontar del inventario
            await db.run('UPDATE tblProductos SET cantidad = cantidad - ? WHERE id = ?',
                [item.cantidad, item.producto_id]);
        }

        // Actualizar la venta con el nuevo total y servicio general
        await db.run('UPDATE tblVentas SET nombre = ?, totalVenta = ?, servicio = ? WHERE id = ?',
            [nombre, totalVenta + servicioGeneral, servicioGeneral, id]);

        await db.run('COMMIT');
        return { id, totalVenta, totalServicio, servicioGeneral };
    },

    async borrarVentas() {
        const db = await connectDB();
        await db.run("DELETE FROM tblVentas")
        await db.run("DELETE FROM tblDetalles_venta")
    },
    async borrarTablaDetallesVenta() {
        const db = await connectDB();
        await db.run("DROP TABLE tblDetalles_venta")
    },
    async resumenVentas() {
        const db = await connectDB();
        const ventas = await db.all("SELECT SUM(totalVenta) FROM tblVentas")
        await db.close()
        return ventas
    }
};

module.exports = ventaModel;
