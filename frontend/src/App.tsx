
import { useState } from 'react'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Receipt, ChartNoAxesCombined, FileBarChart, Bell,
  Plus, Search, Pencil, Trash2, X, Save, Boxes
} from 'lucide-react'
import './App.css'

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

const productosIniciales: Producto[] = [
  { id: 1, sku: 'MOU-001', nombre: 'Mouse Logitech', categoria: 'Periféricos', stock: 12, minimo: 5, costo: 35000, precio: 55000 },
  { id: 2, sku: 'TEC-001', nombre: 'Teclado mecánico', categoria: 'Periféricos', stock: 5, minimo: 5, costo: 120000, precio: 175000 },
  { id: 3, sku: 'SSD-001', nombre: 'SSD 1 TB', categoria: 'Almacenamiento', stock: 3, minimo: 5, costo: 210000, precio: 285000 },
  { id: 4, sku: 'RAM-001', nombre: 'Memoria RAM 16 GB', categoria: 'Componentes', stock: 8, minimo: 5, costo: 95000, precio: 145000 },
  { id: 5, sku: 'MON-001', nombre: 'Monitor 24 pulgadas', categoria: 'Monitores', stock: 2, minimo: 4, costo: 390000, precio: 520000 },
]

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
  const [productos, setProductos] = useState(productosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<number | null>(null)
  const [formulario, setFormulario] = useState(formularioVacio)
  const [error, setError] = useState('')

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

  function guardarProducto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!formulario.sku.trim() || !formulario.nombre.trim()) {
      setError('El SKU y el nombre son obligatorios.')
      return
    }

    const skuRepetido = productos.some(
      p => p.sku.toLowerCase() === formulario.sku.trim().toLowerCase()
        && p.id !== productoEditando
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

    if (productoEditando !== null) {
      setProductos(actuales =>
        actuales.map(p =>
          p.id === productoEditando
            ? { ...p, ...formulario, sku: formulario.sku.trim(), nombre: formulario.nombre.trim() }
            : p
        )
      )
    } else {
      setProductos(actuales => [
        ...actuales,
        {
          id: Date.now(),
          ...formulario,
          sku: formulario.sku.trim(),
          nombre: formulario.nombre.trim(),
        },
      ])
    }

    setModalAbierto(false)
  }

  function eliminarProducto(id: number) {
    const producto = productos.find(p => p.id === id)
    if (!producto) return

    const confirmar = window.confirm(
      `¿Deseas eliminar el producto "${producto.nombre}"?`
    )

    if (confirmar) {
      setProductos(actuales => actuales.filter(p => p.id !== id))
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="marca">
          <div className="marca-icono"><Boxes size={25} /></div>
          <div>
            <h2>TecnoStock</h2>
            <small>Gestión inteligente</small>
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

        {(seccion === 'Productos' || seccion === 'Inventario') && (
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

        {!['Dashboard', 'Productos', 'Inventario'].includes(seccion) && (
          <section className="panel pendiente">
            <div className="tarjeta-icono azul"><Boxes size={28} /></div>
            <h2>Módulo de {seccion}</h2>
            <p>
              Esta sección será implementada en los próximos Sprints.
              Actualmente estamos desarrollando el módulo de productos.
            </p>
            <button className="boton-primario" onClick={() => setSeccion('Dashboard')}>
              Volver al Dashboard
            </button>
          </section>
        )}
      </main>

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
