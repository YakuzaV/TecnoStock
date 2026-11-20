import { useEffect, useMemo, useState } from 'react'
import { obtenerResumenRentabilidad, obtenerProductosRentabilidad, type RentabilidadResumen, type RentabilidadProducto } from './rentabilidadService'
import './rentabilidad.css'

const money = (value: unknown) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value ?? 0))
const number = (value: unknown) => new Intl.NumberFormat('es-CO').format(Number(value ?? 0))

const emptySummary: RentabilidadResumen = {
  total_transacciones: 0,
  unidades_vendidas: 0,
  ingresos_totales: 0,
  costo_ventas: 0,
  utilidad_bruta: 0,
  margen_porcentaje: 0,
}

export default function Rentabilidad() {
  const [summary, setSummary] = useState<RentabilidadResumen>(emptySummary)
  const [products, setProducts] = useState<RentabilidadProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [summaryData, productsData] = await Promise.all([
        obtenerResumenRentabilidad(),
        obtenerProductosRentabilidad(),
      ])
      setSummary(summaryData)
      setProducts(productsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible cargar rentabilidad. Verifica el backend.')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => { void loadData() }, [])

  const filteredProducts = useMemo(() => products.filter(p =>
    `${p.sku ?? ''} ${p.nombre ?? ''}`.toLowerCase().includes(filter.toLowerCase())
  ), [products, filter])

  const topProducts = [...products]
    .sort((a, b) => Number(b.utilidad_historica ?? 0) - Number(a.utilidad_historica ?? 0))
    .slice(0, 5)
  const maxProfit = Math.max(...topProducts.map(p => Number(p.utilidad_historica ?? 0)), 1)

  return (
    <section className="ts-profit-page">
      <div className="ts-profit-header">
        <div>
          <div className="ts-profit-breadcrumb">TecnoStock / Rentabilidad</div>
          <h1>Rentabilidad</h1>
          <p>Analiza ingresos, costos y utilidad de tu negocio tecnológico.</p>
        </div>
        <button className="ts-profit-refresh" onClick={() => void loadData()} disabled={loading}>
          {loading ? 'Actualizando…' : '↻ Actualizar datos'}
        </button>
      </div>

      {error && <div className="ts-profit-error"><strong>No se pudo consultar la API.</strong><br />{error}<br />Comprueba que el backend esté activo en localhost:3000.</div>}


      <div className="ts-profit-kpis">
        <article className="ts-profit-card"><div className="ts-profit-icon blue">↗</div><span>Ingresos totales</span><strong>{money(summary.ingresos_totales)}</strong><small>Ventas registradas</small></article>
        <article className="ts-profit-card"><div className="ts-profit-icon purple">$</div><span>Costo de ventas</span><strong>{money(summary.costo_ventas)}</strong><small>Costo de los productos vendidos</small></article>
        <article className="ts-profit-card"><div className="ts-profit-icon green">✦</div><span>Utilidad bruta</span><strong>{money(summary.utilidad_bruta)}</strong><small>Ingresos menos costos</small></article>
        <article className="ts-profit-card"><div className="ts-profit-icon amber">%</div><span>Margen bruto</span><strong>{Number(summary.margen_porcentaje || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%</strong><small>Rentabilidad sobre ventas</small></article>
      </div>


      <div className="ts-profit-secondary">
        <article className="ts-profit-panel ts-profit-volume">
          <h2>Actividad comercial</h2>
          <div className="ts-profit-stat"><span>Transacciones</span><strong>{number(summary.total_transacciones)}</strong></div>
          <div className="ts-profit-stat"><span>Unidades vendidas</span><strong>{number(summary.unidades_vendidas)}</strong></div>
        </article>
        <article className="ts-profit-panel ts-profit-top">
          <h2>Productos con mayor utilidad histórica</h2>
          {loading ? <div className="ts-profit-empty">Cargando datos…</div> : topProducts.length === 0 ? <div className="ts-profit-empty">Aún no hay ventas para comparar productos.</div> : topProducts.map(p => {
            const value = Number(p.utilidad_historica ?? 0)
            return (
              <div className="ts-profit-bar-row" key={p.id}>
                <div className="ts-profit-bar-label"><span>{p.nombre}</span><strong>{money(value)}</strong></div>
                <div className="ts-profit-bar-track"><div className="ts-profit-bar-fill" style={{ width: `${Math.max(2, value / maxProfit * 100)}%` }} /></div>
              </div>
            )
          })}
        </article>
      </div>


      <article className="ts-profit-panel ts-profit-table-panel">
        <div className="ts-profit-table-header">
          <div><h2>Rentabilidad por producto</h2><p>Margen, inventario y utilidad estimada por referencia.</p></div>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar SKU o producto…" />
        </div>
        <div className="ts-profit-table-wrap">
          <table className="ts-profit-table">
            <thead><tr><th>SKU / Producto</th><th>Stock</th><th>Costo</th><th>Precio venta</th><th>Utilidad unitaria</th><th>Margen</th><th>Valor inventario</th><th>Utilidad histórica</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="ts-profit-empty">Cargando datos…</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="ts-profit-empty">No se encontraron productos.</td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id}>
                  <td><b>{p.sku}</b><small>{p.nombre}</small></td>
                  <td>{number(p.stock)}</td><td>{money(p.costo_unitario)}</td><td>{money(p.precio_venta)}</td>
                  <td className={Number(p.utilidad_unitaria) >= 0 ? 'ts-positive' : 'ts-negative'}>{money(p.utilidad_unitaria)}</td>
                  <td><span className="ts-profit-pill">{Number(p.margen_porcentaje || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%</span></td>
                  <td>{money(p.valor_inventario)}</td><td>{money(p.utilidad_historica ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <p className="ts-profit-note">* La utilidad histórica corresponde a las ventas registradas. La utilidad potencial del inventario es una estimación y no representa una venta realizada.</p>
    </section>
  )
}
