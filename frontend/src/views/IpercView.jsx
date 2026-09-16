import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ShieldAlert, Plus, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

export default function IpercView() {
  const [matrixData, setMatrixData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [formData, setFormData] = useState({
    proceso: '',
    actividad: '',
    tarea: '',
    peligro: '',
    riesgo: '',
    probabilidad: '2',
    severidad: '3',
    jerarquia_control: 'Control de Ingeniería',
    medidas_control: '',
    area_id: '',
    responsable_id: ''
  });

  const loadData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/iperc')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMatrixData(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('http://localhost:5000/api/personal/areas').then((res) => res.json()).then((d) => d.success && setAreas(d.data));
    fetch('http://localhost:5000/api/personal/trabajadores').then((res) => res.json()).then((d) => d.success && setWorkers(d.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/iperc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    loadData();
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Crítico': return { bg: '#fee2e2', color: '#b91c1c' };
      case 'Alto': return { bg: '#ffedd5', color: '#c2410c' };
      case 'Medio': return { bg: '#fef3c7', color: '#b45309' };
      default: return { bg: '#dcfce7', color: '#15803d' };
    }
  };

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Matriz IPERC Continuo" searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* Resumen de Niveles de Riesgo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Riesgo Crítico</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>
              {matrixData.filter(m => m.nivel_riesgo === 'Crítico').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Requiere PETAR inmediato</div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #f97316', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Riesgo Alto</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f97316' }}>
              {matrixData.filter(m => m.nivel_riesgo === 'Alto').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Controles de ingeniería</div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #eab308', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Riesgo Medio</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ca8a04' }}>
              {matrixData.filter(m => m.nivel_riesgo === 'Medio').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Procedimientos / EPP</div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #10b981', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Riesgo Aceptable (Bajo)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
              {matrixData.filter(m => m.nivel_riesgo === 'Bajo').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Control rutinario</div>
          </div>
        </div>

        {/* Tabla IPERC */}
        <div className="ssoma-table-card">
          <div className="ssoma-table-header">
            <h2 className="ssoma-table-title">Evaluación de Riesgos y Controles Operacionales</h2>
            <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>+ Nuevo Peligro IPERC</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ssoma-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Proceso / Tarea</th>
                  <th>Peligro Identificado</th>
                  <th>Riesgo Asociado</th>
                  <th style={{ textAlign: 'center' }}>P x S</th>
                  <th>Nivel</th>
                  <th>Jerarquía de Control</th>
                  <th>Medidas de Control</th>
                  <th>Área</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((item) => {
                  const style = getRiskColor(item.nivel_riesgo);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800, color: '#334155' }}>{item.codigo}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.proceso}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.tarea}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#b91c1c' }}>{item.peligro}</td>
                      <td style={{ color: '#475569' }}>{item.riesgo}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>
                        {item.probabilidad} × {item.severidad} = <span style={{ color: style.color }}>{item.probabilidad * item.severidad}</span>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: style.bg,
                          color: style.color
                        }}>
                          {item.nivel_riesgo}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.78rem', color: '#4338ca' }}>
                        {item.jerarquia_control}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#334155', maxWidth: '280px' }}>
                        {item.medidas_control}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          {item.area_nombre || 'General'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear Peligro IPERC */}
        {isModalOpen && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="ssoma-modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nuevo Registro en Matriz IPERC</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="ssoma-modal-body">
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Proceso</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Mantenimiento Mecánico..."
                        className="ssoma-input"
                        value={formData.proceso}
                        onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Tarea</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Trabajos en Espacios Confinados..."
                        className="ssoma-input"
                        value={formData.tarea}
                        onChange={(e) => setFormData({ ...formData, tarea: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Peligro</label>
                      <input
                        type="text"
                        required
                        placeholder="Fuente o condición con potencial de causar daño"
                        className="ssoma-input"
                        value={formData.peligro}
                        onChange={(e) => setFormData({ ...formData, peligro: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Riesgo</label>
                      <input
                        type="text"
                        required
                        placeholder="Consecuencia o daño probable"
                        className="ssoma-input"
                        value={formData.riesgo}
                        onChange={(e) => setFormData({ ...formData, riesgo: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Probabilidad (1 a 5)</label>
                      <select
                        className="ssoma-select"
                        value={formData.probabilidad}
                        onChange={(e) => setFormData({ ...formData, probabilidad: e.target.value })}
                      >
                        <option value="1">1 - Casi Improbable</option>
                        <option value="2">2 - Poco Probable</option>
                        <option value="3">3 - Probable</option>
                        <option value="4">4 - Muy Probable</option>
                        <option value="5">5 - Seguro / Inevitable</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Severidad (1 a 5)</label>
                      <select
                        className="ssoma-select"
                        value={formData.severidad}
                        onChange={(e) => setFormData({ ...formData, severidad: e.target.value })}
                      >
                        <option value="1">1 - Insignificante</option>
                        <option value="2">2 - Menor / Primeros auxilios</option>
                        <option value="3">3 - Moderado / Días perdidos</option>
                        <option value="4">4 - Grave / Incapacidad permanente</option>
                        <option value="5">5 - Fatalidad / Catastrófico</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Jerarquía de Control</label>
                      <select
                        className="ssoma-select"
                        value={formData.jerarquia_control}
                        onChange={(e) => setFormData({ ...formData, jerarquia_control: e.target.value })}
                      >
                        <option value="Eliminación">Eliminación</option>
                        <option value="Sustitución">Sustitución</option>
                        <option value="Control de Ingeniería">Control de Ingeniería</option>
                        <option value="Control Administrativo">Control Administrativo</option>
                        <option value="EPP">EPP Especializado</option>
                      </select>
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
                    <div className="ssoma-form-group full">
                      <label className="ssoma-label">Medidas de Control Operacionales</label>
                      <textarea
                        rows="2"
                        className="ssoma-textarea"
                        placeholder="Describa los controles aplicables..."
                        value={formData.medidas_control}
                        onChange={(e) => setFormData({ ...formData, medidas_control: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="ssoma-modal-footer">
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="ssoma-btn ssoma-btn-primary">Guardar en IPERC</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
