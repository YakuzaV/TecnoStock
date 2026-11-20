const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET: consultar historial de movimientos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        m.id,
        m.producto_id,
        p.sku,
        p.nombre AS producto,
        m.tipo,
        m.cantidad,
        m.stock_anterior,
        m.stock_nuevo,
        m.observacion,
        m.created_at
      FROM movimientos_inventario m
      INNER JOIN productos p ON p.id = m.producto_id
      ORDER BY m.created_at DESC, m.id DESC
    `)

    res.json(resultado.rows)
  } catch (error) {
    console.error('Error al consultar movimientos:', error)
    res.status(500).json({
      mensaje: 'Error al consultar el historial de inventario'
    })
  }
})

// POST: registrar entrada o salida de inventario
router.post('/', async (req, res) => {
  const { producto_id, tipo, cantidad, observacion } = req.body

  if (
    !Number.isInteger(Number(producto_id)) ||
    Number(producto_id) <= 0 ||
    !['entrada', 'salida'].includes(tipo) ||
    !Number.isInteger(Number(cantidad)) ||
    Number(cantidad) <= 0
  ) {
    return res.status(400).json({
      mensaje: 'Verifica el producto, el tipo de movimiento y la cantidad'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Bloquea el producto mientras se realiza el movimiento
    const consultaProducto = await client.query(
      `SELECT id, nombre, stock
       FROM productos
       WHERE id = $1 AND activo = TRUE
       FOR UPDATE`,
      [Number(producto_id)]
    )

    if (consultaProducto.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        mensaje: 'Producto no encontrado o inactivo'
      })
    }

    const producto = consultaProducto.rows[0]
    const stockAnterior = Number(producto.stock)
    const unidades = Number(cantidad)

    let stockNuevo

    if (tipo === 'entrada') {
      stockNuevo = stockAnterior + unidades
    } else {
      if (unidades > stockAnterior) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          mensaje: `Stock insuficiente. Existencias disponibles: ${stockAnterior}`
        })
      }

      stockNuevo = stockAnterior - unidades
    }

    // Actualizar existencias
    await client.query(
      `UPDATE productos
       SET stock = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [stockNuevo, Number(producto_id)]
    )

    // Guardar historial
    const movimiento = await client.query(
      `INSERT INTO movimientos_inventario
       (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        Number(producto_id),
        tipo,
        unidades,
        stockAnterior,
        stockNuevo,
        observacion?.trim() || null
      ]
    )

    await client.query('COMMIT')

    res.status(201).json({
      mensaje: 'Movimiento registrado correctamente',
      producto: producto.nombre,
      movimiento: movimiento.rows[0],
      stock_actual: stockNuevo
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al registrar movimiento:', error)

    res.status(500).json({
      mensaje: 'Error al registrar el movimiento de inventario'
    })
  } finally {
    client.release()
  }
})

module.exports = router