
const API_URL = "http://localhost:3000/api";

// Estructura que devuelve PostgreSQL a través del backend
export interface ProductoAPI {
  id: number | string;
  sku: string;
  nombre: string;
  categoria_id: number | string;
  categoria: string;
  stock: number;
  stock_minimo: number;
  costo_unitario: number | string;
  precio_venta: number | string;
  activo: boolean;
}

// Estructura que enviaremos al backend
export interface ProductoDatos {
  sku: string;
  nombre: string;
  categoria_id: number;
  stock: number;
  stock_minimo: number;
  costo_unitario: number;
  precio_venta: number;
}

async function verificarRespuesta(respuesta: Response) {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Ocurrió un error en la solicitud");
  }

  return datos;
}

// Consultar productos
export async function obtenerProductos(): Promise<ProductoAPI[]> {
  const respuesta = await fetch(`${API_URL}/productos`);
  return verificarRespuesta(respuesta);
}

// Registrar producto
export async function crearProducto(datos: ProductoDatos) {
  const respuesta = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  return verificarRespuesta(respuesta);
}

// Actualizar producto
export async function actualizarProducto(
  id: number,
  datos: ProductoDatos
) {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  return verificarRespuesta(respuesta);
}

// Eliminar producto
export async function eliminarProductoAPI(id: number) {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
  });

  return verificarRespuesta(respuesta);
}
