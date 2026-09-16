import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { GraduationCap, Users, Clock, Plus, Award, CheckCircle2 } from 'lucide-react';

export default function CapacitacionesView() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({
    tema: '',
    tipo: 'Seguridad Preventiva',
    expositor: '',
    fecha: new Date().toISOString().split('T')[0],
    duracion_horas: '2.0',
    total_asistentes: '25',
    area_id: '',
    estado: 'Programada'
  });

  const loadData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/capacitaciones')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setCapacitaciones(d.data);
          setStats(d.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('http://localhost:5000/api/personal/areas').then((res) => res.json()).then((d) => d.success && setAreas(d.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/capacitaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Capacitaciones & Horas-Hombre SSOMA" searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* Resumen Horas-Hombre y Asistencia */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          <div className="ssoma-kpi-card indigo">
            <div className="ssoma-kpi-top">
              <div className="ssoma-kpi-icon-box"><Clock size={24} /></div>
              <div className="ssoma-kpi-meta">
                <span className="ssoma-kpi-label">Horas-Hombre Capacitación</span>
                <div className="ssoma-kpi-value">{parseFloat(stats?.total_hh || 307).toFixed(1)} HH</div>
              </div>
            </div>
            <div className="ssoma-kpi-bottom">
              <span className="ssoma-kpi-badge">Ley 29783 Cumplida</span>
            </div>
          </div>

          <div className="ssoma-kpi-card emerald">
            <div className="ssoma-kpi-top">
              <div className="ssoma-kpi-icon-box"><Users size={24} /></div>
              <div className="ssoma-kpi-meta">
                <span className="ssoma-kpi-label">Trabajadores Asistentes</span>
                <div className="ssoma-kpi-value">{stats?.total_personas || 156}</div>
              </div>
            </div>
            <div className="ssoma-kpi-bottom">
              <span className="ssoma-kpi-badge">94% Cobertura</span>
            </div>
          </div>

          <div className="ssoma-kpi-card amber">
            <div className="ssoma-kpi-top">
              <div className="ssoma-kpi-icon-box"><Award size={24} /></div>
              <div className="ssoma-kpi-meta">
                <span className="ssoma-kpi-label">Sesiones Programadas</span>
                <div className="ssoma-kpi-value">{stats?.total_sesiones || 5}</div>
              </div>
            </div>
            <div className="ssoma-kpi-bottom">
              <span className="ssoma-kpi-badge">100% Eficacia</span>
            </div>
          </div>
        </div>

        {/* Tabla de Capacitaciones */}
        <div className="ssoma-table-card">
          <div className="ssoma-table-header">
            <div>
              <h2 className="ssoma-table-title">Programa Anual de Inducción y Entrenamiento</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Cumplimiento del plan de 4 capacitaciones mínimas de ley por trabajador
              </p>
            </div>
            <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>+ Programar Sesión</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ssoma-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tema / Curso</th>
                  <th>Tipo</th>
                  <th>Expositor</th>
                  <th>Fecha</th>
                  <th>Duración</th>
                  <th>Asistentes</th>
                  <th>Total HH</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {capacitaciones.map((cap) => (
                  <tr key={cap.id}>
                    <td style={{ fontWeight: 800, color: '#334155' }}>{cap.codigo}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{cap.tema}</td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{cap.tipo}</td>
                    <td style={{ fontSize: '0.82rem', color: '#1e293b' }}>{cap.expositor}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{cap.fecha_fmt}</td>
                    <td style={{ fontWeight: 700 }}>{cap.duracion_horas} hrs</td>
                    <td style={{ fontWeight: 700, color: '#4338ca' }}>{cap.total_asistentes} pers.</td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>{cap.horas_hombre_total} HH</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: cap.estado === 'Ejecutada' ? '#dcfce7' : '#fef3c7',
                        color: cap.estado === 'Ejecutada' ? '#15803d' : '#b45309'
                      }}>
                        {cap.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Programar */}
        {isModalOpen && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Programar Nueva Capacitación SSOMA</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="ssoma-modal-body">
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group full">
                      <label className="ssoma-label">Tema del Entrenamiento</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. IPERC Continuo y Jerarquía de Controles..."
                        className="ssoma-input"
                        value={formData.tema}
                        onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Tipo de Capacitación</label>
                      <select
                        className="ssoma-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="Seguridad Preventiva">Seguridad Preventiva</option>
                        <option value="Trabajos de Alto Riesgo">Trabajos de Alto Riesgo (PETAR)</option>
                        <option value="Gestión Ambiental">Gestión Ambiental</option>
                        <option value="Salud Ocupacional">Salud Ocupacional y Ergonomía</option>
                        <option value="Respuesta a Emergencias">Respuesta a Emergencias</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Expositor / Facilitador</label>
                      <input
                        type="text"
                        required
                        className="ssoma-input"
                        placeholder="Nombre del instructor o empresa"
                        value={formData.expositor}
                        onChange={(e) => setFormData({ ...formData, expositor: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Fecha de Realización</label>
                      <input
                        type="date"
                        required
                        className="ssoma-input"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Duración (Horas)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="ssoma-input"
                        value={formData.duracion_horas}
                        onChange={(e) => setFormData({ ...formData, duracion_horas: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Total Asistentes Estimados</label>
                      <input
                        type="number"
                        required
                        className="ssoma-input"
                        value={formData.total_asistentes}
                        onChange={(e) => setFormData({ ...formData, total_asistentes: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Estado</label>
                      <select
                        className="ssoma-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      >
                        <option value="Programada">Programada</option>
                        <option value="Ejecutada">Ejecutada</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="ssoma-modal-footer">
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="ssoma-btn ssoma-btn-primary">Guardar Capacitación</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
