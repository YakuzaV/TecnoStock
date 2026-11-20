
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const pool = require('./config/database')
const productosRoutes = require('./routes/productos')
const movimientosRoutes = require('./routes/movimientos')
const operacionesRoutes = require('./routes/operaciones')
const rentabilidadRoutes = require('./routes/rentabilidad')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
}))

app.use(express.json())
app.use('/api/productos', productosRoutes)
app.use('/api/movimientos', movimientosRoutes)
app.use('/api', operacionesRoutes)
app.use('/api/rentabilidad', rentabilidadRoutes)

app.get('/', (req, res) => {
  res.json({
    sistema: 'TecnoStock API',
    mensaje: 'Servidor funcionando correctamente',
  })
})

app.get('/api/health', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT current_database() AS database, NOW() AS fecha'
    )

    res.json({
      estado: 'OK',
      mensaje: 'Conexión con PostgreSQL exitosa',
      baseDatos: resultado.rows[0].database,
      fechaServidor: resultado.rows[0].fecha,
    })
  } catch (error) {
    console.error('Error de conexión:', error.message)

    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'No fue posible conectar con PostgreSQL',
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`TecnoStock API ejecutándose en http://localhost:${PORT}`)
})
