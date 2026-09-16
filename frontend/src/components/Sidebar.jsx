import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  Leaf,
  GraduationCap,
  HardHat,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const { company } = useCompany();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidentes', label: 'Incidentes', icon: AlertTriangle },
    { id: 'inspecciones', label: 'Inspecciones', icon: ClipboardCheck },
    { id: 'iperc', label: 'Matriz IPERC', icon: ShieldAlert },
    { id: 'ambiental', label: 'Gestión Ambiental', icon: Leaf },
    { id: 'capacitaciones', label: 'Capacitaciones', icon: GraduationCap },
    { id: 'epp', label: 'Control EPP', icon: HardHat },
    { id: 'personal', label: 'Personal & Áreas', icon: Users },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <aside className="ssoma-sidebar">
      <div>
        {/* Brand Logo & Title */}
        <div className="ssoma-brand">
          <div className="ssoma-brand-logo" style={{ overflow: 'hidden', padding: 0 }}>
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <ShieldCheck size={26} color="#ffffff" />
            )}
          </div>
          <div className="ssoma-brand-title">
            {company?.nombre_comercial ? company.nombre_comercial.slice(0, 14) : 'SSOMA'}
            <span>{company?.rubro ? company.rubro.slice(0, 22) : 'Seguridad & Ambiente'}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="ssoma-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`ssoma-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={19} color={isActive ? '#10b981' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Logout */}
      <div className="ssoma-sidebar-footer">
        <button className="ssoma-logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
