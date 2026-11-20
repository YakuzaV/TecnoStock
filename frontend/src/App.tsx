import Operaciones from './Operaciones'
import Rentabilidad from './components/rentabilidad/Rentabilidad'
import Reportes from './Reportes';
import { useEffect, useState } from 'react'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProductoAPI,
  type ProductoAPI,
  type ProductoDatos
} from './services/productos'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Receipt, ChartNoAxesCombined, FileBarChart, Bell,
  Plus, Search, Pencil, Trash2, X, Save, Boxes
} from 'lucide-react'
import './App.css'

import {
  obtenerMovimientos,
  crearMovimiento,
  type Movimiento
} from './services/movimientos'

type Producto = {
  id: number
  sku: string
  nombre: string
  categoria: string
  stock: number
  minimo: number
  costo: number
  precio: number
}
function adaptarProducto(p: ProductoAPI): Producto {
  return {
    id: Number(p.id),
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categoria,
    stock: Number(p.stock),
    minimo: Number(p.stock_minimo),
    costo: Number(p.costo_unitario),
    precio: Number(p.precio_venta),
  }
}


const menu = [
  { nombre: 'Dashboard', icono: LayoutDashboard },
  { nombre: 'Productos', icono: Package },
  { nombre: 'Inventario', icono: Warehouse },
  { nombre: 'Compras', icono: ShoppingCart },
  { nombre: 'Ventas', icono: Receipt },
  { nombre: 'Rentabilidad', icono: ChartNoAxesCombined },
  { nombre: 'Reportes', icono: FileBarChart },
]

const moneda = (valor: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)

const formularioVacio = {
  sku: '',
  nombre: '',
  categoria: 'Periféricos',
  stock: 0,
  minimo: 5,
  costo: 0,
  precio: 0,
}

