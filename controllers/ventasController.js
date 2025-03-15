const ventaModel = require('../models/ventaModel');

async function registrarVenta(req, res) {
    const { nombre, productos, servicio } = req.body;

    if (nombre == "" || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar productos para la venta o llenar todos los campos' });
    }

    const validacion = await ventaModel.validarInventario(productos);
    if (validacion.error) {
        return res.status(400).json(validacion);
    }

    try {
        const venta = await ventaModel.registrarVenta(nombre, productos, servicio);
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
        const ventas = await ventaModel.obtenerDetalleVentas2()
        const ventasAgrupadas = Object.values(
            ventas.reduce((acc, venta) => {
                if (!acc[venta.id]) {
                    acc[venta.id] = {
                        id: venta.id,
                        nombre: venta.nombre,
                        servicio: venta.servicio,
                        productos: [],
                        total: venta.total,
                        estado: venta.estado
                    };
                }
                acc[venta.id].productos.push({ producto: venta.producto, cantidad: venta.cantidad });
                return acc;
            }, {})
        );
        res.status(200).json(ventasAgrupadas)

    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las ventas' });
    }

}

async function obtenerVentasByID(req, res) {
    const id = req.body.id
    try {
        const ventas = await ventaModel.obtenerDetalleVentas(id)
        res.status(200).json(ventas)

    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las ventas' });
    }

}

async function actualizarVenta(req, res) {
    const { id, nombre, productos, servicio } = req.body;

    if (!id || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar el ID de la venta y al menos un producto' });
    }

    try {
        const ventaActualizada = await ventaModel.actualizarVenta(id, nombre, productos, servicio);
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


module.exports = { registrarVenta, actualizarEstadoVenta, obtenerVentas, obtenerVentasByID, actualizarVenta, borrarVentas };
