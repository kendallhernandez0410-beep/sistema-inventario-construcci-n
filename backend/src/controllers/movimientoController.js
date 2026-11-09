const movimientoModel = require('../models/movimientoModel');

function crear(req, res, next) {
  try {
    const body = req.body || {};
    const materialId = body.material_id;
    const tipo = body.tipo;
    const cantidad = Number(body.cantidad);
    const referencia = body.referencia;
    const responsable = body.responsable;
    const observaciones = body.observaciones;

    if (!Number.isInteger(Number(materialId)) || Number(materialId) < 1) {
      return res.status(400).json({
        success: false,
        message: 'material_id debe ser un entero positivo.'
      });
    }
    if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de movimiento debe ser ENTRADA o SALIDA.'
      });
    }
    if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a cero.'
      });
    }
    if (typeof referencia !== 'string' || !referencia.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (material_id, tipo, cantidad, referencia, responsable).'
      });
    }
    if (typeof responsable !== 'string' || !responsable.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (material_id, tipo, cantidad, referencia, responsable).'
      });
    }

    const fecha = body.fecha_movimiento === undefined
      ? new Date().toISOString()
      : body.fecha_movimiento;
    if (typeof fecha !== 'string' || !Number.isFinite(Date.parse(fecha))) {
      return res.status(400).json({
        success: false,
        message: 'fecha_movimiento debe ser una fecha válida.'
      });
    }

    const resultado = movimientoModel.crearConActualizacionDeStock({
      materialId: Number(materialId),
      tipo,
      cantidad,
      fechaMovimiento: new Date(fecha).toISOString(),
      referencia: referencia.trim(),
      responsable: responsable.trim(),
      observaciones: typeof observaciones === 'string' ? observaciones.trim() : null
    });

    return res.status(201).json({
      success: true,
      message: 'Movimiento registrado con éxito y stock actualizado',
      data: {
        movimiento_id: resultado.movimiento_id,
        material_id: Number(materialId),
        tipo,
        cantidad,
        stock_anterior: resultado.stock_anterior,
        stock_resultante: resultado.material.stock_actual,
        punto_reorden: resultado.calculo.punto_reorden
      },
      movimiento: resultado
    });
  } catch (error) {
    if (error.status) {
      const message = error.status === 404
        ? 'Material no encontrado'
        : `Stock insuficiente. ${error.message}`;
      return res.status(error.status).json({ success: false, message });
    }
    return next(error);
  }
}

module.exports = { crear };