function App() {
  const [seccion, setSeccion] = useState('Dashboard')
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<number | null>(null)
  const [formulario, setFormulario] = useState(formularioVacio)
  const [error, setError] = useState('')
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>('entrada')
  const [productoMovimiento, setProductoMovimiento] = useState('')
  const [cantidadMovimiento, setCantidadMovimiento] = useState(1)
  const [observacionMovimiento, setObservacionMovimiento] = useState('')
  const [errorMovimiento, setErrorMovimiento] = useState('')
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false)
  async function cargarHistorialMovimientos() {
    try {
      setCargandoMovimientos(true)
      const datos = await obtenerMovimientos()
      setMovimientos(datos)
      setErrorMovimiento('')
    } catch (err) {
      console.error('Error al cargar movimientos:', err)
      setErrorMovimiento('No fue posible cargar el historial.')
    } finally {
      setCargandoMovimientos(false)
    }
  }

  async function cargarProductos() {
    try {
      setError('')
      const datos = await obtenerProductos()
      setProductos(datos.map(adaptarProducto))
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError(err instanceof Error ? err.message : 'No fue posible cargar los productos')
    }
  }

  async function registrarMovimiento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMovimiento('')

    if (!productoMovimiento || !Number.isInteger(cantidadMovimiento) || cantidadMovimiento < 1) {
      setErrorMovimiento('Selecciona un producto y una cantidad válida (mínimo 1).')
      return
    }

    try {
      await crearMovimiento({
        producto_id: Number(productoMovimiento),
        tipo: tipoMovimiento,
        cantidad: cantidadMovimiento,
        observacion: observacionMovimiento.trim()
      })
      await cargarProductos()
      await cargarHistorialMovimientos()
      setCantidadMovimiento(1)
      setObservacionMovimiento('')
    } catch (err) {
      setErrorMovimiento(err instanceof Error ? err.message : 'No fue posible registrar el movimiento.')
    }
  }


  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    if (seccion === 'Inventario') {
      cargarHistorialMovimientos()
    }
  }, [seccion])

  const inventario = productos.reduce(
    (total, p) => total + p.stock * p.costo, 0
  )

  const alertas = productos.filter(p => p.stock <= p.minimo)

  const valorVenta = productos.reduce(
    (total, p) => total + p.stock * p.precio, 0
  )

  const margenPotencial = valorVenta > 0
    ? ((valorVenta - inventario) / valorVenta) * 100
    : 0

  const filtrados = productos.filter(p =>
    `${p.nombre} ${p.sku} ${p.categoria}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  function abrirNuevo() {
    setFormulario(formularioVacio)
    setProductoEditando(null)
    setError('')
    setModalAbierto(true)
  }

  function abrirEdicion(producto: Producto) {
    setFormulario({
      sku: producto.sku,
      nombre: producto.nombre,
      categoria: producto.categoria,
      stock: producto.stock,
      minimo: producto.minimo,
      costo: producto.costo,
      precio: producto.precio,
    })
    setProductoEditando(producto.id)
    setError('')
    setModalAbierto(true)
  }

  async function guardarProducto(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setError('')

  if (!formulario.sku.trim() || !formulario.nombre.trim()) {
    setError('El SKU y el nombre son obligatorios.')
    return
  }

  const skuRepetido = productos.some(
    p =>
      p.sku.toLowerCase() === formulario.sku.trim().toLowerCase() &&
      p.id !== productoEditando
  )

  if (skuRepetido) {
    setError('Ya existe un producto con ese SKU.')
    return
  }

  if (
    formulario.stock < 0 ||
    formulario.minimo < 0 ||
    formulario.costo <= 0 ||
    formulario.precio <= 0
  ) {
    setError('Verifica las cantidades y los valores ingresados.')
    return
  }

  if (formulario.precio < formulario.costo) {
    setError('El precio de venta no puede ser inferior al costo.')
    return
  }

  const categoriasIds: Record<string, number> = {
    'Periféricos': 1,
    'Componentes': 2,
    'Almacenamiento': 3,
    'Monitores': 4,
    'Accesorios': 5,
    'Otros': 6,
  }

  const categoriaId = categoriasIds[formulario.categoria]

  if (!categoriaId) {
    setError('Selecciona una categoría válida.')
    return
  }

  const datos: ProductoDatos = {
    sku: formulario.sku.trim(),
    nombre: formulario.nombre.trim(),
    categoria_id: categoriaId,
    stock: Number(formulario.stock),
    stock_minimo: Number(formulario.minimo),
    costo_unitario: Number(formulario.costo),
    precio_venta: Number(formulario.precio),
  }

  try {
    if (productoEditando !== null) {
      await actualizarProducto(productoEditando, datos)
    } else {
      await crearProducto(datos)
    }

    const productosActualizados = await obtenerProductos()
    setProductos(productosActualizados.map(adaptarProducto))

    setModalAbierto(false)
    setFormulario(formularioVacio)
    setProductoEditando(null)
    setError('')
  } catch (err) {
    console.error('Error al guardar producto:', err)
    setError(
      err instanceof Error
        ? err.message
        : 'No fue posible guardar el producto.'
    )
  }
}

  async function eliminarProducto(id: number) {
  const producto = productos.find(p => p.id === id)
  if (!producto) return

  const confirmar = window.confirm(
    `¿Deseas eliminar el producto "${producto.nombre}"?`
  )

  if (!confirmar) return

  try {
    await eliminarProductoAPI(id)

    const productosActualizados = await obtenerProductos()
    setProductos(productosActualizados.map(adaptarProducto))

    setError('')
    alert('Producto eliminado correctamente.')
  } catch (err) {
    console.error('Error al eliminar producto:', err)

    setError(
      err instanceof Error
        ? err.message
        : 'No fue posible eliminar el producto.'
    )
  }
}

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="marca">
          <div className="marca-icono"><Boxes size={25} /></div>
          <div>
            <h2>TecnoStock</h2>
            <small>Gestión Inteligente</small>
          </div>
        </div>

        <p className="menu-titulo">MENÚ PRINCIPAL</p>

        <nav aria-label="Navegación principal">
          {menu.map(item => {
            const Icono = item.icono
            return (
              <button
                key={item.nombre}
                className={`menu-item ${seccion === item.nombre ? 'activo' : ''}`}
                onClick={() => {
                  setSeccion(item.nombre)
                  setBusqueda('')
                }}
              >
                <Icono size={19} />
                <span>{item.nombre}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-pie">
          <div className="avatar">TS</div>
          <div>
            <strong>Administrador</strong>
            <small>Entorno de demostración</small>
          </div>
        </div>
      </aside>

      <main className="principal">
        <header className="topbar">
          <div>
            <span className="ruta">TecnoStock / {seccion}</span>
            <h1>{seccion}</h1>
          </div>
          <div className="acciones">
            <span className="entorno">Datos de demostración</span>
            <button className="icon-button" aria-label="Notificaciones">
              <Bell size={21} />
            </button>
            <div className="avatar avatar-azul">AD</div>
          </div>
        </header>

        {seccion === 'Dashboard' && (
          <>
            <div className="bienvenida">
              <div>
                <h2>Bienvenido a TecnoStock</h2>
                <p>Consulta el estado general de tu negocio tecnológico.</p>
              </div>
              <span className="etiqueta">Vista de demostración</span>
            </div>

            <section className="indicadores">
              <div className="tarjeta">
                <div className="tarjeta-icono azul"><Package size={23} /></div>
                <span>Total de productos</span>
                <strong>{productos.length}</strong>
                <small>Referencias registradas</small>
              </div>

              <div className="tarjeta">
                <div className="tarjeta-icono morado">$</div>
                <span>Valor del inventario</span>
                <strong>{moneda(inventario)}</strong>
                <small>Valor calculado al costo</small>
              </div>

              <div className="tarjeta">
                <div className="tarjeta-icono naranja">!</div>
                <span>Productos con alerta</span>
                <strong>{alertas.length}</strong>
                <small>Stock menor o igual al mínimo</small>
              </div>

              <div className="tarjeta">
                <div className="tarjeta-icono verde">%</div>
                <span>Margen potencial</span>
                <strong>{margenPotencial.toFixed(1)}%</strong>
                <small>Estimación sobre existencias</small>
              </div>
            </section>

            <section className="panel">
              <div className="panel-encabezado">
                <div>
                  <h3>Productos registrados</h3>
                  <p>Consulta de existencias y precios</p>
                </div>
                <button className="boton-primario" onClick={() => setSeccion('Productos')}>
                  <Package size={18} /> Ver productos
                </button>
              </div>
              <TablaProductos
                productos={productos.slice(0, 5)}
                editar={abrirEdicion}
                eliminar={eliminarProducto}
              />
            </section>
          </>
        )}

        {seccion === 'Productos' && (
          <section className="panel">
            <div className="panel-encabezado">
              <div>
                <h3>{seccion === 'Productos' ? 'Catálogo de productos' : 'Control de inventario'}</h3>
                <p>
                  {productos.length} productos registrados en el sistema
                </p>
              </div>

              {seccion === 'Productos' && (
                <button className="boton-primario" onClick={abrirNuevo}>
                  <Plus size={18} /> Nuevo producto
                </button>
              )}
            </div>

            <div className="buscador">
              <Search size={19} />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, SKU o categoría..."
              />
            </div>

            <TablaProductos
              productos={filtrados}
              editar={abrirEdicion}
              eliminar={eliminarProducto}
            />
          </section>
        )}

        {seccion === 'Inventario' && (
  <section className="panel">
    <div className="panel-encabezado">
      <div>
        <h3>Control de inventario</h3>
        <p>Registra entradas y salidas de productos</p>
      </div>
    </div>

    <form onSubmit={registrarMovimiento} className="form-movimiento">
      <div className="form-grid-movimiento">
        <label>
          Tipo de movimiento
          <select
            value={tipoMovimiento}
            onChange={e =>
              setTipoMovimiento(e.target.value as 'entrada' | 'salida')
            }
          >
            <option value="entrada">Entrada de inventario</option>
            <option value="salida">Salida de inventario</option>
          </select>
        </label>

        <label>
          Producto
          <select
            value={productoMovimiento}
            onChange={e => setProductoMovimiento(e.target.value)}
            required
          >
            <option value="">Selecciona un producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.sku} - {producto.nombre} (Stock: {producto.stock})
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantidad
          <input
            type="number"
            min="1"
            step="1"
            value={cantidadMovimiento}
            onChange={e => setCantidadMovimiento(Number(e.target.value))}
            required
          />
        </label>

        <label>
          Observación
          <input
            type="text"
            value={observacionMovimiento}
            onChange={e => setObservacionMovimiento(e.target.value)}
            placeholder="Ej. Compra a proveedor o venta realizada"
          />
        </label>
      </div>

      {errorMovimiento && (
        <p className="mensaje-error">{errorMovimiento}</p>
      )}

      <button
        type="submit"
        className="boton-primario"
        disabled={cargandoMovimientos}
      >
        {tipoMovimiento === 'entrada'
          ? 'Registrar entrada'
          : 'Registrar salida'}
      </button>
    </form>

    <div className="panel-encabezado encabezado-historial">
      <div>
        <h3>Historial de movimientos</h3>
        <p>Movimientos registrados en el sistema</p>
      </div>
    </div>

    {cargandoMovimientos ? (
      <p>Cargando movimientos...</p>
    ) : movimientos.length === 0 ? (
      <p>No hay movimientos registrados.</p>
    ) : (
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock anterior</th>
              <th>Stock nuevo</th>
              <th>Observación</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map(movimiento => (
              <tr key={movimiento.id}>
                <td>
                  {new Date(movimiento.created_at).toLocaleString('es-CO')}
                </td>
                <td>
                  <strong>{movimiento.producto}</strong>
                  <small>{movimiento.sku}</small>
                </td>
                <td>
                  <span
                    className={`estado-movimiento ${movimiento.tipo}`}
                  >
                    {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                  </span>
                </td>
                <td>{movimiento.cantidad}</td>
                <td>{movimiento.stock_anterior}</td>
                <td>{movimiento.stock_nuevo}</td>
                <td>{movimiento.observacion || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

        {(seccion === 'Compras' || seccion === 'Ventas') && (
  <Operaciones />
)}

{seccion === 'Rentabilidad' && <Rentabilidad />}

{seccion === 'Reportes' && <Reportes />}

      {modalAbierto && (
        <div className="modal-fondo" onClick={() => setModalAbierto(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-modal">
                  {productoEditando !== null ? 'Editar producto' : 'Registrar producto'}
                </h2>
                <p>Completa la información del producto tecnológico.</p>
              </div>
              <button className="cerrar-modal" onClick={() => setModalAbierto(false)} aria-label="Cerrar">
                <X size={21} />
              </button>
            </div>

            <form onSubmit={guardarProducto}>
              <div className="form-grid">
                <label>
                  Código SKU *
                  <input
                    value={formulario.sku}
                    onChange={e => setFormulario({ ...formulario, sku: e.target.value })}
                    placeholder="Ej. MOU-002"
                    required
                  />
                </label>

                <label>
                  Nombre del producto *
                  <input
                    value={formulario.nombre}
                    onChange={e => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Nombre del producto"
                    required
                  />
                </label>

                <label>
                  Categoría
                  <select
                    value={formulario.categoria}
                    onChange={e => setFormulario({ ...formulario, categoria: e.target.value })}
                  >
                    <option>Periféricos</option>
                    <option>Componentes</option>
                    <option>Almacenamiento</option>
                    <option>Monitores</option>
                    <option>Accesorios</option>
                    <option>Otros</option>
                  </select>
                </label>

                <label>
                  Existencias
                  <input
                    type="number"
                    min="0"
                    value={formulario.stock}
                    onChange={e => setFormulario({ ...formulario, stock: Number(e.target.value) })}
                  />
                </label>

                <label>
                  Stock mínimo
                  <input
                    type="number"
                    min="0"
                    value={formulario.minimo}
                    onChange={e => setFormulario({ ...formulario, minimo: Number(e.target.value) })}
                  />
                </label>

                <label>
                  Costo unitario (COP)
                  <input
                    type="number"
                    min="1"
                    value={formulario.costo}
                    onChange={e => setFormulario({ ...formulario, costo: Number(e.target.value) })}
                    required
                  />
                </label>

                <label className="campo-completo">
                  Precio de venta (COP)
                  <input
                    type="number"
                    min="1"
                    value={formulario.precio}
                    onChange={e => setFormulario({ ...formulario, precio: Number(e.target.value) })}
                    required
                  />
                </label>
              </div>

              {error && <p className="mensaje-error">{error}</p>}

              <div className="modal-acciones">
                <button type="button" className="boton-secundario" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario">
                  <Save size={17} />
                  {productoEditando !== null ? 'Guardar cambios' : 'Registrar producto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      </main>
    </div>
  )
}

function TablaProductos({
  productos,
  editar,
  eliminar,
}: {
  productos: Producto[]
  editar: (producto: Producto) => void
  eliminar: (id: number) => void
}) {
  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>SKU / Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Costo</th>
            <th>Precio venta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>
                <strong className="nombre-producto">{producto.nombre}</strong>
                <small className="sku">{producto.sku}</small>
              </td>
              <td>{producto.categoria}</td>
              <td>{producto.stock}</td>
              <td>{moneda(producto.costo)}</td>
              <td>{moneda(producto.precio)}</td>
              <td>
                <span className={`estado ${producto.stock <= producto.minimo ? 'bajo' : 'normal'}`}>
                  {producto.stock <= producto.minimo ? 'Stock bajo' : 'Disponible'}
                </span>
              </td>
              <td>
                <div className="acciones-tabla">
                  <button className="accion-editar" onClick={() => editar(producto)} title="Editar">
                    <Pencil size={16} />
                  </button>
                  <button className="accion-eliminar" onClick={() => eliminar(producto.id)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr><td colSpan={7}>No se encontraron productos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
