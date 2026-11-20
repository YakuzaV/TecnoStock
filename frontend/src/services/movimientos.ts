const API_URL = 'http://localhost:3000/api'

export interface Movimiento {
  id: number
  producto_id: number
  sku: string
  producto: string
  tipo: 'entrada' | 'salida'
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  observacion: string | null
  created_at: string
}

export interface MovimientoDatos {
  producto_id: number
  tipo: 'entrada' | 'salida'
  cantidad: number
  observacion?: string
}

async function verificarRespuesta(respuesta: Response) {
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Error en la operación')
  }

  return datos
}

export async function obtenerMovimientos(): Promise<Movimiento[]> {
  const respuesta = await fetch(`${API_URL}/movimientos`)
  return verificarRespuesta(respuesta)
}

export async function crearMovimiento(datos: MovimientoDatos) {
  const respuesta = await fetch(`${API_URL}/movimientos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })

  return verificarRespuesta(respuesta)
}