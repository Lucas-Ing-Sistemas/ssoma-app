import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ClipboardCheck, Plus, CheckCircle, AlertCircle, Calendar, CheckSquare } from 'lucide-react';

export default function InspeccionesView() {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [areas, setAreas] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [hallazgos, setHallazgos] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'Seguridad en Campo',
    fecha_programada: new Date().toISOString().split('T')[0],
    area_id: '',
    responsable_id: '',
    observaciones: ''
  });

  const loadData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/inspecciones')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInspecciones(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('http://localhost:5000/api/personal/areas')
      .then((res) => res.json())
      .then((d) => d.success && setAreas(d.data));

    fetch('http://localhost:5000/api/personal/trabajadores')
      .then((res) => res.json())
      .then((d) => d.success && setWorkers(d.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/inspecciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    loadData();
  };

  const handleViewHallazgos = async (insp) => {
    setSelectedInspection(insp);
    const res = await fetch(`http://localhost:5000/api/inspecciones/${insp.id}/hallazgos`);
    const d = await res.json();
    if (d.success) setHallazgos(d.data);
  };

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Inspecciones de Seguridad & Hallazgos" searchTerm={searchTerm} onSearch={setSearchTerm} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Programa de Inspecciones Preventivas SSOMA
            </span>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Verificaciones de campo, equipos de emergencia y cumplimiento ambiental
            </p>
          </div>

          <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>+ Programar Inspección</span>
          </button>
        </div>

        {/* Inspecciones Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {inspecciones.map((insp) => (
            <div
              key={insp.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                border: '1px solid #edf2f7',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'transform 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1' }}>{insp.codigo}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: insp.estado === 'Completada' ? '#dcfce7' : (insp.estado === 'En Curso' ? '#e0e7ff' : '#fef3c7'),
                    color: insp.estado === 'Completada' ? '#15803d' : (insp.estado === 'En Curso' ? '#4338ca' : '#b45309')
                  }}>
                    {insp.estado}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                  {insp.titulo}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Área: <strong style={{ color: '#334155' }}>{insp.area_nombre || 'General'}</strong>
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Puntaje</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: insp.puntaje_cumplimiento >= 90 ? '#10b981' : '#f59e0b' }}>
                    {insp.puntaje_cumplimiento}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Hallazgos</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: insp.total_hallazgos > 0 ? '#ef4444' : '#10b981', textAlign: 'right' }}>
                    {insp.total_hallazgos}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  📅 {insp.fecha_programada_fmt}
                </span>
                <button
                  onClick={() => handleViewHallazgos(insp)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Ver Hallazgos
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalle de Hallazgos */}
        {selectedInspection && (
          <div className="ssoma-modal-overlay" onClick={() => setSelectedInspection(null)}>
            <div className="ssoma-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Hallazgos de Inspección: {selectedInspection.codigo}
                </h3>
                <button onClick={() => setSelectedInspection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="ssoma-modal-body">
                {hallazgos.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    ✅ Sin observaciones ni hallazgos subestándar pendientes.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {hallazgos.map((h) => (
                      <div key={h.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{h.descripcion}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                          <strong>Acción Correctiva:</strong> {h.accion_correctiva}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', marginTop: '6px', color: '#94a3b8' }}>
                          <span>Nivel: <strong>{h.nivel_riesgo}</strong></span>
                          <span>Estado: <strong>{h.estado}</strong></span>
                          <span>Plazo: <strong>{h.fecha_limite_fmt}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Programar Inspección */}
        {isModalOpen && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Programar Nueva Inspección SSOMA</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="ssoma-modal-body">
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group full">
                      <label className="ssoma-label">Título de la Inspección</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Verificación de Sistemas Contra Incendio..."
                        className="ssoma-input"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Tipo</label>
                      <select
                        className="ssoma-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="Seguridad en Campo">Seguridad en Campo</option>
                        <option value="Equipos y Maquinaria">Equipos y Maquinaria</option>
                        <option value="Orden y Limpieza 5S">Orden y Limpieza 5S</option>
                        <option value="Extintores y Emergencias">Extintores y Emergencias</option>
                        <option value="Ambiental y Manejo de Residuos">Ambiental y Manejo de Residuos</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Fecha Programada</label>
                      <input
                        type="date"
                        required
                        className="ssoma-input"
                        value={formData.fecha_programada}
                        onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Área</label>
                      <select
                        className="ssoma-select"
                        value={formData.area_id}
                        onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                      >
                        <option value="">Seleccione Área...</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>{a.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Responsable</label>
                      <select
                        className="ssoma-select"
                        value={formData.responsable_id}
                        onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                      >
                        <option value="">Seleccione Inspector...</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>{w.nombres} {w.apellidos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="ssoma-modal-footer">
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="ssoma-btn ssoma-btn-primary">Programar Inspección</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
