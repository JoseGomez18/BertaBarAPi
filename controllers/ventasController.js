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
        const ventas = await ventaModel.obtenerVentas()
        res.status(200).json(ventas)

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

module.exports = { registrarVenta, actualizarEstadoVenta, obtenerVentas, obtenerVentasByID };
