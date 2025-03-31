const ventaModel = require('../models/ventaModel');

async function registrarVenta(req, res) {
    const { nombre, productos, servicioGeneral = 0 } = req.body;

    if (nombre == "" || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar productos para la venta o llenar todos los campos' });
    }

    // Validar que cada producto tenga la estructura correcta
    for (const producto of productos) {
        if (!producto.producto_id || producto.cantidad === undefined) {
            return res.status(400).json({ error: 'Cada producto debe tener producto_id y cantidad' });
        }
        // El servicio por producto es opcional
    }

    const validacion = await ventaModel.validarInventario(productos);
    if (validacion.error) {
        return res.status(400).json(validacion);
    }

    try {
        const venta = await ventaModel.registrarVenta(nombre, productos, servicioGeneral);
        res.json({ message: 'Venta registrada con éxito', venta });
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
        const resul = await ventaModel.cambiarEstado(id, estado)
        if (resul.error) {
            res.status(404).json({ "error": resul.error })
        } else {
            res.json({ message: 'Estado actualizado con éxito' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando el estado' });
    }
}

async function obtenerVentas(req, res) {
    try {
        const ventas = await ventaModel.obtenerDetalleVentas2();

        const ventasAgrupadas = Object.values(
            ventas.reduce((acc, venta) => {
                if (!acc[venta.id]) {
                    // Inicializar la venta con sus datos básicos
                    acc[venta.id] = {
                        id: venta.id,
                        nombre: venta.nombre,
                        servicio_general: parseFloat(venta.servicio_general || 0),
                        subtotal_sin_servicio_general: parseFloat(venta.subtotal_sin_servicio_general || 0),
                        productos: [],
                        total: parseFloat(venta.total || 0),
                        estado: venta.estado,
                        fecha: venta.fecha
                    };
                }

                // Agregar el producto con su servicio
                acc[venta.id].productos.push({
                    producto: venta.producto,
                    cantidad: venta.cantidad,
                    precio: parseFloat(venta.precio_unitario || 0),
                    servicio_producto: parseFloat(venta.servicio_producto || 0)
                });

                return acc;
            }, {})
        );

        // Calcular totales adicionales para cada venta
        ventasAgrupadas.forEach(venta => {
            // Calcular el total de servicios por producto
            venta.total_servicios_productos = venta.productos.reduce(
                (sum, producto) => sum + producto.servicio_producto, 0
            );

            // Calcular el subtotal de productos (sin servicios)
            venta.subtotal_productos = venta.productos.reduce(
                (sum, producto) => sum + (producto.precio * producto.cantidad), 0
            );
        });

        res.status(200).json(ventasAgrupadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo las ventas' });
    }
}

async function obtenerVentasByID(req, res) {
    const { id } = req.params;

    try {
        const ventas = await ventaModel.obtenerDetalleVentas(id);

        const ventasAgrupadas = Object.values(
            ventas.reduce((acc, venta) => {
                if (!acc[venta.id]) {
                    // Inicializar la venta con sus datos básicos
                    acc[venta.id] = {
                        id: venta.id,
                        nombre: venta.nombre,
                        servicio_general: parseFloat(venta.servicio_general || 0),
                        subtotal_sin_servicio_general: parseFloat(venta.subtotal_sin_servicio_general || 0),
                        productos: [],
                        total: parseFloat(venta.total || 0),
                        estado: venta.estado,
                        fecha: venta.fecha
                    };
                }

                // Agregar el producto con su servicio
                acc[venta.id].productos.push({
                    productId: venta.productId,
                    producto: venta.producto,
                    cantidad: venta.cantidad,
                    precio: parseFloat(venta.precio_unitario || 0),
                    servicio_producto: parseFloat(venta.servicio_producto || 0)
                });

                return acc;
            }, {})
        );

        // Calcular totales adicionales para cada venta
        ventasAgrupadas.forEach(venta => {
            // Calcular el total de servicios por producto
            venta.total_servicios_productos = venta.productos.reduce(
                (sum, producto) => sum + producto.servicio_producto, 0
            );

            // Calcular el subtotal de productos (sin servicios)
            venta.subtotal_productos = venta.productos.reduce(
                (sum, producto) => sum + (producto.precio * producto.cantidad), 0
            );
        });

        res.status(200).json(ventasAgrupadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo las ventas: ' + error });
    }
}


async function actualizarVenta(req, res) {
    const { id, nombre, productos, servicioGeneral = 0 } = req.body;

    if (!id || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar el ID de la venta y al menos un producto' });
    }

    // Validar que cada producto tenga la estructura correcta
    for (const producto of productos) {
        if (!producto.producto_id || producto.cantidad === undefined) {
            return res.status(400).json({ error: 'Cada producto debe tener producto_id y cantidad' });
        }
        // El servicio por producto es opcional
    }

    const validacion = await ventaModel.validarInventario(productos);
    if (validacion.error) {
        return res.status(400).json(validacion);
    }

    try {
        const ventaActualizada = await ventaModel.actualizarVenta(id, nombre, productos, servicioGeneral);
        res.json({ message: 'Venta actualizada con éxito', venta: ventaActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error actualizando la venta' });
    }
}

async function borrarVentas(req, res) {
    try {
        const resul = await ventaModel.borrarVentas()
        res.send("tablas borradas")
    } catch (error) {
        res.send(error)
    }
}

async function borrarTablaDetallesVenta(req, res) {
    try {
        const resul = await ventaModel.borrarTablaDetallesVenta()
        res.send("tabla detalle venta borrada" + resul)
    } catch (error) {
        res.send(error)
    }
}

async function resumenVentas(req, res) {
    try {
        const resul = await ventaModel.resumenVentas()
        res.json({ message: 'resumen', venta: resul });
    } catch (error) {
        res.send(error)
    }
}


module.exports = { registrarVenta, actualizarEstadoVenta, obtenerVentas, obtenerVentasByID, actualizarVenta, borrarVentas, resumenVentas, borrarTablaDetallesVenta };
