const API_URL = 'http://localhost:3000/api';

export interface Compra {
  id: number;
  producto_id: number;
  sku: string;
  producto: string;
  proveedor: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
  observacion?: string;
  created_at: string;
}

export interface Venta {
  id: number;
  producto_id: number;
  sku: string;
  producto: string;
  cliente: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario_snapshot: number;
  total: number;
  utilidad: number;
  created_at: string;
}

export interface NuevaCompra {
  producto_id: number;
  proveedor: string;
  cantidad: number;
  costo_unitario: number;
  observacion?: string;
}

export interface NuevaVenta {
  producto_id: number;
  cliente: string;
  cantidad: number;
  precio_unitario: number;
}

async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || data.error || 'Error en la operación');
  }

  return data;
}

export async function obtenerCompras(): Promise<Compra[]> {
  const respuesta = await fetch(`${API_URL}/compras`);
  return manejarRespuesta<Compra[]>(respuesta);
}

export async function registrarCompra(
  compra: NuevaCompra
): Promise<Compra> {
  const respuesta = await fetch(`${API_URL}/compras`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(compra),
  });

  return manejarRespuesta<Compra>(respuesta);
}

export async function obtenerVentas(): Promise<Venta[]> {
  const respuesta = await fetch(`${API_URL}/ventas`);
  return manejarRespuesta<Venta[]>(respuesta);
}

export async function registrarVenta(
  venta: NuevaVenta
): Promise<Venta> {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(venta),
  });

  return manejarRespuesta<Venta>(respuesta);
}

export interface ResumenRentabilidad {
  total_transacciones: number;
  unidades_vendidas: number;
  ingresos_totales: number;
  costo_ventas: number;
  utilidad_bruta: number;
  margen_porcentaje: number;
}

export async function obtenerResumenRentabilidad(): Promise<ResumenRentabilidad> {
  const respuesta = await fetch(`${API_URL}/rentabilidad/resumen`);
  return manejarRespuesta<ResumenRentabilidad>(respuesta);
}