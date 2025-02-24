const connectDB = require('../config/db');

async function registrarVenta(req, res) {
    const { productos, servicio } = req.body;

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar productos para la venta' });
    }

    try {
        const db = await connectDB();
        await db.run('BEGIN TRANSACTION'); // Inicia la transacción

        // Crea la venta en tblVentas
        const result = await db.run('INSERT INTO tblVentas (totalVenta, servicio) VALUES (?, ?)', [0, servicio || 0]);
        const ventaId = result.lastID;

        let totalVenta = 0;

        // Procesa cada producto vendido
        for (const item of productos) {
            const producto = await db.get('SELECT * FROM tblProductos WHERE id = ?', [item.producto_id]);

            if (!producto || producto.cantidad < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto ID ${item.producto_id}`);
            }

            const subtotal = item.cantidad * producto.precio_venta;
            totalVenta += subtotal;

            // Guarda el detalle de la venta
            await db.run(
                'INSERT INTO tblDetalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [ventaId, item.producto_id, item.cantidad, producto.precio_venta, subtotal]
            );

            // Descuenta del inventario
            await db.run('UPDATE tblProductos SET cantidad = cantidad - ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // Actualiza el total de la venta
        await db.run('UPDATE tblVentas SET totalVenta = ? WHERE id = ?', [totalVenta + servicio, ventaId]);

        await db.run('COMMIT'); // Confirma la transacción
        res.json({ message: 'Venta registrada con éxito', ventaId, totalVenta });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registrando la venta' });
    }
}

async function actualizarEstadoVenta(req, res) {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'completado', 'por deber'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const db = await connectDB();
        const result = await db.run('UPDATE tblVentas SET estado = ? WHERE id = ?', [estado, id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.json({ message: 'Estado actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando el estado' });
    }
}

module.exports = { registrarVenta, actualizarEstadoVenta };
