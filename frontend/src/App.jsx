import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import Sidebar from './components/Sidebar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import IncidentesView from './views/IncidentesView';
import InspeccionesView from './views/InspeccionesView';
import IpercView from './views/IpercView';
import AmbientalView from './views/AmbientalView';
import CapacitacionesView from './views/CapacitacionesView';
import EppView from './views/EppView';
import PersonalView from './views/PersonalView';
import ConfiguracionView from './views/ConfiguracionView';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'incidentes':
        return <IncidentesView />;
      case 'inspecciones':
        return <InspeccionesView />;
      case 'iperc':
        return <IpercView />;
      case 'ambiental':
        return <AmbientalView />;
      case 'capacitaciones':
        return <CapacitacionesView />;
      case 'epp':
        return <EppView />;
      case 'personal':
        return <PersonalView />;
      case 'configuracion':
        return <ConfiguracionView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="ssoma-app-container">
      {/* Sidebar vertical izquierdo oscuro idéntico a la maqueta */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido principal según el módulo activo */}
      {renderActiveView()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <MainApp />
      </CompanyProvider>
    </AuthProvider>
  );
}
