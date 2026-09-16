import React from 'react';
import DonutChart from './Charts/DonutChart';
import { Download, ShieldCheck, FileSpreadsheet, Sparkles, TrendingUp } from 'lucide-react';

export default function RightPanel({ onOpenReport, onOpenNewIncident, kpi, donutItems }) {
  return (
    <aside className="ssoma-right-panel">
      {/* Top Rose Gradient KPI Card (Matching "Total Profit $5,659 +35%" in mockup) */}
      <div className="ssoma-right-kpi">
        <div className="ssoma-right-kpi-top">
          <div className="ssoma-kpi-icon-box">
            <ShieldCheck size={26} />
          </div>
          <div className="ssoma-kpi-meta">
            <span className="ssoma-kpi-label">{kpi?.titulo || 'Índice Severidad'}</span>
            <div className="ssoma-kpi-value">{kpi?.valor || '0.45'}</div>
          </div>
        </div>

        <div className="ssoma-kpi-bottom">
          <span className="ssoma-kpi-badge">{kpi?.variacion || '+35% Eficiencia'}</span>
        </div>
      </div>

      {/* Center Donut Chart (Matching "Sale Status" in mockup) */}
      <DonutChart items={donutItems} />

      {/* Bottom Action Card (Matching "PDF Report - Download Monthly Reports" in mockup) */}
      <div className="ssoma-report-card">
        <div className="ssoma-report-illustration">
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #064e3b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            color: '#fff'
          }}>
            <FileSpreadsheet size={40} />
          </div>
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '24px',
            background: '#ffedd5',
            color: '#c2410c',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            ISO 45001
          </div>
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '20px',
            background: '#dcfce7',
            color: '#15803d',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            ISO 14001
          </div>
        </div>

        <div className="ssoma-report-title">PDF Report</div>
        <div className="ssoma-report-subtitle">
          Descargar Informe Mensual Oficial de Seguridad & Medio Ambiente
        </div>

        <button className="ssoma-report-download-btn" onClick={onOpenReport}>
          <Download size={18} />
          <span>Download</span>
        </button>
      </div>

      {/* Botón flotante para reportar evento rápido */}
      <button
        onClick={onOpenNewIncident}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
        }}
      >
        <TrendingUp size={18} />
        <span>+ Reportar Incidente Inmediato</span>
      </button>
    </aside>
  );
}
