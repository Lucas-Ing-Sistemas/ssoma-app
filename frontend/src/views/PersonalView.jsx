import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  Building2,
  UserPlus,
  FolderPlus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function PersonalView() {
  const [workers, setWorkers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Control de Modales
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Formularios
  const [workerForm, setWorkerForm] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    cargo: '',
    area_id: '',
    telefono: '',
    email: '',
    aptitud_medica: 'Apto'
  });

  const [areaForm, setAreaForm] = useState({
    nombre: '',
    codigo: '',
    responsable: ''
  });

  const loadData = () => {
    fetch('https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores')
      .then((res) => res.json())
      .then((d) => d.success && setWorkers(d.data))
      .catch((err) => console.error('Error cargando trabajadores:', err));

    fetch('https://ssoma-app-fbwe.onrender.com/api/personal/areas')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setAreas(d.data);
        setLoading(false);
      })
      .catch((err) => console.error('Error cargando áreas:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Registrar Trabajador
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerForm)
      });
      const data = await res.json();

      if (data.success) {
        setIsWorkerModalOpen(false);
        setWorkerForm({
          dni: '',
          nombres: '',
          apellidos: '',
          cargo: '',
          area_id: '',
          telefono: '',
          email: '',
          aptitud_medica: 'Apto'
        });
        loadData();
      } else {
        setFormError(data.message || 'Error al registrar trabajador.');
      }
    } catch (err) {
      setFormError('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Registrar Área Operativa
  const handleCreateArea = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/personal/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(areaForm)
      });
      const data = await res.json();

      if (data.success) {
        setIsAreaModalOpen(false);
        setAreaForm({ nombre: '', codigo: '', responsable: '' });
        loadData();
      } else {
        setFormError(data.message || 'Error al crear área.');
      }
    } catch (err) {
      setFormError('No se pudo conectar con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar Trabajador
  const handleDeleteWorker = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al colaborador ${nombre}?`)) return;

    try {
      const res = await fetch(`https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Error al eliminar trabajador.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar trabajador.');
    }
  };

  // Eliminar Área Operativa
  const handleDeleteArea = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el área "${nombre}"?`)) return;

    try {
      const res = await fetch(`https://ssoma-app-fbwe.onrender.com/api/personal/areas/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Error al eliminar área.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar el área.');
    }
  };

  const filteredWorkers = workers.filter((w) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      (w.nombres && w.nombres.toLowerCase().includes(t)) ||
      (w.apellidos && w.apellidos.toLowerCase().includes(t)) ||
      (w.cargo && w.cargo.toLowerCase().includes(t)) ||
      (w.dni && w.dni.includes(t)) ||
      (w.area_nombre && w.area_nombre.toLowerCase().includes(t))
    );
  });

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header
          title="Directorio de Personal & Áreas Operativas"
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {/* Sección: Áreas Operativas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#132219', margin: 0 }}>
                Áreas Operativas de la Empresa
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                Dependencias registradas para inspecciones y matriz IPERC
              </span>
            </div>

            <button
              type="button"
              onClick={() => { setFormError(''); setIsAreaModalOpen(true); }}
              style={{
                backgroundColor: '#ffffff',
                color: '#0d5f3d',
                border: '1.5px solid #0d5f3d',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(13, 95, 61, 0.08)'
              }}
            >
              <FolderPlus size={16} />
              + Nueva Área
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {areas.map((a) => (
              <div key={a.id} style={{
                background: '#ffffff',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid #e5ece7',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#0d5f3d'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d5f3d' }}>
                    <Building2 size={18} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {a.codigo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteArea(a.id, a.nombre)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px'
                    }}
                    title="Eliminar área"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#132219' }}>{a.nombre}</h4>
                <p style={{ fontSize: '0.78rem', color: '#53695c', marginTop: '2px' }}>
                  Líder: {a.responsable || 'No asignado'}
                </p>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#899e92', fontWeight: 600 }}>
                  <span>👥 {a.total_trabajadores} colaboradores</span>
                  <span style={{ color: a.total_incidentes > 0 ? '#dc2626' : '#899e92' }}>
                    ⚠️ {a.total_incidentes} eventos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección: Directorio de Trabajadores */}
        <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '18px', marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="ssoma-table-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#132219' }}>
                Personal Registrado con Inducción SSOMA
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                Padrón oficial de trabajadores, exámenes médicos y áreas de trabajo
              </span>
            </div>

            <button
              type="button"
              onClick={() => { setFormError(''); setIsWorkerModalOpen(true); }}
              style={{
                backgroundColor: '#0d5f3d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 95, 61, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <UserPlus size={17} />
              + Registrar Trabajador
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ssoma-table">
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Colaborador</th>
                  <th>Cargo Operativo</th>
                  <th>Área Asignada</th>
                  <th>Contacto</th>
                  <th>Fecha Ingreso</th>
                  <th>Aptitud Médica</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#899e92', fontSize: '0.9rem' }}>
                      No se encontraron colaboradores registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 800, color: '#0d5f3d' }}>{w.dni}</td>
                      <td>
                        <div className="ssoma-worker-cell">
                          <img
                            src={w.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={w.nombres}
                            className="ssoma-worker-avatar"
                            style={{ border: '1.5px solid #d9c7a3' }}
                          />
                          <div>
                            <div className="ssoma-worker-name">{w.nombres} {w.apellidos}</div>
                            <div className="ssoma-worker-sub">{w.email || 'Sin correo registrado'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#132219' }}>{w.cargo}</td>
                      <td>
                        <span style={{
                          color: '#0d5f3d',
                          background: '#eaf4ef',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}>
                          {w.area_nombre || 'General'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#53695c' }}>{w.telefono || '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: '#53695c' }}>{w.fecha_ingreso_fmt || '—'}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: w.aptitud_medica === 'No Apto' ? '#fef2f2' : (w.aptitud_medica?.includes('Restricciones') ? '#fbf6e8' : '#eaf4ef'),
                          color: w.aptitud_medica === 'No Apto' ? '#dc2626' : (w.aptitud_medica?.includes('Restricciones') ? '#c9a227' : '#0d5f3d'),
                          border: `1px solid ${w.aptitud_medica === 'No Apto' ? '#fecaca' : (w.aptitud_medica?.includes('Restricciones') ? '#d9c7a3' : '#a3cfbb')}`
                        }}>
                          {w.aptitud_medica === 'No Apto' ? '✕ ' : '✓ '} {w.aptitud_medica || 'Apto'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorker(w.id, `${w.nombres} ${w.apellidos}`)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            padding: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title="Eliminar colaborador"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal 1: Registrar Área Operativa */}
      {isAreaModalOpen && (
        <div className="ssoma-modal-overlay" onClick={() => setIsAreaModalOpen(false)}>
          <div
            className="ssoma-modal"
            style={{
              maxWidth: '480px',
              borderRadius: '20px',
              border: '1px solid #d9c7a3',
              boxShadow: '0 25px 50px -12px rgba(13, 95, 61, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: '#eaf4ef',
                  color: '#0d5f3d',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex'
                }}>
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                    Nueva Área Operativa
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                    Sectorización de centros de trabajo
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAreaModalOpen(false)}
                style={{
                  background: '#f6f1e8',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#53695c'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{
                margin: '14px 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateArea}>
              <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                <div>
                  <label className="ssoma-label">Nombre del Área *</label>
                  <input
                    type="text"
                    required
                    className="ssoma-input"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={areaForm.nombre}
                    onChange={(e) => setAreaForm({ ...areaForm, nombre: e.target.value })}
                    placeholder="Ej: Calderería y Soldadura"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="ssoma-label">Código del Área *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={areaForm.codigo}
                      onChange={(e) => setAreaForm({ ...areaForm, codigo: e.target.value })}
                      placeholder="Ej: AR-SOLD"
                    />
                  </div>
                  <div>
                    <label className="ssoma-label">Líder / Responsable</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={areaForm.responsable}
                      onChange={(e) => setAreaForm({ ...areaForm, responsable: e.target.value })}
                      placeholder="Ej: Ing. Marco Díaz"
                    />
                  </div>
                </div>
              </div>

              <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                <button
                  type="button"
                  className="ssoma-btn ssoma-btn-secondary"
                  onClick={() => setIsAreaModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ssoma-btn ssoma-btn-primary"
                  style={{ backgroundColor: '#0d5f3d', opacity: submitting ? 0.75 : 1 }}
                >
                  {submitting ? 'Guardando...' : 'Crear Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Registrar Colaborador */}
      {isWorkerModalOpen && (
        <div className="ssoma-modal-overlay" onClick={() => setIsWorkerModalOpen(false)}>
          <div
            className="ssoma-modal"
            style={{
              maxWidth: '560px',
              borderRadius: '20px',
              border: '1px solid #d9c7a3',
              boxShadow: '0 25px 50px -12px rgba(13, 95, 61, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: '#eaf4ef',
                  color: '#0d5f3d',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex'
                }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                    Registrar Nuevo Trabajador
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                    Ingreso al padrón y asignación de área operativa
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                style={{
                  background: '#f6f1e8',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#53695c'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{
                margin: '14px 24px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorker}>
              <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="ssoma-label">DNI / Documento *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.dni}
                      onChange={(e) => setWorkerForm({ ...workerForm, dni: e.target.value })}
                      placeholder="Ej: 72489123"
                    />
                  </div>
                  <div>
                    <label className="ssoma-label">Área Asignada *</label>
                    <select
                      required
                      className="ssoma-select"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.area_id}
                      onChange={(e) => setWorkerForm({ ...workerForm, area_id: e.target.value })}
                    >
                      <option value="">Seleccione área</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="ssoma-label">Nombres *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.nombres}
                      onChange={(e) => setWorkerForm({ ...workerForm, nombres: e.target.value })}
                      placeholder="Ej: Carlos Alberto"
                    />
                  </div>
                  <div>
                    <label className="ssoma-label">Apellidos *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.apellidos}
                      onChange={(e) => setWorkerForm({ ...workerForm, apellidos: e.target.value })}
                      placeholder="Ej: Mendoza Ramos"
                    />
                  </div>
                </div>

                <div>
                  <label className="ssoma-label">Cargo Operativo *</label>
                  <input
                    type="text"
                    required
                    className="ssoma-input"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={workerForm.cargo}
                    onChange={(e) => setWorkerForm({ ...workerForm, cargo: e.target.value })}
                    placeholder="Ej: Supervisor de Planta / Operador"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="ssoma-label">Teléfono de Contacto</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.telefono}
                      onChange={(e) => setWorkerForm({ ...workerForm, telefono: e.target.value })}
                      placeholder="987654321"
                    />
                  </div>
                  <div>
                    <label className="ssoma-label">Aptitud Médica</label>
                    <select
                      className="ssoma-select"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={workerForm.aptitud_medica}
                      onChange={(e) => setWorkerForm({ ...workerForm, aptitud_medica: e.target.value })}
                    >
                      <option value="Apto">Apto Médico</option>
                      <option value="Apto con Restricciones">Apto con Restricciones</option>
                      <option value="No Apto">No Apto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="ssoma-label">Correo Electrónico Institucional</label>
                  <input
                    type="email"
                    className="ssoma-input"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={workerForm.email}
                    onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                    placeholder="trabajador@empresa.com"
                  />
                </div>
              </div>

              <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                <button
                  type="button"
                  className="ssoma-btn ssoma-btn-secondary"
                  onClick={() => setIsWorkerModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ssoma-btn ssoma-btn-primary"
                  style={{ backgroundColor: '#0d5f3d', opacity: submitting ? 0.75 : 1 }}
                >
                  {submitting ? 'Guardando...' : 'Guardar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


















// import React, { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import { Users, Building2, Phone, Mail, CheckCircle2, UserPlus, X, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

// export default function PersonalView() {
//   const [workers, setWorkers] = useState([]);
//   const [areas, setAreas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Estados para Modal de Registro
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [formError, setFormError] = useState('');
//   const [formData, setFormData] = useState({
//     dni: '',
//     nombres: '',
//     apellidos: '',
//     cargo: '',
//     area_id: '',
//     telefono: '',
//     email: '',
//     aptitud_medica: 'Apto'
//   });

//   const loadData = () => {
//     fetch('https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores')
//       .then((res) => res.json())
//       .then((d) => d.success && setWorkers(d.data))
//       .catch((err) => console.error('Error cargando trabajadores:', err));

//     fetch('https://ssoma-app-fbwe.onrender.com/api/personal/areas')
//       .then((res) => res.json())
//       .then((d) => {
//         if (d.success) setAreas(d.data);
//         setLoading(false);
//       })
//       .catch((err) => console.error('Error cargando áreas:', err));
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const handleCreateWorker = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setFormError('');

//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();

//       if (data.success) {
//         setIsModalOpen(false);
//         setFormData({
//           dni: '',
//           nombres: '',
//           apellidos: '',
//           cargo: '',
//           area_id: '',
//           telefono: '',
//           email: '',
//           aptitud_medica: 'Apto'
//         });
//         loadData();
//       } else {
//         setFormError(data.message || 'Error al registrar trabajador.');
//       }
//     } catch (err) {
//       setFormError('No se pudo conectar con el servidor.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteWorker = async (id, nombre) => {
//     if (!window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) return;

//     try {
//       const res = await fetch(`https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores/${id}`, {
//         method: 'DELETE'
//       });
//       const data = await res.json();
//       if (data.success) {
//         loadData();
//       } else {
//         alert(data.message || 'Error al eliminar trabajador.');
//       }
//     } catch (err) {
//       alert('Error de conexión al eliminar.');
//     }
//   };

//   const filteredWorkers = workers.filter((w) => {
//     if (!searchTerm) return true;
//     const t = searchTerm.toLowerCase();
//     return (
//       (w.nombres && w.nombres.toLowerCase().includes(t)) ||
//       (w.apellidos && w.apellidos.toLowerCase().includes(t)) ||
//       (w.cargo && w.cargo.toLowerCase().includes(t)) ||
//       (w.dni && w.dni.includes(t)) ||
//       (w.area_nombre && w.area_nombre.toLowerCase().includes(t))
//     );
//   });

//   return (
//     <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
//       <main className="ssoma-main-panel" style={{ width: '100%' }}>
//         <Header
//           title="Directorio de Personal & Áreas Operativas"
//           searchTerm={searchTerm}
//           onSearch={setSearchTerm}
//         />

//         {/* Áreas Resumen en Acentos Verde y Oro */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
//           {areas.map((a) => (
//             <div key={a.id} style={{
//               background: '#ffffff',
//               padding: '16px 20px',
//               borderRadius: '16px',
//               border: '1px solid #e5ece7',
//               boxShadow: 'var(--shadow-sm)',
//               position: 'relative',
//               overflow: 'hidden'
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: '3px',
//                 background: '#0d5f3d'
//               }} />
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d5f3d', marginBottom: '6px' }}>
//                 <Building2 size={18} />
//                 <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                   {a.codigo}
//                 </span>
//               </div>
//               <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#132219' }}>{a.nombre}</h4>
//               <p style={{ fontSize: '0.78rem', color: '#53695c', marginTop: '2px' }}>Líder: {a.responsable || 'No asignado'}</p>
//               <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#899e92', fontWeight: 600 }}>
//                 <span>👥 {a.total_trabajadores} colaboradores</span>
//                 <span style={{ color: a.total_incidentes > 0 ? '#dc2626' : '#899e92' }}>
//                   ⚠️ {a.total_incidentes} eventos
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Directorio de Trabajadores */}
//         <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '18px' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
//             <div>
//               <h2 className="ssoma-table-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#132219' }}>
//                 Personal Registrado con Inducción SSOMA
//               </h2>
//               <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
//                 Padrón oficial de trabajadores y aptitudes ocupacionales
//               </span>
//             </div>

//             <button
//               type="button"
//               onClick={() => setIsModalOpen(true)}
//               style={{
//                 backgroundColor: '#0d5f3d',
//                 color: '#ffffff',
//                 border: 'none',
//                 borderRadius: '12px',
//                 padding: '10px 18px',
//                 fontSize: '0.85rem',
//                 fontWeight: 700,
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 cursor: 'pointer',
//                 boxShadow: '0 4px 12px rgba(13, 95, 61, 0.25)',
//                 transition: 'all 0.2s'
//               }}
//             >
//               <UserPlus size={17} />
//               + Registrar Trabajador
//             </button>
//           </div>

//           <div style={{ overflowX: 'auto' }}>
//             <table className="ssoma-table">
//               <thead>
//                 <tr>
//                   <th>DNI</th>
//                   <th>Colaborador</th>
//                   <th>Cargo Operativo</th>
//                   <th>Área Asignada</th>
//                   <th>Contacto</th>
//                   <th>Fecha Ingreso</th>
//                   <th>Aptitud Médica</th>
//                   <th style={{ textAlign: 'center' }}>Acciones</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredWorkers.length === 0 ? (
//                   <tr>
//                     <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#899e92', fontSize: '0.9rem' }}>
//                       No se encontraron colaboradores registrados en el sistema.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredWorkers.map((w) => (
//                     <tr key={w.id}>
//                       <td style={{ fontWeight: 800, color: '#0d5f3d' }}>{w.dni}</td>
//                       <td>
//                         <div className="ssoma-worker-cell">
//                           <img
//                             src={w.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
//                             alt={w.nombres}
//                             className="ssoma-worker-avatar"
//                             style={{ border: '1.5px solid #d9c7a3' }}
//                           />
//                           <div>
//                             <div className="ssoma-worker-name">{w.nombres} {w.apellidos}</div>
//                             <div className="ssoma-worker-sub">{w.email || 'Sin correo registrado'}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={{ fontWeight: 600, color: '#132219' }}>{w.cargo}</td>
//                       <td>
//                         <span style={{
//                           color: '#0d5f3d',
//                           background: '#eaf4ef',
//                           padding: '4px 10px',
//                           borderRadius: '8px',
//                           fontSize: '0.76rem',
//                           fontWeight: 700
//                         }}>
//                           {w.area_nombre || 'General'}
//                         </span>
//                       </td>
//                       <td style={{ fontSize: '0.82rem', color: '#53695c' }}>{w.telefono || '—'}</td>
//                       <td style={{ fontSize: '0.82rem', color: '#53695c' }}>{w.fecha_ingreso_fmt || '—'}</td>
//                       <td>
//                         <span style={{
//                           padding: '4px 10px',
//                           borderRadius: '20px',
//                           fontSize: '0.72rem',
//                           fontWeight: 700,
//                           background: w.aptitud_medica === 'No Apto' ? '#fef2f2' : (w.aptitud_medica?.includes('Restricciones') ? '#fbf6e8' : '#eaf4ef'),
//                           color: w.aptitud_medica === 'No Apto' ? '#dc2626' : (w.aptitud_medica?.includes('Restricciones') ? '#c9a227' : '#0d5f3d'),
//                           border: `1px solid ${w.aptitud_medica === 'No Apto' ? '#fecaca' : (w.aptitud_medica?.includes('Restricciones') ? '#d9c7a3' : '#a3cfbb')}`
//                         }}>
//                           {w.aptitud_medica === 'No Apto' ? '✕ ' : '✓ '} {w.aptitud_medica || 'Apto'}
//                         </span>
//                       </td>
//                       <td style={{ textAlign: 'center' }}>
//                         <button
//                           type="button"
//                           onClick={() => handleDeleteWorker(w.id, `${w.nombres} ${w.apellidos}`)}
//                           style={{
//                             background: '#fef2f2',
//                             border: '1px solid #fee2e2',
//                             color: '#dc2626',
//                             cursor: 'pointer',
//                             borderRadius: '8px',
//                             padding: '6px',
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             transition: 'all 0.2s'
//                           }}
//                           title="Eliminar colaborador"
//                         >
//                           <Trash2 size={15} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>

//       {/* Modal de Registro de Trabajador */}
//       {isModalOpen && (
//         <div className="ssoma-modal-overlay" onClick={() => setIsModalOpen(false)}>
//           <div
//             className="ssoma-modal"
//             style={{
//               maxWidth: '560px',
//               borderRadius: '20px',
//               border: '1px solid #d9c7a3',
//               boxShadow: '0 25px 50px -12px rgba(13, 95, 61, 0.25)'
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                 <div style={{
//                   background: '#eaf4ef',
//                   color: '#0d5f3d',
//                   padding: '8px',
//                   borderRadius: '10px',
//                   display: 'flex'
//                 }}>
//                   <UserPlus size={20} />
//                 </div>
//                 <div>
//                   <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
//                     Registrar Nuevo Trabajador
//                   </h3>
//                   <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
//                     Ingreso al padrón y asignación de área operativa
//                   </span>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 style={{
//                   background: '#f6f1e8',
//                   border: 'none',
//                   borderRadius: '50%',
//                   width: '32px',
//                   height: '32px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   cursor: 'pointer',
//                   color: '#53695c'
//                 }}
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {formError && (
//               <div style={{
//                 margin: '16px 24px 0',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 padding: '10px 14px',
//                 background: '#fef2f2',
//                 border: '1px solid #fecaca',
//                 borderRadius: '10px',
//                 color: '#dc2626',
//                 fontSize: '0.82rem'
//               }}>
//                 <AlertCircle size={17} />
//                 <span>{formError}</span>
//               </div>
//             )}

//             <form onSubmit={handleCreateWorker}>
//               <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                   <div>
//                     <label className="ssoma-label">DNI / Documento *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.dni}
//                       onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
//                       placeholder="Ej: 72489123"
//                     />
//                   </div>
//                   <div>
//                     <label className="ssoma-label">Área Asignada *</label>
//                     <select
//                       required
//                       className="ssoma-select"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.area_id}
//                       onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
//                     >
//                       <option value="">Seleccione área</option>
//                       {areas.map((a) => (
//                         <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                   <div>
//                     <label className="ssoma-label">Nombres *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.nombres}
//                       onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
//                       placeholder="Ej: Carlos Alberto"
//                     />
//                   </div>
//                   <div>
//                     <label className="ssoma-label">Apellidos *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.apellidos}
//                       onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
//                       placeholder="Ej: Mendoza Ramos"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="ssoma-label">Cargo Operativo *</label>
//                   <input
//                     type="text"
//                     required
//                     className="ssoma-input"
//                     style={{ width: '100%', marginTop: '4px' }}
//                     value={formData.cargo}
//                     onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
//                     placeholder="Ej: Supervisor de Planta / Operador"
//                   />
//                 </div>

//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                   <div>
//                     <label className="ssoma-label">Teléfono de Contacto</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.telefono}
//                       onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
//                       placeholder="987654321"
//                     />
//                   </div>
//                   <div>
//                     <label className="ssoma-label">Aptitud Médica</label>
//                     <select
//                       className="ssoma-select"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={formData.aptitud_medica}
//                       onChange={(e) => setFormData({ ...formData, aptitud_medica: e.target.value })}
//                     >
//                       <option value="Apto">Apto Médico</option>
//                       <option value="Apto con Restricciones">Apto con Restricciones</option>
//                       <option value="No Apto">No Apto</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="ssoma-label">Correo Electrónico Institucional</label>
//                   <input
//                     type="email"
//                     className="ssoma-input"
//                     style={{ width: '100%', marginTop: '4px' }}
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     placeholder="trabajador@empresa.com"
//                   />
//                 </div>
//               </div>

//               <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
//                 <button
//                   type="button"
//                   className="ssoma-btn ssoma-btn-secondary"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="ssoma-btn ssoma-btn-primary"
//                   style={{ backgroundColor: '#0d5f3d', opacity: submitting ? 0.75 : 1 }}
//                 >
//                   {submitting ? 'Guardando...' : 'Guardar Colaborador'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
















// import React, { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import { Users, Building2, Phone, Mail, CheckCircle2 } from 'lucide-react';

// export default function PersonalView() {
//   const [workers, setWorkers] = useState([]);
//   const [areas, setAreas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     fetch('https://ssoma-app-fbwe.onrender.com/api/personal/trabajadores')
//       .then((res) => res.json())
//       .then((d) => d.success && setWorkers(d.data));

//     fetch('https://ssoma-app-fbwe.onrender.com/api/personal/areas')
//       .then((res) => res.json())
//       .then((d) => {
//         if (d.success) setAreas(d.data);
//         setLoading(false);
//       });
//   }, []);

//   const filteredWorkers = workers.filter((w) => {
//     if (!searchTerm) return true;
//     const t = searchTerm.toLowerCase();
//     return (
//       w.nombres.toLowerCase().includes(t) ||
//       w.apellidos.toLowerCase().includes(t) ||
//       w.cargo.toLowerCase().includes(t) ||
//       w.dni.includes(t)
//     );
//   });

//   return (
//     <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
//       <main className="ssoma-main-panel" style={{ width: '100%' }}>
//         <Header title="Directorio de Personal & Áreas Operativas" searchTerm={searchTerm} onSearch={setSearchTerm} />

//         {/* Áreas resumen */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
//           {areas.map((a) => (
//             <div key={a.id} style={{
//               background: '#ffffff',
//               padding: '16px 20px',
//               borderRadius: '16px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '6px' }}>
//                 <Building2 size={18} />
//                 <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase' }}>{a.codigo}</span>
//               </div>
//               <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{a.nombre}</h4>
//               <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Líder: {a.responsable}</p>
//               <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
//                 <span>👥 {a.total_trabajadores} trabajadores</span>
//                 <span>⚠️ {a.total_incidentes} eventos</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Directorio de Trabajadores */}
//         <div className="ssoma-table-card">
//           <div className="ssoma-table-header">
//             <h2 className="ssoma-table-title">Personal Registrado con Inducción SSOMA</h2>
//           </div>

//           <div style={{ overflowX: 'auto' }}>
//             <table className="ssoma-table">
//               <thead>
//                 <tr>
//                   <th>DNI</th>
//                   <th>Colaborador</th>
//                   <th>Cargo Operativo</th>
//                   <th>Área Asignada</th>
//                   <th>Contacto</th>
//                   <th>Fecha Ingreso</th>
//                   <th>Estado</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredWorkers.map((w) => (
//                   <tr key={w.id}>
//                     <td style={{ fontWeight: 800, color: '#334155' }}>{w.dni}</td>
//                     <td>
//                       <div className="ssoma-worker-cell">
//                         <img
//                           src={w.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
//                           alt={w.nombres}
//                           className="ssoma-worker-avatar"
//                         />
//                         <div>
//                           <div className="ssoma-worker-name">{w.nombres} {w.apellidos}</div>
//                           <div className="ssoma-worker-sub">{w.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td style={{ fontWeight: 600, color: '#1e293b' }}>{w.cargo}</td>
//                     <td style={{ color: '#4338ca', fontWeight: 600 }}>{w.area_nombre || 'General'}</td>
//                     <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.telefono}</td>
//                     <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.fecha_ingreso_fmt || '—'}</td>
//                     <td>
//                       <span style={{
//                         padding: '3px 8px',
//                         borderRadius: '8px',
//                         fontSize: '0.72rem',
//                         fontWeight: 700,
//                         background: '#dcfce7',
//                         color: '#15803d'
//                       }}>
//                         ✅ Apto Médico
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
