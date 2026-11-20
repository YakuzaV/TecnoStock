
const express = require('express')
const router = express.Router()
const pool = require('../config/database')

// GET: consultar todos los productos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.categoria_id,
        c.nombre AS categoria,
        p.stock,
        p.stock_minimo,
        p.costo_unitario,
        p.precio_venta,
        p.activo,
        p.created_at,
        p.updated_at
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
      ORDER BY p.id DESC
    `)

    res.json(resultado.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al consultar productos' })
  }
})

// GET: consultar un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ mensaje: 'ID no válido' })
    }

    const resultado = await pool.query(
      `SELECT p.*, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1 AND p.activo = TRUE`,
      [id]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' })
    }

    res.json(resultado.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al consultar el producto' })
  }
})

// POST: registrar un producto
router.post('/', async (req, res) => {
  try {
    const {
      sku,
      nombre,
      categoria_id,
      stock = 0,
      stock_minimo = 5,
      costo_unitario,
      precio_venta
    } = req.body

    if (
      !sku?.trim() ||
      !nombre?.trim() ||
      !Number.isInteger(Number(stock)) ||
      !Number.isInteger(Number(stock_minimo)) ||
      !Number.isFinite(Number(costo_unitario)) ||
      !Number.isFinite(Number(precio_venta)) ||
      Number(stock) < 0 ||
      Number(stock_minimo) < 0 ||
      Number(costo_unitario) <= 0 ||
      Number(precio_venta) <= 0
    ) {
      return res.status(400).json({
        mensaje: 'Verifica los campos obligatorios y los valores numéricos'
      })
    }

    const resultado = await pool.query(
      `INSERT INTO productos
       (sku, nombre, categoria_id, stock, stock_minimo,
        costo_unitario, precio_venta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sku.trim(),
        nombre.trim(),
        categoria_id || null,
        Number(stock),
        Number(stock_minimo),
        Number(costo_unitario),
        Number(precio_venta)
      ]
    )

    res.status(201).json({
      mensaje: 'Producto registrado correctamente',
      producto: resultado.rows[0]
    })
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'El SKU ya está registrado'
      })
    }

    if (error.code === '23503') {
      return res.status(400).json({
        mensaje: 'La categoría seleccionada no existe'
      })
    }

    res.status(500).json({ mensaje: 'Error al registrar el producto' })
  }
})

// PUT: actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ mensaje: 'ID no válido' })
    }

    const {
      sku,
      nombre,
      categoria_id,
      stock,
      stock_minimo,
      costo_unitario,
      precio_venta
    } = req.body

    if (
      !sku?.trim() ||
      !nombre?.trim() ||
      !Number.isInteger(Number(stock)) ||
      !Number.isInteger(Number(stock_minimo)) ||
      !Number.isFinite(Number(costo_unitario)) ||
      !Number.isFinite(Number(precio_venta)) ||
      Number(stock) < 0 ||
      Number(stock_minimo) < 0 ||
      Number(costo_unitario) <= 0 ||
      Number(precio_venta) <= 0
    ) {
      return res.status(400).json({
        mensaje: 'Verifica los campos obligatorios y los valores numéricos'
      })
    }

    const resultado = await pool.query(
      `UPDATE productos
       SET sku = $1,
           nombre = $2,
           categoria_id = $3,
           stock = $4,
           stock_minimo = $5,
           costo_unitario = $6,
           precio_venta = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND activo = TRUE
       RETURNING *`,
      [
        sku.trim(),
        nombre.trim(),
        categoria_id || null,
        Number(stock),
        Number(stock_minimo),
        Number(costo_unitario),
        Number(precio_venta),
        id
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' })
    }

    res.json({
      mensaje: 'Producto actualizado correctamente',
      producto: resultado.rows[0]
    })
  } catch (error) {
    console.error(error)

    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'El SKU ya está registrado' })
    }

    res.status(500).json({ mensaje: 'Error al actualizar el producto' })
  }
})

// DELETE: eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ mensaje: 'ID no válido' })
    }

    const resultado = await pool.query(
      `DELETE FROM productos WHERE id = $1 RETURNING id`,
      [id]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' })
    }

    res.json({ mensaje: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: 'Error al eliminar el producto' })
  }
})

module.exports = router
