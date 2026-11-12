
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Receipt,
  ChartNoAxesCombined,
  FileBarChart,
  Bell,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  Boxes,
  DollarSign,
} from 'lucide-react'
import './App.css'

const productos = [
  { id: 1, nombre: 'Mouse Logitech', categoria: 'Periféricos', stock: 12, minimo: 5, costo: 35000, precio: 55000 },
  { id: 2, nombre: 'Teclado mecánico', categoria: 'Periféricos', stock: 5, minimo: 5, costo: 120000, precio: 175000 },
  { id: 3, nombre: 'SSD 1 TB', categoria: 'Almacenamiento', stock: 3, minimo: 5, costo: 210000, precio: 285000 },
  { id: 4, nombre: 'Memoria RAM 16 GB', categoria: 'Componentes', stock: 8, minimo: 5, costo: 95000, precio: 145000 },
  { id: 5, nombre: 'Monitor 24 pulgadas', categoria: 'Monitores', stock: 2, minimo: 4, costo: 390000, precio: 520000 },
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

function App() {
  const [seccion, setSeccion] = useState('Dashboard')
  const [busqueda, setBusqueda] = useState('')

  const inventario = productos.reduce(
    (total, producto) => total + producto.stock * producto.costo,
    0
  )

  const alertas = productos.filter(
    producto => producto.stock <= producto.minimo
  )

  const filtrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

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
                onClick={() => setSeccion(item.nombre)}
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
            <span className="entorno">Datos de ejemplo</span>
            <button className="icon-button" aria-label="Notificaciones">
              <Bell size={21} />
            </button>
            <div className="avatar avatar-azul">AD</div>
          </div>
        </header>

        {seccion === 'Dashboard' ? (
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
                <div className="tarjeta-icono morado"><DollarSign size={23} /></div>
                <span>Valor del inventario</span>
                <strong>{moneda(inventario)}</strong>
                <small>Calculado al costo unitario</small>
              </div>

              <div className="tarjeta">
                <div className="tarjeta-icono naranja"><AlertTriangle size={23} /></div>
                <span>Productos con alerta</span>
                <strong>{alertas.length}</strong>
                <small>Stock menor o igual al mínimo</small>
              </div>

              <div className="tarjeta">
                <div className="tarjeta-icono verde"><TrendingUp size={23} /></div>
                <span>Margen potencial</span>
                <strong>
                  {(
                    productos.reduce((t, p) => t + (p.precio - p.costo) * p.stock, 0) /
                    productos.reduce((t, p) => t + p.precio * p.stock, 0) * 100
                  ).toFixed(1)}%
                </strong>
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
                  <Plus size={18} /> Ver productos
                </button>
              </div>
              <TablaProductos productos={productos} />
            </section>
          </>
        ) : seccion === 'Productos' || seccion === 'Inventario' ? (
          <section className="panel">
            <div className="panel-encabezado">
              <div>
                <h3>{seccion === 'Productos' ? 'Catálogo de productos' : 'Control de inventario'}</h3>
                <p>Información de demostración</p>
              </div>
            </div>

            <div className="buscador">
              <Search size={19} />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
              />
            </div>

            <TablaProductos productos={filtrados} />
          </section>
        ) : (
          <section className="panel pendiente">
            <div className="tarjeta-icono azul"><Boxes size={28} /></div>
            <h2>Módulo de {seccion}</h2>
            <p>
              Esta sección será implementada en los próximos Sprints.
              Actualmente estamos construyendo la interfaz inicial.
            </p>
            <button className="boton-primario" onClick={() => setSeccion('Dashboard')}>
              Volver al Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

type Producto = (typeof productos)[number]

function TablaProductos({ productos: lista }: { productos: Producto[] }) {
  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Costo</th>
            <th>Precio de venta</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(producto => (
            <tr key={producto.id}>
              <td className="nombre-producto">{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>{producto.stock}</td>
              <td>{moneda(producto.costo)}</td>
              <td>{moneda(producto.precio)}</td>
              <td>
                <span className={`estado ${producto.stock <= producto.minimo ? 'bajo' : 'normal'}`}>
                  {producto.stock <= producto.minimo ? 'Stock bajo' : 'Disponible'}
                </span>
              </td>
            </tr>
          ))}
          {lista.length === 0 && (
            <tr><td colSpan={6}>No se encontraron productos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
