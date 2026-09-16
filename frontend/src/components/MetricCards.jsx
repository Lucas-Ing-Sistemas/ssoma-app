import React from 'react';
import { ShieldCheck, AlertTriangle, ClipboardCheck, Store, FileText, ShoppingCart } from 'lucide-react';

export default function MetricCards({ stats }) {
  const defaultCards = [
    {
      id: 'dias',
      label: 'Días Sin Accidentes',
      value: stats?.diasSinAccidentes?.valor || '184',
      badge: stats?.diasSinAccidentes?.variacion || '+62% vs meta',
      colorClass: 'emerald',
      icon: ShieldCheck
    },
    {
      id: 'incidentes',
      label: 'Incidentes Reportados',
      value: stats?.totalIncidentesMes?.valor || '3',
      badge: stats?.totalIncidentesMes?.variacion || '-30% reducción',
      colorClass: 'indigo',
      icon: AlertTriangle
    },
    {
      id: 'cumplimiento',
      label: 'Cumplimiento Inspecciones',
      value: stats?.cumplimientoInspecciones?.valor || '92.0%',
      badge: stats?.cumplimientoInspecciones?.variacion || '+52% completadas',
      colorClass: 'amber',
      icon: ClipboardCheck
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '18px'
    }}>
      {defaultCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`ssoma-kpi-card ${card.colorClass}`}>
            <div className="ssoma-kpi-top">
              <div className="ssoma-kpi-icon-box">
                <Icon size={26} />
              </div>
              <div className="ssoma-kpi-meta">
                <span className="ssoma-kpi-label">{card.label}</span>
                <div className="ssoma-kpi-value">{card.value}</div>
              </div>
            </div>

            <div className="ssoma-kpi-bottom">
              <span className="ssoma-kpi-badge">{card.badge}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
