import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  HardHat,
  Plus,
  Package,
  PackagePlus,
  RefreshCw,
  Trash2,
  X,
  AlertCircle,
  ShieldCheck,
  Boxes
} from 'lucide-react';

export default function EppView() {
  const [activeTab, setActiveTab] = useState('inventario');
  const [inventario, setInventario] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState([]);

  // Modales
  const [isModalEntrega, setIsModalEntrega] = useState(false);
  const [isModalNuevoEpp, setIsModalNuevoEpp] = useState(false);
  const [isModalStock, setIsModalStock] = useState(false);
  const [selectedEpp, setSelectedEpp] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Formularios
  const [formEntrega, setFormEntrega] = useState({
    tipo_epp_id: '',
    trabajador_id: '',
    cantidad: '1',
    motivo: 'Dotación Periódica',
    observaciones: ''
  });

  const [formNuevoEpp, setFormNuevoEpp] = useState({
    nombre: '',
    categoria: 'Protección Craneal',
    stock_actual: 0,
    stock_minimo: 5,
    unidad_medida: 'Unidad',
    costo_unitario: 0.00
  });

  const [formStock, setFormStock] = useState({
    stock_adicional: 10,
    costo_unitario: ''
  });

  const loadData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/epp/inventario')
      .then((res) => res.json())
      .then((d) => d.success && setInventario(d.data))
      .catch((err) => console.error('Error cargando inventario EPP:', err));

    fetch('http://localhost:5000/api/epp/entregas')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setEntregas(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('http://localhost:5000/api/personal/trabajadores')
      .then((res) => res.json())
      .then((d) => d.success && setWorkers(d.data))
      .catch(() => { });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Guardar Acta de Entrega
  const handleSaveEntrega = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('http://localhost:5000/api/epp/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEntrega)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalEntrega(false);
        setFormEntrega({
          tipo_epp_id: '',
          trabajador_id: '',
          cantidad: '1',
          motivo: 'Dotación Periódica',
          observaciones: ''
        });
        loadData();
      } else {
        setFormError(data.message || 'Error registrando entrega.');
      }
    } catch (err) {
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Crear Nuevo Tipo de EPP
  const handleSaveNuevoEpp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('http://localhost:5000/api/epp/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formNuevoEpp)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalNuevoEpp(false);
        setFormNuevoEpp({
          nombre: '',
          categoria: 'Protección Craneal',
          stock_actual: 0,
          stock_minimo: 5,
          unidad_medida: 'Unidad',
          costo_unitario: 0.00
        });
        loadData();
      } else {
        setFormError(data.message || 'Error registrando equipo.');
      }
    } catch (err) {
      setFormError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reabastecer / Ajustar Stock
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedEpp) return;
    setSubmitting(true);
    setFormError('');

    const nuevoStock = Number(selectedEpp.stock_actual) + Number(formStock.stock_adicional);

    try {
      const res = await fetch(`http://localhost:5000/api/epp/inventario/${selectedEpp.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_actual: nuevoStock,
          costo_unitario: formStock.costo_unitario !== '' ? parseFloat(formStock.costo_unitario) : undefined
        })
      });
      const data = await res.json();

      if (data.success) {
        setIsModalStock(false);
        setSelectedEpp(null);
        loadData();
      } else {
        setFormError(data.message || 'Error actualizando stock.');
      }
    } catch (err) {
      setFormError('Error al comunicarse con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar Equipo del Catálogo
  const handleDeleteEpp = async (id, nombre) => {
    if (!window.confirm(`¿Deseas eliminar el equipo "${nombre}" del catálogo?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/epp/inventario/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Error al eliminar.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar.');
    }
  };

  const filteredInventario = inventario.filter((item) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      item.codigo.toLowerCase().includes(t) ||
      item.nombre.toLowerCase().includes(t) ||
      item.categoria.toLowerCase().includes(t)
    );
  });

  const filteredEntregas = entregas.filter((ent) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (ent.trabajador_nombre && ent.trabajador_nombre.toLowerCase().includes(t)) ||
      (ent.epp_nombre && ent.epp_nombre.toLowerCase().includes(t)) ||
      (ent.motivo && ent.motivo.toLowerCase().includes(t))
    );
  });

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header
          title="Control de Equipos de Protección Personal (EPP)"
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {/* Pestañas Superiores */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('inventario')}
            style={{
              padding: '11px 22px',
              borderRadius: '14px',
              border: 'none',
              background: activeTab === 'inventario' ? '#0d5f3d' : '#ffffff',
              color: activeTab === 'inventario' ? '#ffffff' : '#53695c',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'inventario' ? '0 4px 14px rgba(13, 95, 61, 0.25)' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            <Package size={18} />
            <span>Inventario & Stock de EPP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('entregas')}
            style={{
              padding: '11px 22px',
              borderRadius: '14px',
              border: 'none',
              background: activeTab === 'entregas' ? '#0d5f3d' : '#ffffff',
              color: activeTab === 'entregas' ? '#ffffff' : '#53695c',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'entregas' ? '0 4px 14px rgba(13, 95, 61, 0.25)' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            <HardHat size={18} />
            <span>Actas de Entrega a Trabajadores</span>
          </button>
        </div>

        {/* Tab 1: Inventario */}
        {activeTab === 'inventario' && (
          <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="ssoma-table-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#132219' }}>
                  Kardex de Equipos de Protección
                </h2>
                <p style={{ fontSize: '0.76rem', color: '#53695c', margin: '3px 0 0 0' }}>
                  Control de existencias mínimas, costos y certificación de calidad
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setFormError(''); setIsModalNuevoEpp(true); }}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0d5f3d',
                    border: '1.5px solid #0d5f3d',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <PackagePlus size={17} />
                  + Nuevo Tipo de EPP
                </button>

                <button
                  type="button"
                  className="ssoma-btn ssoma-btn-primary"
                  onClick={() => { setFormError(''); setIsModalEntrega(true); }}
                  style={{
                    backgroundColor: '#0d5f3d',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    boxShadow: '0 4px 12px rgba(13, 95, 61, 0.25)'
                  }}
                >
                  <Plus size={17} />
                  + Entregar EPP a Trabajador
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ssoma-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre de Equipo</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Unidad</th>
                    <th>Costo Unitario</th>
                    <th>Estado de Stock</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventario.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#899e92', fontSize: '0.9rem' }}>
                        No hay equipos registrados en el inventario.
                      </td>
                    </tr>
                  ) : (
                    filteredInventario.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 800, color: '#0d5f3d' }}>{item.codigo}</td>
                        <td style={{ fontWeight: 700, color: '#132219' }}>{item.nombre}</td>
                        <td>
                          <span style={{
                            fontSize: '0.78rem',
                            color: '#0d5f3d',
                            background: '#eaf4ef',
                            padding: '3px 9px',
                            borderRadius: '8px',
                            fontWeight: 700
                          }}>
                            {item.categoria}
                          </span>
                        </td>
                        <td style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: item.alerta_stock_bajo ? '#dc2626' : '#132219'
                        }}>
                          {item.stock_actual}
                        </td>
                        <td style={{ color: '#53695c', fontWeight: 600 }}>{item.stock_minimo}</td>
                        <td style={{ color: '#53695c', fontSize: '0.82rem' }}>{item.unidad_medida || 'Unidad'}</td>
                        <td style={{ fontWeight: 800, color: '#c9a227' }}>
                          ${parseFloat(item.costo_unitario || 0).toFixed(2)}
                        </td>
                        <td>
                          {item.alerta_stock_bajo ? (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ⚠️ Stock Bajo
                            </span>
                          ) : (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#eaf4ef',
                              color: '#0d5f3d',
                              border: '1px solid #a3cfbb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ✅ Abastecido
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEpp(item);
                                setFormStock({
                                  stock_adicional: 10,
                                  costo_unitario: item.costo_unitario || ''
                                });
                                setFormError('');
                                setIsModalStock(true);
                              }}
                              style={{
                                background: '#f6f1e8',
                                border: '1px solid #d9c7a3',
                                color: '#8c764e',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Reabastecer o ingresar stock"
                            >
                              <RefreshCw size={13} />
                              Reabastecer
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteEpp(item.id, item.nombre)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Eliminar equipo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Entregas */}
        {activeTab === 'entregas' && (
          <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 className="ssoma-table-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#132219' }}>
                  Historial de Asignaciones y Recambios
                </h2>
                <p style={{ fontSize: '0.76rem', color: '#53695c', margin: '3px 0 0 0' }}>
                  Registro auditable de dotación individual de protección
                </p>
              </div>

              <button
                type="button"
                className="ssoma-btn ssoma-btn-primary"
                onClick={() => { setFormError(''); setIsModalEntrega(true); }}
                style={{ backgroundColor: '#0d5f3d', borderRadius: '12px', padding: '10px 18px' }}
              >
                <Plus size={17} />
                <span>+ Nueva Entrega</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ssoma-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Trabajador Receptor</th>
                    <th>Cargo / Área</th>
                    <th>EPP Entregado</th>
                    <th>Cantidad</th>
                    <th>Motivo</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntregas.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#899e92', fontSize: '0.9rem' }}>
                        No se registran entregas de EPP hasta el momento.
                      </td>
                    </tr>
                  ) : (
                    filteredEntregas.map((ent) => (
                      <tr key={ent.id}>
                        <td style={{ fontSize: '0.82rem', color: '#53695c' }}>{ent.fecha_fmt}</td>
                        <td style={{ fontWeight: 700, color: '#132219' }}>{ent.trabajador_nombre}</td>
                        <td>
                          <div style={{ fontSize: '0.82rem', color: '#132219', fontWeight: 600 }}>{ent.trabajador_cargo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#53695c' }}>{ent.area_nombre || 'General'}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0d5f3d' }}>{ent.epp_nombre}</td>
                        <td style={{ fontWeight: 800, color: '#132219' }}>{ent.cantidad} un.</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: '#f6f1e8',
                            color: '#8c764e',
                            border: '1px solid #d9c7a3'
                          }}>
                            {ent.motivo}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#53695c' }}>{ent.observaciones || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal 1: Nuevo Tipo de EPP */}
        {isModalNuevoEpp && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalNuevoEpp(false)}>
            <div
              className="ssoma-modal"
              style={{ maxWidth: '520px', borderRadius: '20px', border: '1px solid #d9c7a3' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eaf4ef', color: '#0d5f3d', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <PackagePlus size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                      Nuevo Tipo de EPP
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                      Registro en el catálogo maestro de protección
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalNuevoEpp(false)}
                  style={{ background: '#f6f1e8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#53695c' }}
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                  <AlertCircle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveNuevoEpp}>
                <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                  <div>
                    <label className="ssoma-label">Nombre del Equipo *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={formNuevoEpp.nombre}
                      onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, nombre: e.target.value })}
                      placeholder="Ej: Lentes Anti-impacto Oscuros UV 400"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="ssoma-label">Categoría *</label>
                      <select
                        required
                        className="ssoma-select"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formNuevoEpp.categoria}
                        onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, categoria: e.target.value })}
                      >
                        <option value="Protección Craneal">Protección Craneal</option>
                        <option value="Protección Ocular">Protección Ocular</option>
                        <option value="Protección Auditiva">Protección Auditiva</option>
                        <option value="Protección Respiratoria">Protección Respiratoria</option>
                        <option value="Protección Manos">Protección Manos</option>
                        <option value="Protección Pies">Protección Pies</option>
                        <option value="Protección Caídas">Protección Caídas</option>
                        <option value="Ropa de Trabajo">Ropa de Trabajo</option>
                      </select>
                    </div>

                    <div>
                      <label className="ssoma-label">Unidad de Medida</label>
                      <select
                        className="ssoma-select"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formNuevoEpp.unidad_medida}
                        onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, unidad_medida: e.target.value })}
                      >
                        <option value="Unidad">Unidad</option>
                        <option value="Par">Par</option>
                        <option value="Juego">Juego</option>
                        <option value="Caja">Caja</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                      <label className="ssoma-label">Stock Inicial</label>
                      <input
                        type="number"
                        min="0"
                        className="ssoma-input"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formNuevoEpp.stock_actual}
                        onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, stock_actual: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="ssoma-label">Stock Mínimo</label>
                      <input
                        type="number"
                        min="1"
                        className="ssoma-input"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formNuevoEpp.stock_minimo}
                        onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, stock_minimo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="ssoma-label">Costo ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="ssoma-input"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formNuevoEpp.costo_unitario}
                        onChange={(e) => setFormNuevoEpp({ ...formNuevoEpp, costo_unitario: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalNuevoEpp(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ssoma-btn ssoma-btn-primary"
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    {submitting ? 'Guardando...' : 'Crear Equipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Reabastecer Stock */}
        {isModalStock && selectedEpp && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalStock(false)}>
            <div
              className="ssoma-modal"
              style={{ maxWidth: '440px', borderRadius: '20px', border: '1px solid #d9c7a3' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#f6f1e8', color: '#8c764e', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                      Reabastecer Stock
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                      {selectedEpp.codigo} - {selectedEpp.nombre}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalStock(false)}
                  style={{ background: '#f6f1e8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#53695c' }}
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                  <AlertCircle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateStock}>
                <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                  <div style={{ background: '#eaf4ef', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', color: '#0d5f3d', fontWeight: 700 }}>Stock Actual Registrado:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#0d5f3d' }}>{selectedEpp.stock_actual} {selectedEpp.unidad_medida || 'un.'}</strong>
                  </div>

                  <div>
                    <label className="ssoma-label">Cantidad que Ingresa al Almacén *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px', fontSize: '1rem', fontWeight: 700 }}
                      value={formStock.stock_adicional}
                      onChange={(e) => setFormStock({ ...formStock, stock_adicional: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="ssoma-label">Actualizar Costo Unitario ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={formStock.costo_unitario}
                      onChange={(e) => setFormStock({ ...formStock, costo_unitario: e.target.value })}
                      placeholder={selectedEpp.costo_unitario ? `$${selectedEpp.costo_unitario}` : 'Opcional'}
                    />
                  </div>
                </div>

                <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalStock(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ssoma-btn ssoma-btn-primary"
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    {submitting ? 'Actualizando...' : 'Confirmar Ingreso'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Entrega de EPP */}
        {isModalEntrega && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalEntrega(false)}>
            <div
              className="ssoma-modal"
              style={{ maxWidth: '540px', borderRadius: '20px', border: '1px solid #d9c7a3' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eaf4ef', color: '#0d5f3d', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <HardHat size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                      Registrar Entrega de EPP
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                      Generación de acta de conformidad individual
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalEntrega(false)}
                  style={{ background: '#f6f1e8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#53695c' }}
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                  <AlertCircle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEntrega}>
                <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                  <div>
                    <label className="ssoma-label">Trabajador Receptor *</label>
                    <select
                      className="ssoma-select"
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                      value={formEntrega.trabajador_id}
                      onChange={(e) => setFormEntrega({ ...formEntrega, trabajador_id: e.target.value })}
                    >
                      <option value="">Seleccione Trabajador...</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.nombres} {w.apellidos} — {w.cargo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="ssoma-label">Equipo de Protección (EPP) *</label>
                    <select
                      className="ssoma-select"
                      required
                      style={{ width: '100%', marginTop: '4px' }}
                      value={formEntrega.tipo_epp_id}
                      onChange={(e) => setFormEntrega({ ...formEntrega, tipo_epp_id: e.target.value })}
                    >
                      <option value="">Seleccione EPP...</option>
                      {inventario.map((epp) => (
                        <option key={epp.id} value={epp.id} disabled={epp.stock_actual <= 0}>
                          {epp.codigo} - {epp.nombre} (Disponible: {epp.stock_actual} {epp.unidad_medida}) {epp.stock_actual <= 0 ? '[SIN STOCK]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="ssoma-label">Cantidad a Entregar *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="ssoma-input"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formEntrega.cantidad}
                        onChange={(e) => setFormEntrega({ ...formEntrega, cantidad: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="ssoma-label">Motivo de Entrega</label>
                      <select
                        className="ssoma-select"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={formEntrega.motivo}
                        onChange={(e) => setFormEntrega({ ...formEntrega, motivo: e.target.value })}
                      >
                        <option value="Dotación Inicial">Dotación Inicial</option>
                        <option value="Dotación Periódica">Dotación Periódica</option>
                        <option value="Renovación por Deterioro">Renovación por Deterioro</option>
                        <option value="Pérdida / Extravío">Pérdida / Extravío</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="ssoma-label">Observaciones / Talla / N° Serie</label>
                    <input
                      type="text"
                      placeholder="Ej. Talla 42, color blanco, homologado ANSI Z87.1"
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={formEntrega.observaciones}
                      onChange={(e) => setFormEntrega({ ...formEntrega, observaciones: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalEntrega(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ssoma-btn ssoma-btn-primary"
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    {submitting ? 'Registrando...' : 'Registrar Entrega'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}





















// import React, { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import { HardHat, Plus, AlertCircle, CheckCircle2, Shield, Package, ArrowUpRight } from 'lucide-react';

// export default function EppView() {
//   const [activeTab, setActiveTab] = useState('inventario');
//   const [inventario, setInventario] = useState([]);
//   const [entregas, setEntregas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isModalEntrega, setIsModalEntrega] = useState(false);
//   const [workers, setWorkers] = useState([]);

//   const [formEntrega, setFormEntrega] = useState({
//     tipo_epp_id: '',
//     trabajador_id: '',
//     cantidad: '1',
//     motivo: 'Dotación Periódica',
//     observaciones: ''
//   });

//   const loadData = () => {
//     setLoading(true);
//     fetch('http://localhost:5000/api/epp/inventario')
//       .then((res) => res.json())
//       .then((d) => d.success && setInventario(d.data));

//     fetch('http://localhost:5000/api/epp/entregas')
//       .then((res) => res.json())
//       .then((d) => {
//         if (d.success) setEntregas(d.data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));

//     fetch('http://localhost:5000/api/personal/trabajadores').then((res) => res.json()).then((d) => d.success && setWorkers(d.data));
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleSaveEntrega = async (e) => {
//     e.preventDefault();
//     await fetch('http://localhost:5000/api/epp/entregas', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formEntrega)
//     });
//     setIsModalEntrega(false);
//     loadData();
//   };

//   return (
//     <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
//       <main className="ssoma-main-panel" style={{ width: '100%' }}>
//         <Header title="Control de Equipos de Protección Personal (EPP)" searchTerm={searchTerm} onSearch={setSearchTerm} />

//         <div style={{ display: 'flex', gap: '12px' }}>
//           <button
//             onClick={() => setActiveTab('inventario')}
//             style={{
//               padding: '10px 20px',
//               borderRadius: '12px',
//               border: 'none',
//               background: activeTab === 'inventario' ? '#10b981' : '#ffffff',
//               color: activeTab === 'inventario' ? '#ffffff' : '#64748b',
//               fontWeight: 700,
//               fontSize: '0.88rem',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px',
//               boxShadow: 'var(--shadow-sm)'
//             }}
//           >
//             <Package size={18} />
//             <span>Inventario & Stock de EPP</span>
//           </button>

//           <button
//             onClick={() => setActiveTab('entregas')}
//             style={{
//               padding: '10px 20px',
//               borderRadius: '12px',
//               border: 'none',
//               background: activeTab === 'entregas' ? '#10b981' : '#ffffff',
//               color: activeTab === 'entregas' ? '#ffffff' : '#64748b',
//               fontWeight: 700,
//               fontSize: '0.88rem',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px',
//               boxShadow: 'var(--shadow-sm)'
//             }}
//           >
//             <HardHat size={18} />
//             <span>Actas de Entrega a Trabajadores</span>
//           </button>
//         </div>

//         {activeTab === 'inventario' && (
//           <div className="ssoma-table-card">
//             <div className="ssoma-table-header">
//               <div>
//                 <h2 className="ssoma-table-title">Kardex de Equipos de Protección</h2>
//                 <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
//                   Control de existencias mínimas y certificación de calidad
//                 </p>
//               </div>
//               <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalEntrega(true)}>
//                 <Plus size={18} />
//                 <span>+ Entregar EPP a Trabajador</span>
//               </button>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//               <table className="ssoma-table">
//                 <thead>
//                   <tr>
//                     <th>Código</th>
//                     <th>Nombre de Equipo</th>
//                     <th>Categoría</th>
//                     <th>Stock Actual</th>
//                     <th>Stock Mínimo</th>
//                     <th>Unidad</th>
//                     <th>Costo Unitario</th>
//                     <th>Estado de Stock</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {inventario.map((item) => (
//                     <tr key={item.id}>
//                       <td style={{ fontWeight: 800, color: '#334155' }}>{item.codigo}</td>
//                       <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.nombre}</td>
//                       <td style={{ fontSize: '0.8rem', color: '#4338ca', fontWeight: 600 }}>{item.categoria}</td>
//                       <td style={{ fontSize: '1.1rem', fontWeight: 800, color: item.alerta_stock_bajo ? '#ef4444' : '#0f172a' }}>
//                         {item.stock_actual}
//                       </td>
//                       <td style={{ color: '#64748b', fontWeight: 600 }}>{item.stock_minimo}</td>
//                       <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.unidad_medida}</td>
//                       <td style={{ fontWeight: 700, color: '#059669' }}>${parseFloat(item.costo_unitario || 0).toFixed(2)}</td>
//                       <td>
//                         {item.alerta_stock_bajo ? (
//                           <span style={{
//                             padding: '3px 8px',
//                             borderRadius: '8px',
//                             fontSize: '0.72rem',
//                             fontWeight: 700,
//                             background: '#fee2e2',
//                             color: '#b91c1c',
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             gap: '4px'
//                           }}>
//                             ⚠️ Stock Bajo
//                           </span>
//                         ) : (
//                           <span style={{
//                             padding: '3px 8px',
//                             borderRadius: '8px',
//                             fontSize: '0.72rem',
//                             fontWeight: 700,
//                             background: '#dcfce7',
//                             color: '#15803d'
//                           }}>
//                             ✅ Abastecido
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {activeTab === 'entregas' && (
//           <div className="ssoma-table-card">
//             <div className="ssoma-table-header">
//               <h2 className="ssoma-table-title">Historial de Asignaciones y Recambios</h2>
//               <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalEntrega(true)}>
//                 <Plus size={18} />
//                 <span>+ Nueva Entrega</span>
//               </button>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//               <table className="ssoma-table">
//                 <thead>
//                   <tr>
//                     <th>Fecha</th>
//                     <th>Trabajador Receptor</th>
//                     <th>Cargo / Área</th>
//                     <th>EPP Entregado</th>
//                     <th>Cantidad</th>
//                     <th>Motivo</th>
//                     <th>Observaciones</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {entregas.map((ent) => (
//                     <tr key={ent.id}>
//                       <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{ent.fecha_fmt}</td>
//                       <td style={{ fontWeight: 700, color: '#0f172a' }}>{ent.trabajador_nombre}</td>
//                       <td>
//                         <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{ent.trabajador_cargo}</div>
//                         <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{ent.area_nombre || 'General'}</div>
//                       </td>
//                       <td style={{ fontWeight: 700, color: '#4338ca' }}>{ent.epp_nombre}</td>
//                       <td style={{ fontWeight: 800, color: '#0f172a' }}>{ent.cantidad} un.</td>
//                       <td>
//                         <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
//                           {ent.motivo}
//                         </span>
//                       </td>
//                       <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{ent.observaciones || '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Modal Entrega */}
//         {isModalEntrega && (
//           <div className="ssoma-modal-overlay" onClick={() => setIsModalEntrega(false)}>
//             <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
//               <div className="ssoma-modal-header">
//                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registrar Entrega de EPP</h3>
//                 <button onClick={() => setIsModalEntrega(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
//               </div>
//               <form onSubmit={handleSaveEntrega}>
//                 <div className="ssoma-modal-body">
//                   <div className="ssoma-form-grid">
//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Trabajador Receptor</label>
//                       <select
//                         className="ssoma-select"
//                         required
//                         value={formEntrega.trabajador_id}
//                         onChange={(e) => setFormEntrega({ ...formEntrega, trabajador_id: e.target.value })}
//                       >
//                         <option value="">Seleccione Trabajador...</option>
//                         {workers.map((w) => (
//                           <option key={w.id} value={w.id}>{w.nombres} {w.apellidos} - {w.cargo}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Equipo de Protección (EPP)</label>
//                       <select
//                         className="ssoma-select"
//                         required
//                         value={formEntrega.tipo_epp_id}
//                         onChange={(e) => setFormEntrega({ ...formEntrega, tipo_epp_id: e.target.value })}
//                       >
//                         <option value="">Seleccione EPP...</option>
//                         {inventario.map((epp) => (
//                           <option key={epp.id} value={epp.id}>
//                             {epp.nombre} (Stock: {epp.stock_actual})
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Cantidad a Entregar</label>
//                       <input
//                         type="number"
//                         min="1"
//                         required
//                         className="ssoma-input"
//                         value={formEntrega.cantidad}
//                         onChange={(e) => setFormEntrega({ ...formEntrega, cantidad: e.target.value })}
//                       />
//                     </div>

//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Motivo de la Entrega</label>
//                       <select
//                         className="ssoma-select"
//                         value={formEntrega.motivo}
//                         onChange={(e) => setFormEntrega({ ...formEntrega, motivo: e.target.value })}
//                       >
//                         <option value="Dotación Inicial">Dotación Inicial</option>
//                         <option value="Dotación Periódica">Dotación Periódica</option>
//                         <option value="Renovación por Deterioro">Renovación por Deterioro</option>
//                         <option value="Pérdida / Extravío">Pérdida / Extravío</option>
//                       </select>
//                     </div>

//                     <div className="ssoma-form-group full">
//                       <label className="ssoma-label">Observaciones</label>
//                       <input
//                         type="text"
//                         placeholder="Ej. Talla, color, serie del equipo..."
//                         className="ssoma-input"
//                         value={formEntrega.observaciones}
//                         onChange={(e) => setFormEntrega({ ...formEntrega, observaciones: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="ssoma-modal-footer">
//                   <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalEntrega(false)}>Cancelar</button>
//                   <button type="submit" className="ssoma-btn ssoma-btn-primary">Registrar Entrega</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
