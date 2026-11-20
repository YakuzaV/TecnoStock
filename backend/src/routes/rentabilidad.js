const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ============================================
// RESUMEN GENERAL DE RENTABILIDAD
// GET /api/rentabilidad/resumen
// ============================================
router.get('/resumen', async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_transacciones,
        COALESCE(SUM(cantidad), 0) AS unidades_vendidas,
        COALESCE(SUM(total), 0) AS ingresos_totales,
        COALESCE(SUM(cantidad * costo_unitario_snapshot), 0) AS costo_ventas,
        COALESCE(SUM(utilidad), 0) AS utilidad_bruta,
        CASE
          WHEN COALESCE(SUM(total), 0) = 0 THEN 0
          ELSE ROUND(
            (SUM(utilidad) / SUM(total)) * 100,
            2
          )
        END AS margen_porcentaje
      FROM ventas;
    `;

    const resultado = await pool.query(query);

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error('Error en resumen de rentabilidad:', error);

    res.status(500).json({
      error: 'Error al obtener resumen de rentabilidad',
      detalle: error.message
    });
  }
});

// ============================================
// RENTABILIDAD POR PRODUCTO
// GET /api/rentabilidad/productos
// ============================================
router.get('/productos', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id,
        p.sku,
        p.nombre,
        p.stock,
        p.costo_unitario,
        p.precio_venta,

        (p.precio_venta - p.costo_unitario)
          AS utilidad_unitaria,

        CASE
          WHEN COALESCE(p.precio_venta, 0) = 0 THEN 0
          ELSE ROUND(
            ((p.precio_venta - p.costo_unitario)
            / p.precio_venta) * 100,
            2
          )
        END AS margen_porcentaje,

        (p.stock * p.costo_unitario)
          AS valor_inventario,

        (p.stock * (p.precio_venta - p.costo_unitario))
          AS utilidad_potencial,

        COALESCE(v.unidades_vendidas, 0)
          AS unidades_vendidas,

        COALESCE(v.ingresos_producto, 0)
          AS ingresos_producto,

        COALESCE(v.utilidad_producto, 0)
          AS utilidad_historica

      FROM productos p

      LEFT JOIN (
        SELECT
          producto_id,
          SUM(cantidad) AS unidades_vendidas,
          SUM(total) AS ingresos_producto,
          SUM(utilidad) AS utilidad_producto
        FROM ventas
        GROUP BY producto_id
      ) v ON v.producto_id = p.id

      WHERE p.activo = TRUE

      ORDER BY utilidad_unitaria DESC;
    `;

    const resultado = await pool.query(query);

    res.json(resultado.rows);

  } catch (error) {
    console.error('Error en rentabilidad por productos:', error);

    res.status(500).json({
      error: 'Error al obtener rentabilidad por productos',
      detalle: error.message
    });
  }
});

module.exports = router;