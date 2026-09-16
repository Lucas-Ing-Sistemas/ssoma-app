import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MetricCards from '../components/MetricCards';
import SplineAreaChart from '../components/Charts/SplineAreaChart';
import RecentEventsTable from '../components/RecentEventsTable';
import RightPanel from '../components/RightPanel';
import IncidentModal from '../components/IncidentModal';
import ReportModal from '../components/ReportModal';

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchDashboardData = () => {
    fetch('http://localhost:5000/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err));

    fetch('http://localhost:5000/api/personal/areas')
      .then((res) => res.json())
      .then((data) => data.success && setAreas(data.data))
      .catch(() => {});

    fetch('http://localhost:5000/api/personal/trabajadores')
      .then((res) => res.json())
      .then((data) => data.success && setWorkers(data.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveIncident = async (newIncidentData) => {
    const res = await fetch('http://localhost:5000/api/incidentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIncidentData)
    });
    const data = await res.json();
    if (data.success) {
      fetchDashboardData();
    }
  };

  // Filtrado de la tabla según buscador
  const filteredEvents = stats?.incidentesRecientes?.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(term) ||
      item.nombre.toLowerCase().includes(term) ||
      item.titulo.toLowerCase().includes(term) ||
      item.tipo.toLowerCase().includes(term)
    );
  });

  return (
    <div className="ssoma-content-wrapper">
      {/* Columna Principal Central */}
      <main className="ssoma-main-panel">
        <Header
          title="Dashboard"
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {/* 3 Tarjetas KPI Superiores en Gradiente (Verde, Índigo, Ámbar) */}
        <MetricCards stats={stats?.kpis} />

        {/* Gráfico de Ondas / Curva Spline con Tooltip idéntico al mockup */}
        <SplineAreaChart
          mainStat={stats?.graficoTendencia?.totalAnualLabel || "$59,540"}
        />

        {/* Tabla de Recent Order / Eventos SSOMA Recientes */}
        <RecentEventsTable
          items={filteredEvents}
          onOpenNewIncident={() => setIsIncidentModalOpen(true)}
          onSelectRow={(row) => setSelectedIncident(row)}
        />
      </main>

      {/* Columna Derecha con Donut Chart y Descarga de Reporte PDF */}
      <RightPanel
        kpi={stats?.kpiDerecho}
        donutItems={stats?.distribucionStatus}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenNewIncident={() => setIsIncidentModalOpen(true)}
      />

      {/* Modal de Nuevo Incidente */}
      <IncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSave={handleSaveIncident}
        areas={areas}
        workers={workers}
      />

      {/* Modal de Reporte Mensual PDF */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Modal de Detalle de Incidente Seleccionado */}
      {selectedIncident && (
        <div className="ssoma-modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="ssoma-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="ssoma-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Detalle del Evento {selectedIncident.id}
              </h3>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>
            <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Título / Suceso</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {selectedIncident.titulo}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reportado Por</span>
                  <div style={{ fontWeight: 600, color: '#334155', marginTop: '2px' }}>{selectedIncident.nombre}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Ocurrencia</span>
                  <div style={{ fontWeight: 600, color: '#334155', marginTop: '2px' }}>{selectedIncident.fecha}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Severidad</span>
                  <div style={{ fontWeight: 700, color: '#e11d48', marginTop: '2px' }}>{selectedIncident.severidad}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Costo / Pérdida</span>
                  <div style={{ fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{selectedIncident.precio}</div>
                </div>
              </div>
            </div>
            <div className="ssoma-modal-footer">
              <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setSelectedIncident(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
