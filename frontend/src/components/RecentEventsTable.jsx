import React from 'react';

export default function RecentEventsTable({ items, onSelectRow, onOpenNewIncident }) {
  const defaultItems = [
    {
      id: '#1098',
      name: 'Jared Terry',
      role: 'Operador de Montacargas',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      date: '25/07/2026',
      price: '$150',
      statusColor: '#6366f1', // Purple/indigo
      statusLabel: 'Activo'
    },
    {
      id: '#1097',
      name: 'Jasmine Kuhlman',
      role: 'Técnica Ambiental',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      date: '25/07/2026',
      price: '$300',
      statusColor: '#10b981', // Teal/green
      statusLabel: 'Completado'
    },
    {
      id: '#1096',
      name: 'Peonie Hoeger',
      role: 'Supervisora de Planta',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      date: '24/07/2026',
      price: '$230',
      statusColor: '#10b981', // Teal/green
      statusLabel: 'Completado'
    },
    {
      id: '#1095',
      name: 'Cedar Botsford',
      role: 'Mecánico de Mantenimiento',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      date: '24/07/2026',
      price: '$230',
      statusColor: '#f59e0b', // Amber/orange
      statusLabel: 'En Espera'
    }
  ];

  const tableData = items && items.length > 0 ? items : defaultItems;

  return (
    <div className="ssoma-table-card">
      <div className="ssoma-table-header">
        <h2 className="ssoma-table-title">Recent Order / Eventos SSOMA Recientes</h2>
        <button
          className="ssoma-btn ssoma-btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          onClick={onOpenNewIncident}
        >
          + Nuevo Registro
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ssoma-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Name / Reportado Por</th>
              <th>Date</th>
              <th>Price / Costo</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onSelectRow && onSelectRow(row)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ fontWeight: 800, color: '#334155' }}>
                  {row.id}
                </td>
                <td>
                  <div className="ssoma-worker-cell">
                    <img
                      src={row.avatar}
                      alt={row.name}
                      className="ssoma-worker-avatar"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                      }}
                    />
                    <div>
                      <div className="ssoma-worker-name">{row.name}</div>
                      {row.role && <div className="ssoma-worker-sub">{row.role}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ color: '#64748b', fontWeight: 600 }}>
                  {row.date}
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>
                  {row.price}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className="ssoma-status-dot"
                    style={{
                      backgroundColor: row.statusColor || '#10b981',
                      width: '12px',
                      height: '12px',
                      margin: '0 auto'
                    }}
                    title={row.statusLabel || 'Estado'}
                  ></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
