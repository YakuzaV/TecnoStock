
import { useEffect, useState } from 'react';

type Producto = {
  id: number;
  sku: string;
  nombre: string;
  stock: number;
  costo_unitario: number | string;
  precio_venta: number | string;
  categoria?: string;
};

type Registro = {
  id: number;
  producto_id?: number;
  producto?: string;
  sku?: string;
  proveedor?: string;
  cliente?: string;
  cantidad: number;
  total: number | string;
  utilidad?: number | string;
  created_at?: string;
};

const API = 'http://localhost:3000/api';

const dinero = (valor: number | string | undefined) =>
  '$ ' + Number(valor || 0).toLocaleString('es-CO', {
    maximumFractionDigits: 0,
  });

export default function Operaciones() {
  const [tipo, setTipo] = useState<'compra' | 'venta'>('compra');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [productoId, setProductoId] = useState('');
  const [tercero, setTercero] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [valorUnitario, setValorUnitario] = useState('');
  const [observacion, setObservacion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const productoSeleccionado = productos.find(
    p => String(p.id) === productoId
  );

  async function cargarProductos() {
    const res = await fetch(`${API}/productos`);
    if (!res.ok) throw new Error('No se pudieron cargar los productos');
    const data = await res.json();
    setProductos(Array.isArray(data) ? data : []);
  }

  async function cargarRegistros() {
    const endpoint = tipo === 'compra' ? 'compras' : 'ventas';
    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) throw new Error('No se pudo cargar el historial');
    const data = await res.json();
    setRegistros(Array.isArray(data) ? data : data ? [data] : []);
  }

  useEffect(() => {
    cargarProductos().catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    cargarRegistros().catch(e => setError(e.message));
  }, [tipo]);

  useEffect(() => {
    if (!productoSeleccionado) {
      setValorUnitario('');
      return;
    }

    setValorUnitario(
      String(
        tipo === 'compra'
          ? productoSeleccionado.costo_unitario
          : productoSeleccionado.precio_venta
      )
    );
  }, [productoId, tipo, productos]);

  async function guardarOperacion(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!productoId) {
      setError('Selecciona un producto.');
      return;
    }

    if (!tercero.trim()) {
      setError(tipo === 'compra' ? 'Ingresa el proveedor.' : 'Ingresa el cliente.');
      return;
    }

    if (Number(cantidad) <= 0 || Number(valorUnitario) <= 0) {
      setError('Cantidad y valor deben ser mayores que cero.');
      return;
    }

    if (
      tipo === 'venta' &&
      productoSeleccionado &&
      Number(cantidad) > productoSeleccionado.stock
    ) {
      setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
      return;
    }

    setCargando(true);

    try {
      const endpoint = tipo === 'compra' ? 'compras' : 'ventas';

      const body =
        tipo === 'compra'
          ? {
                producto_id: Number(productoId),
                proveedor: tercero,
                cantidad: Number(cantidad),
                costo_unitario: Number(valorUnitario),
                observacion,
              }
          : {
                producto_id: Number(productoId),
                cliente: tercero,
                cantidad: Number(cantidad),
                precio_unitario: Number(valorUnitario),
              };

      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || data.error || 'Error al registrar');
      }

      setMensaje(
        tipo === 'compra'
          ? '¡Compra registrada y stock actualizado!'
          : '¡Venta registrada y stock descontado!'
      );

      setTercero('');
      setCantidad('1');
      setObservacion('');

      await cargarProductos();
      await cargarRegistros();
    } catch (e: any) {
      setError(e.message || 'Error inesperado');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1e3557' }}>Compras y Ventas</h1>
        <p style={{ color: '#718096', marginTop: 8 }}>
          Gestiona entradas, salidas y operaciones de tu inventario.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        <button onClick={() => setTipo('compra')} style={{
          padding: '12px 24px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: tipo === 'compra' ? '#3978d5' : '#e8edf5',
          color: tipo === 'compra' ? '#fff' : '#334155',
          fontWeight: 600
        }}>
          🛒 Registrar compra
        </button>

        <button onClick={() => setTipo('venta')} style={{
          padding: '12px 24px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: tipo === 'venta' ? '#3978d5' : '#e8edf5',
          color: tipo === 'venta' ? '#fff' : '#334155',
          fontWeight: 600
        }}>
          💰 Registrar venta
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)',
        gap: 24
      }}>
        <section style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ marginTop: 0, color: '#23395b' }}>
            {tipo === 'compra' ? 'Nueva compra' : 'Nueva venta'}
          </h2>

          {mensaje && <p style={{ color: '#16834b', background: '#e9f8ef', padding: 12, borderRadius: 8 }}>{mensaje}</p>}
          {error && <p style={{ color: '#b42318', background: '#fff0ef', padding: 12, borderRadius: 8 }}>{error}</p>}

          <form onSubmit={guardarOperacion}>
            <label style={label}>Producto</label>
            <select
              value={productoId}
              onChange={e => setProductoId(e.target.value)}
              style={campo}
              required
            >
              <option value="">Selecciona un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>

            {productoSeleccionado && (
              <div style={{
                background: '#f5f8fc',
                padding: 12,
                borderRadius: 8,
                margin: '12px 0',
                color: '#52647d',
                fontSize: 14
              }}>
                <div>Stock disponible: <strong>{productoSeleccionado.stock}</strong></div>
                <div>Costo actual: <strong>{dinero(productoSeleccionado.costo_unitario)}</strong></div>
                <div>Precio de venta: <strong>{dinero(productoSeleccionado.precio_venta)}</strong></div>
              </div>
            )}

            <label style={label}>
              {tipo === 'compra' ? 'Proveedor' : 'Cliente'}
            </label>
            <input
              value={tercero}
              onChange={e => setTercero(e.target.value)}
              style={campo}
              placeholder={tipo === 'compra' ? 'Nombre del proveedor' : 'Nombre del cliente'}
              required
            />

            <label style={label}>Cantidad</label>
            <input
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              style={campo}
              required
            />

            <label style={label}>
              {tipo === 'compra' ? 'Costo unitario' : 'Precio unitario de venta'}
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={valorUnitario}
              onChange={e => setValorUnitario(e.target.value)}
              style={campo}
              required
            />

            {tipo === 'compra' && (
              <>
                <label style={label}>Observación (opcional)</label>
                <textarea
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  style={{ ...campo, minHeight: 75, resize: 'vertical' }}
                  placeholder="Notas de la compra..."
                />
              </>
            )}

            <div style={{
              background: '#f2f6fc',
              borderRadius: 10,
              padding: 16,
              margin: '16px 0',
              color: '#23395b'
            }}>
              <div>Total de la operación</div>
              <strong style={{ fontSize: 24 }}>
                {dinero(Number(cantidad) * Number(valorUnitario))}
              </strong>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: 14,
                border: 0,
                borderRadius: 10,
                background: cargando ? '#8caad3' : '#3978d5',
                color: '#fff',
                fontWeight: 700,
                cursor: cargando ? 'wait' : 'pointer'
              }}
            >
              {cargando ? 'Procesando...' : tipo === 'compra' ? 'Registrar compra' : 'Registrar venta'}
            </button>
          </form>
        </section>

        <section style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflowX: 'auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#23395b' }}>
            Historial de {tipo === 'compra' ? 'compras' : 'ventas'}
          </h2>

          {registros.length === 0 ? (
            <p style={{ color: '#718096' }}>No hay registros para mostrar.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f8fc', textAlign: 'left' }}>
                  <th style={th}>Fecha</th>
                  <th style={th}>Producto</th>
                  <th style={th}>Cantidad</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td style={td}>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString('es-CO')
                        : '—'}
                    </td>
                    <td style={td}>{r.producto || r.sku || `Producto #${r.producto_id}`}</td>
                    <td style={td}>{r.cantidad}</td>
                    <td style={td}>{dinero(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  display: 'block',
  marginTop: 14,
  marginBottom: 6,
  fontWeight: 600,
  color: '#344b68',
  fontSize: 14
};

const campo: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 8,
  border: '1px solid #d9e2ee',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#23395b',
  fontSize: 14
};

const th: React.CSSProperties = {
  padding: 10,
  whiteSpace: 'nowrap'
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: '1px solid #edf1f5',
  whiteSpace: 'nowrap'
};
