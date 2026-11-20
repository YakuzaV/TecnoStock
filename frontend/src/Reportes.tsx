import { useEffect, useMemo, useState } from 'react'

type FilaProducto = { id: number; sku: string; nombre: string; categoria?: string; stock: number; stock_minimo: number; costo_unitario: number | string; precio_venta: number | string }
type FilaOperacion = { id: number; producto?: string; sku?: string; cantidad: number; total: number | string; utilidad?: number | string; created_at?: string; proveedor?: string; cliente?: string }

const API = 'http://localhost:3000/api'
const cop = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
const csvCell = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`
function descargarCSV(nombre: string, filas: unknown[][]) {
  const contenido = '\uFEFF' + filas.map(f => f.map(csvCell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = nombre; a.click(); URL.revokeObjectURL(url)
}

export default function Reportes() {
  const [productos, setProductos] = useState<FilaProducto[]>([])
  const [compras, setCompras] = useState<FilaOperacion[]>([])
  const [ventas, setVentas] = useState<FilaOperacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setCargando(true); setError('')
    try {
      const [rp, rc, rv] = await Promise.all([fetch(`${API}/productos`), fetch(`${API}/compras`), fetch(`${API}/ventas`)])
      for (const r of [rp, rc, rv]) if (!r.ok) throw new Error(`La API respondió ${r.status}. Verifica que el backend esté activo.`)
      const [dp, dc, dv] = await Promise.all([rp.json(), rc.json(), rv.json()])
      setProductos(Array.isArray(dp) ? dp : []); setCompras(Array.isArray(dc) ? dc : []); setVentas(Array.isArray(dv) ? dv : [])
    } catch (e) { setError(e instanceof Error ? e.message : 'No fue posible cargar los reportes.') }
    finally { setCargando(false) }
  }
  useEffect(() => { void cargar() }, [])

  const resumen = useMemo(() => ({
    inventario: productos.reduce((s,p) => s + Number(p.stock) * Number(p.costo_unitario), 0),
    compras: compras.reduce((s,r) => s + Number(r.total), 0),
    ingresos: ventas.reduce((s,r) => s + Number(r.total), 0),
    utilidad: ventas.reduce((s,r) => s + Number(r.utilidad ?? 0), 0),
    unidades: ventas.reduce((s,r) => s + Number(r.cantidad), 0),
  }), [productos, compras, ventas])

  return <section style={{ display: 'grid', gap: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <div><h2 style={{ margin: '0 0 6px', color: '#23395b' }}>Centro de reportes</h2><p style={{ margin: 0, color: '#718096' }}>Consulta y exporta la información registrada en TecnoStock.</p></div>
      <button className="boton-primario" onClick={() => void cargar()} disabled={cargando}>{cargando ? 'Actualizando…' : '↻ Actualizar datos'}</button>
    </div>
    {error && <p className="mensaje-error">{error}</p>}
    <div className="indicadores">
      <article className="tarjeta"><span>Productos activos</span><strong>{cargando ? '…' : productos.length}</strong><small>Referencias en catálogo</small></article>
      <article className="tarjeta"><span>Valor del inventario</span><strong>{cargando ? '…' : cop(resumen.inventario)}</strong><small>Calculado al costo actual</small></article>
      <article className="tarjeta"><span>Ingresos por ventas</span><strong>{cargando ? '…' : cop(resumen.ingresos)}</strong><small>{resumen.unidades} unidades vendidas</small></article>
      <article className="tarjeta"><span>Utilidad registrada</span><strong>{cargando ? '…' : cop(resumen.utilidad)}</strong><small>Utilidad de ventas registradas</small></article>
    </div>
    <div className="panel">
      <h3>Exportar información</h3>
      <p>Descarga archivos CSV que puedes abrir en Excel para anexarlos como evidencia o analizarlos.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="boton-primario" disabled={cargando} onClick={() => descargarCSV('TecnoStock_productos.csv', [['ID','SKU','Producto','Categoría','Stock','Stock mínimo','Costo unitario','Precio venta'], ...productos.map(p => [p.id,p.sku,p.nombre,p.categoria,p.stock,p.stock_minimo,p.costo_unitario,p.precio_venta])])}>Exportar productos</button>
        <button className="boton-primario" disabled={cargando} onClick={() => descargarCSV('TecnoStock_compras.csv', [['ID','Fecha','Producto','SKU','Proveedor','Cantidad','Total'], ...compras.map(r => [r.id,r.created_at,r.producto,r.sku,r.proveedor,r.cantidad,r.total])])}>Exportar compras</button>
        <button className="boton-primario" disabled={cargando} onClick={() => descargarCSV('TecnoStock_ventas.csv', [['ID','Fecha','Producto','SKU','Cliente','Cantidad','Total','Utilidad'], ...ventas.map(r => [r.id,r.created_at,r.producto,r.sku,r.cliente,r.cantidad,r.total,r.utilidad])])}>Exportar ventas</button>
      </div>
    </div>
    <div className="panel">
      <h3>Resumen de operaciones</h3>
      <div className="tabla-contenedor"><table><thead><tr><th>Indicador</th><th>Resultado</th></tr></thead><tbody>
        <tr><td>Compras registradas</td><td>{compras.length}</td></tr><tr><td>Valor acumulado de compras</td><td>{cop(resumen.compras)}</td></tr><tr><td>Ventas registradas</td><td>{ventas.length}</td></tr><tr><td>Unidades vendidas</td><td>{resumen.unidades}</td></tr><tr><td>Ingresos acumulados</td><td>{cop(resumen.ingresos)}</td></tr><tr><td>Utilidad acumulada</td><td>{cop(resumen.utilidad)}</td></tr>
      </tbody></table></div>
    </div>
  </section>
}
