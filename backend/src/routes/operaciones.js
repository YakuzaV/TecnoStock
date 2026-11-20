const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// ==========================================
// COMPRAS - CONSULTAR HISTORIAL
// ==========================================
router.get('/compras', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT c.*, p.sku, p.nombre AS producto
      FROM compras c
      JOIN productos p ON p.id = c.producto_id
      ORDER BY c.created_at DESC, c.id DESC
    `)

    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error consultando compras' })
  }
})

// ==========================================
// COMPRAS - REGISTRAR
// Actualiza stock y costo promedio
// ==========================================
router.post('/compras', async (req, res) => {
  const producto_id = Number(req.body.producto_id)
  const cantidad = Number(req.body.cantidad)
  const costo_unitario = Number(req.body.costo_unitario)
  const proveedor = req.body.proveedor?.trim() || null
  const observacion = req.body.observacion?.trim() || null

  if (
    !Number.isInteger(producto_id) ||
    producto_id <= 0 ||
    !Number.isInteger(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(costo_unitario) ||
    costo_unitario <= 0
  ) {
    return res.status(400).json({
      mensaje: 'Producto, cantidad y costo unitario válidos son obligatorios.'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const pr = await client.query(
      `SELECT id, nombre, stock, costo_unitario
       FROM productos
       WHERE id = $1 AND activo = TRUE
       FOR UPDATE`,
      [producto_id]
    )

    if (!pr.rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        mensaje: 'Producto no encontrado o inactivo.'
      })
    }

    const p = pr.rows[0]

    const stockAnterior = Number(p.stock)
    const stockNuevo = stockAnterior + cantidad
    const costoAnterior = Number(p.costo_unitario)

    // Cálculo de costo promedio ponderado
    const costoPromedio =
      stockNuevo > 0
        ? ((stockAnterior * costoAnterior) +
           (cantidad * costo_unitario)) / stockNuevo
        : costo_unitario

    const total = cantidad * costo_unitario

    // Actualizar stock y costo promedio
    await client.query(
      `UPDATE productos
       SET stock = $1,
           costo_unitario = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [stockNuevo, costoPromedio, producto_id]
    )

    // Registrar compra
    const compra = await client.query(
      `INSERT INTO compras
       (producto_id, proveedor, cantidad, costo_unitario, total, observacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        producto_id,
        proveedor,
        cantidad,
        costo_unitario,
        total,
        observacion
      ]
    )

    // Registrar movimiento de inventario
    await client.query(
      `INSERT INTO movimientos_inventario
       (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion)
       VALUES ($1, 'entrada', $2, $3, $4, $5)`,
      [
        producto_id,
        cantidad,
        stockAnterior,
        stockNuevo,
        `Compra${proveedor ? ' - ' + proveedor : ''}${observacion ? ' - ' + observacion : ''}`
      ]
    )

    await client.query('COMMIT')

    res.status(201).json({
      mensaje: 'Compra registrada y stock actualizado',
      compra: compra.rows[0],
      stock_actual: stockNuevo,
      costo_promedio_actualizado: Number(costoPromedio.toFixed(2))
    })

  } catch (e) {
    await client.query('ROLLBACK')
    console.error(e)

    res.status(500).json({
      mensaje: 'Error registrando compra'
    })
  } finally {
    client.release()
  }
})

// ==========================================
// VENTAS - CONSULTAR HISTORIAL
// ==========================================
router.get('/ventas', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT v.*, p.sku, p.nombre AS producto
      FROM ventas v
      JOIN productos p ON p.id = v.producto_id
      ORDER BY v.created_at DESC, v.id DESC
    `)

    res.json(r.rows)
  } catch (e) {
    console.error(e)

    res.status(500).json({
      mensaje: 'Error consultando ventas'
    })
  }
})

// ==========================================
// VENTAS - REGISTRAR
// Descuenta stock y calcula utilidad
// ==========================================
router.post('/ventas', async (req, res) => {
  const producto_id = Number(req.body.producto_id)
  const cantidad = Number(req.body.cantidad)
  const precio_unitario = Number(req.body.precio_unitario)
  const cliente = req.body.cliente?.trim() || null

  if (
    !Number.isInteger(producto_id) ||
    producto_id <= 0 ||
    !Number.isInteger(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(precio_unitario) ||
    precio_unitario <= 0
  ) {
    return res.status(400).json({
      mensaje: 'Producto, cantidad y precio unitario válidos son obligatorios.'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const pr = await client.query(
      `SELECT id, nombre, stock, costo_unitario
       FROM productos
       WHERE id = $1 AND activo = TRUE
       FOR UPDATE`,
      [producto_id]
    )

    if (!pr.rows.length) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        mensaje: 'Producto no encontrado o inactivo.'
      })
    }

    const p = pr.rows[0]
    const stockAnterior = Number(p.stock)

    // Validar disponibilidad
    if (cantidad > stockAnterior) {
      await client.query('ROLLBACK')

      return res.status(400).json({
        mensaje: `Stock insuficiente. Disponible: ${stockAnterior}`
      })
    }

    const stockNuevo = stockAnterior - cantidad
    const costoSnapshot = Number(p.costo_unitario)
    const total = cantidad * precio_unitario
    const utilidad = cantidad * (precio_unitario - costoSnapshot)

    // Actualizar inventario
    await client.query(
      `UPDATE productos
       SET stock = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [stockNuevo, producto_id]
    )

    // Registrar venta
    const venta = await client.query(
      `INSERT INTO ventas
       (producto_id, cliente, cantidad, precio_unitario,
        costo_unitario_snapshot, total, utilidad)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        producto_id,
        cliente,
        cantidad,
        precio_unitario,
        costoSnapshot,
        total,
        utilidad
      ]
    )

    // Registrar movimiento de salida
    await client.query(
      `INSERT INTO movimientos_inventario
       (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion)
       VALUES ($1, 'salida', $2, $3, $4, $5)`,
      [
        producto_id,
        cantidad,
        stockAnterior,
        stockNuevo,
        `Venta${cliente ? ' - ' + cliente : ''}`
      ]
    )

    await client.query('COMMIT')

    res.status(201).json({
      mensaje: 'Venta registrada y stock actualizado',
      venta: venta.rows[0],
      stock_actual: stockNuevo,
      utilidad
    })

  } catch (e) {
    await client.query('ROLLBACK')
    console.error(e)

    res.status(500).json({
      mensaje: 'Error registrando venta'
    })
  } finally {
    client.release()
  }
})

// ==========================================
// EXPORTAR RUTAS
// ==========================================
module.exports = router