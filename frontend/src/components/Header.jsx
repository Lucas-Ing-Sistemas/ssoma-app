import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

export default function Header({ title = "Dashboard", onSearch, searchTerm }) {
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Inspección de Equipos en Curso en Nave A', time: 'Hace 10 min', type: 'info' },
    { id: 2, text: 'Monitoreo de Ruido superó 78.4 dB en Planta', time: 'Hace 45 min', type: 'alert' },
    { id: 3, text: 'Nuevo lote de EPPs entregado a taller mecánico', time: 'Hace 2 horas', type: 'success' }
  ];

  return (
    <header className="ssoma-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 className="ssoma-page-title" style={{ margin: 0 }}>{title}</h1>
        {company?.nombre_comercial && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🏢 {company.nombre_comercial}
          </span>
        )}
      </div>

      {/* Search Bar pill */}
      <div className="ssoma-search-bar">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Buscar..."
          className="ssoma-search-input"
          value={searchTerm || ''}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      {/* Header Actions */}
      <div className="ssoma-header-actions">
        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            className="ssoma-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notificaciones"
          >
            <Bell size={20} />
            <span className="ssoma-badge-dot"></span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              width: '320px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid #edf2f7',
              padding: '16px',
              zIndex: 100
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px', color: '#0f172a' }}>
                Notificaciones SSOMA
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    fontSize: '0.78rem',
                    borderLeft: `3px solid ${n.type === 'alert' ? '#ef4444' : '#10b981'}`
                  }}>
                    <div style={{ color: '#1e293b', fontWeight: 600 }}>{n.text}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge Profile (avatar + name + chevron) */}
        <div style={{ position: 'relative' }}>
          <div
            className="ssoma-user-badge"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.nombre || 'Usuario'}
              className="ssoma-user-avatar"
            />
            <div className="ssoma-user-info">
              <span className="ssoma-user-name">{user?.nombre ? user.nombre.replace('Ing. ', '') : 'Elm Flatley'}</span>
              <span className="ssoma-user-role">{user?.cargo || 'Jefe SSOMA'}</span>
            </div>
            <ChevronDown size={16} color="#94a3b8" />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '54px',
              width: '220px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
              border: '1px solid #edf2f7',
              padding: '8px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user?.nombre}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{user?.email}</div>
              </div>
              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 12px',
                  marginTop: '4px',
                  background: '#fef2f2',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
