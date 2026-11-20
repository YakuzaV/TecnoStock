const API_URL = 'http://localhost:3000/api/rentabilidad';

export interface RentabilidadResumen {
  total_transacciones: number | string;
  unidades_vendidas: number | string;
  ingresos_totales: number | string;
  costo_ventas: number | string;
  utilidad_bruta: number | string;
  margen_porcentaje: number | string;
}

export interface RentabilidadProducto {
  id: number | string;
  sku: string;
  nombre: string;
  stock: number | string;
  costo_unitario: number | string;
  precio_venta: number | string;
  utilidad_unitaria: number | string;
  margen_porcentaje: number | string;
  valor_inventario: number | string;
  utilidad_potencial: number | string;
  unidades_vendidas?: number | string;
  ingresos_producto?: number | string;
  utilidad_historica?: number | string;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`Error API (${response.status}) en ${path}`);
  return response.json() as Promise<T>;
}


export const obtenerResumenRentabilidad = () => getJson<RentabilidadResumen>('/resumen');
export const obtenerProductosRentabilidad = () => getJson<RentabilidadProducto[]>('/productos');
