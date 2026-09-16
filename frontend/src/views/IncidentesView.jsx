import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import IncidentModal from '../components/IncidentModal';
import { AlertTriangle, Plus, Filter, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function IncidentesView() {
  const { formatMoney } = useCompany();
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSeveridad, setFiltroSeveridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [workers, setWorkers] = useState([]);

  const loadData = () => {
    setLoading(true);
    let url = 'http://localhost:5000/api/incidentes?';
    if (filtroSeveridad) url += `severidad=${filtroSeveridad}&`;
    if (filtroEstado) url += `estado=${filtroEstado}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setIncidentes(data.data);
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
  }, [filtroSeveridad, filtroEstado, searchTerm]);

  const handleSave = async (formData) => {
    const res = await fetch('http://localhost:5000/api/incidentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const d = await res.json();
    if (d.success) loadData();
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await fetch(`http://localhost:5000/api/incidentes/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    loadData();
  };

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Gestión de Incidentes & Accidentes" searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* Barra de Filtros y Acción */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #edf2f7',
          boxShadow: 'var(--shadow-sm)',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
              <Filter size={16} />
              <span>Filtrar por:</span>
            </div>

            <select
              className="ssoma-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              value={filtroSeveridad}
              onChange={(e) => setFiltroSeveridad(e.target.value)}
            >
              <option value="">Todas las Severidades</option>
              <option value="Leve">Leve</option>
              <option value="Moderado">Moderado</option>
              <option value="Grave">Grave</option>
              <option value="Crítico">Crítico</option>
            </select>

            <select
              className="ssoma-select"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="Reportado">Reportado</option>
              <option value="En Investigación">En Investigación</option>
              <option value="Plan de Acción">Plan de Acción</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <button
            className="ssoma-btn ssoma-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            <span>+ Registrar Incidente</span>
          </button>
        </div>

        {/* Tabla completa de Incidentes */}
        <div className="ssoma-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="ssoma-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título / Suceso</th>
                  <th>Tipo</th>
                  <th>Severidad</th>
                  <th>Área / Ubicación</th>
                  <th>Fecha</th>
                  <th>Reportado Por</th>
                  <th>Días Perdidos</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>
                      Cargando registros SSOMA...
                    </td>
                  </tr>
                ) : incidentes.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No se encontraron incidentes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  incidentes.map((inc) => (
                    <tr key={inc.id}>
                      <td style={{ fontWeight: 800, color: '#334155' }}>{inc.codigo}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px' }}>
                        <div>{inc.titulo}</div>
                        {inc.descripcion && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400, marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {inc.descripcion}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                          {inc.tipo}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: inc.severidad === 'Leve' ? '#dcfce7' : (inc.severidad === 'Moderado' ? '#fef3c7' : '#fee2e2'),
                          color: inc.severidad === 'Leve' ? '#15803d' : (inc.severidad === 'Moderado' ? '#b45309' : '#b91c1c')
                        }}>
                          {inc.severidad}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{inc.area_nombre || 'General'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{inc.lugar}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{inc.fecha_formato}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={inc.reportado_por_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt=""
                            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                          />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{inc.reportado_por_nombre || 'Supervisor'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: inc.dias_perdidos > 0 ? '#ef4444' : '#10b981' }}>
                        {inc.dias_perdidos} días
                      </td>
                      <td>
                        <select
                          value={inc.estado}
                          onChange={(e) => handleCambiarEstado(inc.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            background: inc.estado === 'Cerrado' ? '#dcfce7' : (inc.estado === 'En Investigación' ? '#e0e7ff' : '#fef3c7'),
                            color: inc.estado === 'Cerrado' ? '#15803d' : (inc.estado === 'En Investigación' ? '#4338ca' : '#b45309'),
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Reportado">Reportado</option>
                          <option value="En Investigación">En Investigación</option>
                          <option value="Plan de Acción">Plan de Acción</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                          {formatMoney(inc.costo_estimado || 0, 0)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <IncidentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          areas={areas}
          workers={workers}
        />
      </main>
    </div>
  );
}
