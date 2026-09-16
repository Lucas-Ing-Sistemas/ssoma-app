import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  Building2,
  DollarSign,
  Database,
  RefreshCw,
  Shield,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Save,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Trash2,
  Lock,
  Users,
  UserPlus,
  Edit2,
  X,
  AlertCircle
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

export default function ConfiguracionView() {
  const { company, updateCompany, formatMoney, formatNumber, loadCompany } = useCompany();
  const { user } = useAuth();

  // Detección tolerante de Administrador (soporta 'admin', 'jefe', 'administrador' o correo 'admin@')
  const userRole = (user?.rol || '').toLowerCase();
  const userEmail = (user?.email || '').toLowerCase();

  const isAdmin = 
    userRole === 'admin' || 
    userRole === 'administrador' || 
    userRole.includes('jefe') || 
    userRole.includes('admin') ||
    userEmail.startsWith('admin@');

  const [activeTab, setActiveTab] = useState('empresa');

  // Si no es admin y de algún modo queda en 'usuarios', redirigir a 'empresa'
  useEffect(() => {
    if (!isAdmin && activeTab === 'usuarios') {
      setActiveTab('empresa');
    }
  }, [isAdmin, activeTab]);

  // Estados del Formulario de Empresa
  const [empresaForm, setEmpresaForm] = useState({ ...company });

  useEffect(() => {
    setEmpresaForm({ ...company });
  }, [company]);

  // Feedback Toast
  const [statusMessage, setStatusMessage] = useState(null);

  // Estados de Gestión de Usuarios
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormError, setUserFormError] = useState('');
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'supervisor',
    cargo: 'Supervisor SSOMA'
  });

  // Estados de Backup & Restore
  const [isExporting, setIsExporting] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restorePreview, setRestorePreview] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Estados de Reset / Nueva Empresa
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [limpiarPersonalYAreas, setLimpiarPersonalYAreas] = useState(false);
  const [nuevaEmpresaForm, setNuevaEmpresaForm] = useState({
    razon_social: '',
    ruc: '',
    rubro: 'Operaciones Industriales & Servicios'
  });
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setUsersList(data.data);
      } else {
        const resFallback = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/demo-users');
        const dataFallback = await resFallback.json();
        if (dataFallback.success) {
          setUsersList(dataFallback.users || []);
        }
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  // Guardar o Editar Usuario
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserFormError('');

    const url = editingUserId
      ? `https://ssoma-app-fbwe.onrender.com/api/auth/users/${editingUserId}`
      : 'https://ssoma-app-fbwe.onrender.com/api/auth/users';
    const method = editingUserId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();

      if (data.success) {
        showNotification('success', data.message);
        setShowUserModal(false);
        setEditingUserId(null);
        setUserForm({
          nombre: '',
          email: '',
          password: '',
          rol: 'supervisor',
          cargo: 'Supervisor SSOMA'
        });
        fetchUsers();
      } else {
        setUserFormError(data.message || 'Error al procesar usuario.');
      }
    } catch (err) {
      setUserFormError('Error de comunicación con el backend.');
    }
  };

  const handleOpenEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      nombre: u.nombre,
      email: u.email,
      password: '',
      rol: u.rol,
      cargo: u.cargo || ''
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${nombre}?`)) return;

    try {
      const res = await fetch(`https://ssoma-app-fbwe.onrender.com/api/auth/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        fetchUsers();
      } else {
        showNotification('error', data.message);
      }
    } catch (err) {
      showNotification('error', 'Error al eliminar usuario.');
    }
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    const result = await updateCompany(empresaForm);
    if (result.success) {
      showNotification('success', '¡Configuración guardada exitosamente!');
    } else {
      showNotification('error', result.message || 'Error al guardar la configuración.');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEmpresaForm({ ...empresaForm, logo_url: event.target.result });
      showNotification('success', 'Logotipo cargado.');
    };
    reader.readAsDataURL(file);
  };

  const logoPresets = [
    { label: 'Minería & Energía', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=150&auto=format&fit=crop&q=80' },
    { label: 'Construcción Civil', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=150&auto=format&fit=crop&q=80' },
    { label: 'Manufactura Pesada', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80' },
    { label: 'Eco & Sostenible', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80' }
  ];

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/export');
      if (!res.ok) throw new Error('Fallo al generar archivo de respaldo.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_ssoma_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('success', 'Copia de seguridad descargada exitosamente en formato JSON.');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.tablas) {
          throw new Error('El archivo no contiene la clave "tablas" requerida.');
        }
        setRestoreFile(parsed);
        setRestorePreview({
          nombre: file.name,
          tamano: (file.size / 1024).toFixed(1) + ' KB',
          sistema: parsed.metadata?.sistema || 'SSOMA Backup',
          fecha: parsed.metadata?.fechaGeneracion || 'Fecha no especificada',
          tablas: Object.keys(parsed.tablas).length,
          totalRegistros: parsed.metadata?.totalRegistros || 'No calculado'
        });
      } catch (err) {
        showNotification('error', 'El archivo no es un JSON de respaldo válido.');
        setRestoreFile(null);
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!restoreFile) return;
    setIsRestoring(true);
    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: restoreFile })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setShowRestoreModal(false);
        setRestoreFile(null);
        setRestorePreview(null);
        loadCompany();
      } else {
        showNotification('error', data.message);
      }
    } catch (err) {
      showNotification('error', 'Error al procesar la restauración.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExecuteReset = async () => {
    if (resetConfirmText !== 'CONFIRMAR RESET') {
      showNotification('error', 'Debe escribir exactamente "CONFIRMAR RESET".');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/sistema/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmText: resetConfirmText,
          limpiarPersonalYAreas,
          nuevaEmpresa: nuevaEmpresaForm.razon_social ? nuevaEmpresaForm : null
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setShowResetModal(false);
        setResetConfirmText('');
        loadCompany();
      } else {
        showNotification('error', data.message);
      }
    } catch (err) {
      showNotification('error', 'Error ejecutando puesta a cero del sistema.');
    } finally {
      setIsResetting(false);
    }
  };

  // Lista de pestañas: 'usuarios' solo se incluye si el usuario autenticado es administrador
  const tabsDisponibles = [
    { id: 'empresa', label: 'Datos de la Empresa', icon: Building2 },
    ...(isAdmin ? [{ id: 'usuarios', label: 'Usuarios & Accesos', icon: Users }] : []),
    { id: 'moneda', label: 'Moneda & Formatos', icon: DollarSign },
    { id: 'backup', label: 'Copias de Seguridad & Restauración', icon: Database },
    { id: 'reset', label: 'Puesta a Cero / Nueva Empresa', icon: RefreshCw },
    { id: 'diagnostico', label: 'Diagnóstico & Normativas', icon: Shield }
  ];

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Configuración del Sistema & Empresa" />

        {/* Notificación Toast Flotante */}
        {statusMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            background: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.3s ease'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Barra de Pestañas Principales */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '16px',
          border: '1px solid #edf2f7',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto'
        }}>
          {tabsDisponibles.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#0d5f3d' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={18} color={isActive ? '#c9a227' : '#94a3b8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DATOS DE LA EMPRESA & LOGOTIPO */}
        {activeTab === 'empresa' && (
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: '24px',
              background: '#ffffff',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid #edf2f7',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Logotipo Institucional
                </span>

                <div style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '20px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {empresaForm.logo_url ? (
                    <img
                      src={empresaForm.logo_url}
                      alt="Logo Empresa"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150'; }}
                    />
                  ) : (
                    <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={36} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sin Logotipo</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#0d5f3d',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    <Upload size={16} />
                    <span>Subir Archivo</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  </label>

                  {empresaForm.logo_url && (
                    <button
                      type="button"
                      onClick={() => setEmpresaForm({ ...empresaForm, logo_url: '' })}
                      style={{
                        padding: '8px 12px',
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Quitar logotipo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
                  <label className="ssoma-label">O ingresar URL de Imagen</label>
                  <input
                    type="text"
                    className="ssoma-input"
                    style={{ fontSize: '0.78rem' }}
                    placeholder="https://ejemplo.com/logo.png"
                    value={empresaForm.logo_url || ''}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, logo_url: e.target.value })}
                  />
                </div>

                <div style={{ width: '100%', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Logos de Ejemplo por Rubro:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    {logoPresets.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEmpresaForm({ ...empresaForm, logo_url: p.url })}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  Información Legal & Operativa
                </h3>

                <div className="ssoma-form-grid">
                  <div className="ssoma-form-group full">
                    <label className="ssoma-label">Razón Social Oficial *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      value={empresaForm.razon_social || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, razon_social: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">RUC / NIF / Tax ID *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      value={empresaForm.ruc || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, ruc: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Nombre Comercial / Siglas</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.nombre_comercial || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_comercial: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Rubro / Sector Industrial</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      placeholder="Ej. Minería, Construcción, Manufactura..."
                      value={empresaForm.rubro || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, rubro: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Sitio Web</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.sitio_web || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, sitio_web: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group full">
                    <label className="ssoma-label">Dirección Fiscal / Sede Principal</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.direccion || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Teléfono Central</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.telefono || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Correo Electrónico de Contacto</label>
                    <input
                      type="email"
                      className="ssoma-input"
                      value={empresaForm.email || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Representante Legal / Gerente General</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.representante_legal || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, representante_legal: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Responsable / Jefe SSOMA Corporativo</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.responsable_ssoma || ''}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, responsable_ssoma: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="ssoma-btn ssoma-btn-primary"
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    <Save size={18} />
                    <span>Guardar Datos de la Empresa</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GESTIÓN DE USUARIOS (SOLO ADMINISTRADOR / JEFATURA) */}
        {activeTab === 'usuarios' && isAdmin && (
          <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#132219', margin: 0 }}>
                  Usuarios con Acceso a la Plataforma
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#53695c', margin: '4px 0 0 0' }}>
                  Control de credenciales, roles y autorizaciones (exclusivo para el Administrador)
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  setUserForm({
                    nombre: '',
                    email: '',
                    password: '',
                    rol: 'supervisor',
                    cargo: 'Supervisor SSOMA'
                  });
                  setUserFormError('');
                  setShowUserModal(true);
                }}
                style={{
                  backgroundColor: '#0d5f3d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 95, 61, 0.25)'
                }}
              >
                <UserPlus size={18} />
                <span>+ Nuevo Usuario</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ssoma-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo Electrónico</th>
                    <th>Cargo Funcional</th>
                    <th>Rol en Plataforma</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#899e92' }}>
                        Cargando usuarios del sistema...
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#899e92' }}>
                        No se encontraron cuentas activas en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={u.nombre}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #d9c7a3' }}
                            />
                            <strong style={{ color: '#132219', fontSize: '0.88rem' }}>{u.nombre}</strong>
                          </div>
                        </td>
                        <td style={{ color: '#0d5f3d', fontWeight: 600 }}>{u.email}</td>
                        <td style={{ color: '#334155' }}>{u.cargo || '—'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: u.rol === 'admin' ? '#eaf4ef' : (u.rol === 'auditor' ? '#f6f1e8' : '#e0e7ff'),
                            color: u.rol === 'admin' ? '#0d5f3d' : (u.rol === 'auditor' ? '#c9a227' : '#4338ca'),
                            border: `1px solid ${u.rol === 'admin' ? '#a3cfbb' : (u.rol === 'auditor' ? '#d9c7a3' : '#c7d2fe')}`
                          }}>
                            {u.rol}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: u.activo ? '#dcfce7' : '#fee2e2',
                            color: u.activo ? '#15803d' : '#b91c1c'
                          }}>
                            {u.activo ? '● Activo' : '○ Inactivo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              style={{
                                background: '#f6f1e8',
                                border: '1px solid #d9c7a3',
                                color: '#8c764e',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                              title="Editar usuario o restablecer contraseña"
                            >
                              <Edit2 size={13} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.nombre)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                padding: '6px 8px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Eliminar usuario"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MONEDA & FORMATOS */}
        {activeTab === 'moneda' && (
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '24px',
              background: '#ffffff',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid #edf2f7',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Moneda y Formateo Numérico
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Personalice la divisa utilizada en costos de incidentes, compras de EPP y métricas cuantificables.
                  </p>
                </div>

                <div>
                  <label className="ssoma-label">Selección Rápida de Moneda</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { simbolo: 'S/.', codigo: 'PEN', label: 'Soles (S/.)' },
                      { simbolo: '$', codigo: 'USD', label: 'Dólares ($)' },
                      { simbolo: '€', codigo: 'EUR', label: 'Euros (€)' },
                      { simbolo: '$', codigo: 'MXN', label: 'Pesos MXN ($)' },
                      { simbolo: '$', codigo: 'COP', label: 'Pesos COP ($)' }
                    ].map((m, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEmpresaForm({ ...empresaForm, moneda_simbolo: m.simbolo, moneda_codigo: m.codigo })}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: `1px solid ${empresaForm.moneda_codigo === m.codigo ? '#0d5f3d' : '#cbd5e1'}`,
                          background: empresaForm.moneda_codigo === m.codigo ? '#eaf4ef' : '#ffffff',
                          color: empresaForm.moneda_codigo === m.codigo ? '#0d5f3d' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ssoma-form-grid">
                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Símbolo Monetario</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.moneda_simbolo || 'S/.'}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_simbolo: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Código ISO Divisa</label>
                    <input
                      type="text"
                      className="ssoma-input"
                      value={empresaForm.moneda_codigo || 'PEN'}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_codigo: e.target.value })}
                    />
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Separador de Decimales</label>
                    <select
                      className="ssoma-select"
                      value={empresaForm.separador_decimales || '.'}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, separador_decimales: e.target.value })}
                    >
                      <option value=".">Punto ( . ) — Estándar Internacional / Perú / EE.UU.</option>
                      <option value=",">Coma ( , ) — Estándar Europeo / Sudamericano</option>
                    </select>
                  </div>

                  <div className="ssoma-form-group">
                    <label className="ssoma-label">Separador de Miles</label>
                    <select
                      className="ssoma-select"
                      value={empresaForm.separador_miles || ','}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, separador_miles: e.target.value })}
                    >
                      <option value=",">Coma ( , )</option>
                      <option value=".">Punto ( . )</option>
                      <option value=" ">Espacio en blanco ( )</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Metas Institucionales SSOMA
                  </h4>
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Días Meta sin Accidentes</label>
                      <input
                        type="number"
                        className="ssoma-input"
                        value={empresaForm.dias_meta_sin_accidentes || 180}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, dias_meta_sin_accidentes: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Índice Frecuencia (IF) Límite</label>
                      <input
                        type="number"
                        step="0.01"
                        className="ssoma-input"
                        value={empresaForm.limite_frecuencia_if || 2.00}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, limite_frecuencia_if: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="ssoma-btn ssoma-btn-primary"
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    <Save size={18} />
                    <span>Guardar Moneda & Formatos</span>
                  </button>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(145deg, #0d5f3d, #132219)',
                color: '#ffffff',
                padding: '24px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid #d9c7a3'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9a227' }}>
                  <Sparkles size={20} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Simulador en Vivo
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#d9c7a3' }}>
                  Así se visualizarán los montos y unidades en los reportes, gráficos y tablas del sistema:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Costo Estimado de Incidente</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c9a227', marginTop: '4px' }}>
                      {empresaForm.moneda_simbolo || 'S/.'} {
                        '12' + (empresaForm.separador_miles || ',') + '450' + (empresaForm.separador_decimales || '.') + '00'
                      }
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Presupuesto EPP / Kardex</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                      {empresaForm.moneda_simbolo || 'S/.'} {
                        '8' + (empresaForm.separador_miles || ',') + '920' + (empresaForm.separador_decimales || '.') + '50'
                      }
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Residuos Gestionados (kg)</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                      {
                        '1' + (empresaForm.separador_miles || ',') + '890' + (empresaForm.separador_decimales || '.') + '50'
                      } kg
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: BACKUP */}
        {activeTab === 'backup' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #edf2f7',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#eaf4ef',
                    color: '#0d5f3d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Download size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      Generar Copia de Seguridad
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Exportación íntegra de la base de datos MySQL
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  Descarga un archivo estructurado con la totalidad de tablas del sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0d5f3d, #14744d)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(13, 95, 61, 0.3)'
                }}
              >
                <Download size={20} />
                <span>{isExporting ? 'Generando...' : '⬇ Descargar Respaldo JSON'}</span>
              </button>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #edf2f7',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#f6f1e8',
                    color: '#c9a227',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      Restaurar Copia de Seguridad
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Recuperación de datos desde archivo
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept=".json"
                    id="restoreFileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="restoreFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={28} color="#c9a227" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      Seleccione archivo .json
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={!restoreFile || isRestoring}
                onClick={() => setShowRestoreModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: !restoreFile ? '#94a3b8' : 'linear-gradient(135deg, #c9a227, #b08d1f)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: !restoreFile ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={20} />
                <span>Restaurar Base de Datos</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: RESET */}
        {activeTab === 'reset' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #fee2e2',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '18px 22px',
              borderRadius: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b'
            }}>
              <AlertTriangle size={32} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Zona Crítica: Puesta a Cero para Nueva Empresa
                </h3>
                <p style={{ fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5 }}>
                  Esta acción eliminará registros operacionales preservando el usuario administrador.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
              <input
                type="text"
                placeholder="Escriba CONFIRMAR RESET"
                className="ssoma-input"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
              />
              <button
                type="button"
                disabled={resetConfirmText !== 'CONFIRMAR RESET' || isResetting}
                onClick={() => setShowResetModal(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: resetConfirmText === 'CONFIRMAR RESET' ? '#e11d48' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: resetConfirmText === 'CONFIRMAR RESET' ? 'pointer' : 'not-allowed'
                }}
              >
                Resetear Sistema
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: DIAGNÓSTICO */}
        {activeTab === 'diagnostico' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #edf2f7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#eaf4ef',
                  color: '#0d5f3d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Database size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Servidor MySQL
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Conexión activa a base de datos de producción</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Host:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>localhost</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#eaf4ef', borderRadius: '10px', color: '#0d5f3d', fontWeight: 700 }}>
                  <span>Estado:</span>
                  <span>🟢 Conectado y Operativo (13 tablas)</span>
                </div>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #edf2f7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#f6f1e8',
                  color: '#c9a227',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Estándares & Normativas SSOMA
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Marcos de gestión y cumplimiento legal</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>ISO 45001:2018 & ISO 14001:2015</div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Ley N° 29783 & D.S. 005-2012-TR</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear / Editar Usuario */}
        {showUserModal && (
          <div className="ssoma-modal-overlay" onClick={() => setShowUserModal(false)}>
            <div 
              className="ssoma-modal" 
              style={{ maxWidth: '480px', borderRadius: '20px', border: '1px solid #d9c7a3' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#eaf4ef', color: '#0d5f3d', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
                      {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario del Sistema'}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
                      {editingUserId ? 'Actualizar permisos o contraseña' : 'Creación de credenciales de acceso'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowUserModal(false)}
                  style={{ background: '#f6f1e8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#53695c' }}
                >
                  <X size={16} />
                </button>
              </div>

              {userFormError && (
                <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                  <AlertCircle size={17} />
                  <span>{userFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveUser}>
                <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                  <div>
                    <label className="ssoma-label">Nombres y Apellidos *</label>
                    <input
                      type="text"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={userForm.nombre}
                      onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                      placeholder="Ej: Lic. Patricia Solís"
                    />
                  </div>

                  <div>
                    <label className="ssoma-label">Correo Electrónico (Login) *</label>
                    <input
                      type="email"
                      required
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="usuario@ssoma.com"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="ssoma-label">Rol en el Sistema *</label>
                      <select
                        required
                        className="ssoma-select"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={userForm.rol}
                        onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                      >
                        <option value="admin">Administrador (Total)</option>
                        <option value="supervisor">Supervisor de Campo</option>
                        <option value="auditor">Auditor Trinorma</option>
                      </select>
                    </div>

                    <div>
                      <label className="ssoma-label">Cargo Institucional</label>
                      <input
                        type="text"
                        className="ssoma-input"
                        style={{ width: '100%', marginTop: '4px' }}
                        value={userForm.cargo}
                        onChange={(e) => setUserForm({ ...userForm, cargo: e.target.value })}
                        placeholder="Ej: Auditor Trinorma ISO"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ssoma-label">
                      {editingUserId ? 'Nueva Contraseña (en blanco para mantener)' : 'Contraseña de Acceso *'}
                    </label>
                    <input
                      type="password"
                      required={!editingUserId}
                      className="ssoma-input"
                      style={{ width: '100%', marginTop: '4px' }}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUserId ? '••••••••' : 'Mínimo 6 caracteres'}
                    />
                  </div>
                </div>

                <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowUserModal(false)}>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="ssoma-btn ssoma-btn-primary" 
                    style={{ backgroundColor: '#0d5f3d' }}
                  >
                    {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Restauración */}
        {showRestoreModal && (
          <div className="ssoma-modal-overlay" onClick={() => setShowRestoreModal(false)}>
            <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header" style={{ background: '#0d5f3d', color: '#fff' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  ¿Confirmar Restauración de Base de Datos?
                </h3>
                <button onClick={() => setShowRestoreModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  Esta acción sobreescribirá las tablas existentes con el archivo <strong>{restorePreview?.nombre}</strong>.
                </p>
              </div>
              <div className="ssoma-modal-footer">
                <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowRestoreModal(false)}>Cancelar</button>
                <button
                  className="ssoma-btn ssoma-btn-primary"
                  style={{ background: '#0d5f3d' }}
                  disabled={isRestoring}
                  onClick={handleExecuteRestore}
                >
                  {isRestoring ? 'Restaurando...' : 'Sí, Restaurar Ahora'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Reset */}
        {showResetModal && (
          <div className="ssoma-modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header" style={{ background: '#e11d48', color: '#fff' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  ⚠️ Confirmación Final de Reset
                </h3>
                <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  ¿Está absolutamente seguro de proceder con el vaciado del sistema?
                </p>
              </div>
              <div className="ssoma-modal-footer">
                <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowResetModal(false)}>Cancelar</button>
                <button
                  className="ssoma-btn"
                  style={{ background: '#e11d48', color: '#fff', fontWeight: 800, border: 'none' }}
                  disabled={isResetting}
                  onClick={handleExecuteReset}
                >
                  {isResetting ? 'Vaciando registros...' : 'Confirmar y Resetear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




















// import React, { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import {
//   Building2,
//   DollarSign,
//   Database,
//   RefreshCw,
//   Shield,
//   Upload,
//   Download,
//   CheckCircle2,
//   AlertTriangle,
//   FileCheck,
//   Save,
//   Image as ImageIcon,
//   Sparkles,
//   ArrowRight,
//   Trash2,
//   Lock,
//   Users,
//   UserPlus,
//   Edit2,
//   X,
//   AlertCircle
// } from 'lucide-react';
// import { useCompany } from '../context/CompanyContext';

// export default function ConfiguracionView() {
//   const { company, updateCompany, formatMoney, formatNumber, loadCompany } = useCompany();

//   const [activeTab, setActiveTab] = useState('empresa'); // 'empresa' | 'usuarios' | 'moneda' | 'backup' | 'reset' | 'diagnostico'

//   // Estados del Formulario de Empresa
//   const [empresaForm, setEmpresaForm] = useState({ ...company });

//   // Sincronizar si cambia el contexto
//   useEffect(() => {
//     setEmpresaForm({ ...company });
//   }, [company]);

//   // Feedback Toast
//   const [statusMessage, setStatusMessage] = useState(null);

//   // Estados de Gestión de Usuarios
//   const [usersList, setUsersList] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [userFormError, setUserFormError] = useState('');
//   const [userForm, setUserForm] = useState({
//     nombre: '',
//     email: '',
//     password: '',
//     rol: 'supervisor',
//     cargo: 'Supervisor SSOMA'
//   });

//   // Estados de Backup & Restore
//   const [isExporting, setIsExporting] = useState(false);
//   const [restoreFile, setRestoreFile] = useState(null);
//   const [restorePreview, setRestorePreview] = useState(null);
//   const [isRestoring, setIsRestoring] = useState(false);
//   const [showRestoreModal, setShowRestoreModal] = useState(false);

//   // Estados de Reset / Nueva Empresa
//   const [resetConfirmText, setResetConfirmText] = useState('');
//   const [limpiarPersonalYAreas, setLimpiarPersonalYAreas] = useState(false);
//   const [nuevaEmpresaForm, setNuevaEmpresaForm] = useState({
//     razon_social: '',
//     ruc: '',
//     rubro: 'Operaciones Industriales & Servicios'
//   });
//   const [isResetting, setIsResetting] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);

//   const showNotification = (type, text) => {
//     setStatusMessage({ type, text });
//     setTimeout(() => setStatusMessage(null), 5000);
//   };

//   // Cargar lista de usuarios del sistema
//   const fetchUsers = async () => {
//     setLoadingUsers(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/users');
//       const data = await res.json();
//       if (data.success) {
//         setUsersList(data.data);
//       }
//     } catch (err) {
//       console.error('Error cargando usuarios:', err);
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === 'usuarios') {
//       fetchUsers();
//     }
//   }, [activeTab]);

//   // Guardar o Editar Usuario
//   const handleSaveUser = async (e) => {
//     e.preventDefault();
//     setUserFormError('');

//     const url = editingUserId
//       ? `https://ssoma-app-fbwe.onrender.com/api/auth/users/${editingUserId}`
//       : 'https://ssoma-app-fbwe.onrender.com/api/auth/users';
//     const method = editingUserId ? 'PUT' : 'POST';

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(userForm)
//       });
//       const data = await res.json();

//       if (data.success) {
//         showNotification('success', data.message);
//         setShowUserModal(false);
//         setEditingUserId(null);
//         setUserForm({
//           nombre: '',
//           email: '',
//           password: '',
//           rol: 'supervisor',
//           cargo: 'Supervisor SSOMA'
//         });
//         fetchUsers();
//       } else {
//         setUserFormError(data.message || 'Error al procesar el usuario.');
//       }
//     } catch (err) {
//       setUserFormError('Error de comunicación con el backend.');
//     }
//   };

//   // Abrir Modal en modo edición
//   const handleOpenEditUser = (user) => {
//     setEditingUserId(user.id);
//     setUserForm({
//       nombre: user.nombre,
//       email: user.email,
//       password: '', // Si se deja vacío en PUT no actualiza el hash
//       rol: user.rol,
//       cargo: user.cargo || ''
//     });
//     setUserFormError('');
//     setShowUserModal(true);
//   };

//   // Eliminar Usuario
//   const handleDeleteUser = async (id, nombre) => {
//     if (!window.confirm(`¿Seguro que deseas eliminar al usuario ${nombre}?`)) return;

//     try {
//       const res = await fetch(`https://ssoma-app-fbwe.onrender.com/api/auth/users/${id}`, {
//         method: 'DELETE'
//       });
//       const data = await res.json();
//       if (data.success) {
//         showNotification('success', data.message);
//         fetchUsers();
//       } else {
//         showNotification('error', data.message);
//       }
//     } catch (err) {
//       showNotification('error', 'Error al eliminar usuario.');
//     }
//   };

//   // Guardar datos de Empresa o Moneda
//   const handleSaveConfig = async (e) => {
//     if (e) e.preventDefault();
//     const result = await updateCompany(empresaForm);
//     if (result.success) {
//       showNotification('success', '¡Configuración guardada exitosamente!');
//     } else {
//       showNotification('error', result.message || 'Error al guardar la configuración.');
//     }
//   };

//   // Manejador de subida de imagen de logo (convertir a Base64)
//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       showNotification('error', 'La imagen no debe superar los 5MB.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setEmpresaForm({ ...empresaForm, logo_url: event.target.result });
//       showNotification('success', 'Logotipo cargado y previsualizado.');
//     };
//     reader.readAsDataURL(file);
//   };

//   const logoPresets = [
//     { label: 'Minería & Energía', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Construcción Civil', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Manufactura Pesada', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Eco & Sostenible', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80' }
//   ];

//   // Descarga de Copia de Seguridad
//   const handleExportBackup = async () => {
//     setIsExporting(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/export');
//       if (!res.ok) throw new Error('Fallo al generar archivo de respaldo.');

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `backup_ssoma_${new Date().toISOString().slice(0, 10)}.json`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//       showNotification('success', 'Copia de seguridad descargada exitosamente en formato JSON.');
//     } catch (err) {
//       showNotification('error', err.message);
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   // Manejar selección de archivo de restauración
//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const parsed = JSON.parse(event.target.result);
//         if (!parsed.tablas) {
//           throw new Error('El archivo no contiene la clave "tablas" requerida.');
//         }
//         setRestoreFile(parsed);
//         setRestorePreview({
//           nombre: file.name,
//           tamano: (file.size / 1024).toFixed(1) + ' KB',
//           sistema: parsed.metadata?.sistema || 'SSOMA Backup',
//           fecha: parsed.metadata?.fechaGeneracion || 'Fecha no especificada',
//           tablas: Object.keys(parsed.tablas).length,
//           totalRegistros: parsed.metadata?.totalRegistros || 'No calculado'
//         });
//       } catch (err) {
//         showNotification('error', 'El archivo no es un JSON de respaldo válido.');
//         setRestoreFile(null);
//         setRestorePreview(null);
//       }
//     };
//     reader.readAsText(file);
//   };

//   // Ejecutar Restauración
//   const handleExecuteRestore = async () => {
//     if (!restoreFile) return;
//     setIsRestoring(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/restore', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ backup: restoreFile })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showNotification('success', data.message);
//         setShowRestoreModal(false);
//         setRestoreFile(null);
//         setRestorePreview(null);
//         loadCompany();
//       } else {
//         showNotification('error', data.message);
//       }
//     } catch (err) {
//       showNotification('error', 'Error al procesar la restauración.');
//     } finally {
//       setIsRestoring(false);
//     }
//   };

//   // Ejecutar Reset para Nueva Empresa
//   const handleExecuteReset = async () => {
//     if (resetConfirmText !== 'CONFIRMAR RESET') {
//       showNotification('error', 'Debe escribir exactamente "CONFIRMAR RESET".');
//       return;
//     }

//     setIsResetting(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/sistema/reset', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           confirmText: resetConfirmText,
//           limpiarPersonalYAreas,
//           nuevaEmpresa: nuevaEmpresaForm.razon_social ? nuevaEmpresaForm : null
//         })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showNotification('success', data.message);
//         setShowResetModal(false);
//         setResetConfirmText('');
//         loadCompany();
//       } else {
//         showNotification('error', data.message);
//       }
//     } catch (err) {
//       showNotification('error', 'Error ejecutando puesta a cero del sistema.');
//     } finally {
//       setIsResetting(false);
//     }
//   };

//   return (
//     <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
//       <main className="ssoma-main-panel" style={{ width: '100%' }}>
//         <Header title="Configuración del Sistema & Empresa" />

//         {/* Notificación Toast Flotante */}
//         {statusMessage && (
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             padding: '12px 18px',
//             borderRadius: '12px',
//             background: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
//             color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
//             border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
//             fontSize: '0.88rem',
//             fontWeight: 700,
//             boxShadow: 'var(--shadow-md)',
//             animation: 'fadeIn 0.3s ease'
//           }}>
//             {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
//             <span>{statusMessage.text}</span>
//           </div>
//         )}

//         {/* Barra de Pestañas Principales */}
//         <div style={{
//           display: 'flex',
//           gap: '8px',
//           background: '#ffffff',
//           padding: '8px',
//           borderRadius: '16px',
//           border: '1px solid #edf2f7',
//           boxShadow: 'var(--shadow-sm)',
//           overflowX: 'auto'
//         }}>
//           {[
//             { id: 'empresa', label: 'Datos de la Empresa', icon: Building2 },
//             { id: 'usuarios', label: 'Usuarios & Accesos', icon: Users },
//             { id: 'moneda', label: 'Moneda & Formatos', icon: DollarSign },
//             { id: 'backup', label: 'Copias de Seguridad & Restauración', icon: Database },
//             { id: 'reset', label: 'Puesta a Cero / Nueva Empresa', icon: RefreshCw },
//             { id: 'diagnostico', label: 'Diagnóstico & Normativas', icon: Shield }
//           ].map((tab) => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                   padding: '10px 18px',
//                   borderRadius: '12px',
//                   border: 'none',
//                   background: isActive ? '#0d5f3d' : 'transparent',
//                   color: isActive ? '#ffffff' : '#64748b',
//                   fontSize: '0.84rem',
//                   fontWeight: 700,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 <Icon size={18} color={isActive ? '#c9a227' : '#94a3b8'} />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* ========================================================= */}
//         {/* TAB 1: DATOS DE LA EMPRESA & LOGOTIPO                     */}
//         {/* ========================================================= */}
//         {activeTab === 'empresa' && (
//           <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: '320px 1fr',
//               gap: '24px',
//               background: '#ffffff',
//               padding: '28px',
//               borderRadius: '20px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)'
//             }}>
//               {/* Columna Izquierda: Logo y Branding */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
//                 <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
//                   Logotipo Institucional
//                 </span>

//                 <div style={{
//                   width: '160px',
//                   height: '160px',
//                   borderRadius: '20px',
//                   border: '2px dashed #cbd5e1',
//                   background: '#f8fafc',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   overflow: 'hidden',
//                   position: 'relative',
//                   boxShadow: 'var(--shadow-sm)'
//                 }}>
//                   {empresaForm.logo_url ? (
//                     <img
//                       src={empresaForm.logo_url}
//                       alt="Logo Empresa"
//                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150'; }}
//                     />
//                   ) : (
//                     <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
//                       <ImageIcon size={36} />
//                       <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sin Logotipo</span>
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
//                   <label style={{
//                     flex: 1,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     background: '#0d5f3d',
//                     color: '#fff',
//                     borderRadius: '10px',
//                     fontSize: '0.78rem',
//                     fontWeight: 700,
//                     cursor: 'pointer'
//                   }}>
//                     <Upload size={16} />
//                     <span>Subir Archivo</span>
//                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
//                   </label>

//                   {empresaForm.logo_url && (
//                     <button
//                       type="button"
//                       onClick={() => setEmpresaForm({ ...empresaForm, logo_url: '' })}
//                       style={{
//                         padding: '8px 12px',
//                         background: '#fee2e2',
//                         color: '#ef4444',
//                         border: 'none',
//                         borderRadius: '10px',
//                         fontSize: '0.78rem',
//                         fontWeight: 700,
//                         cursor: 'pointer'
//                       }}
//                       title="Quitar logotipo"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   )}
//                 </div>

//                 <div style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
//                   <label className="ssoma-label">O ingresar URL de Imagen</label>
//                   <input
//                     type="text"
//                     className="ssoma-input"
//                     style={{ fontSize: '0.78rem' }}
//                     placeholder="https://ejemplo.com/logo.png"
//                     value={empresaForm.logo_url || ''}
//                     onChange={(e) => setEmpresaForm({ ...empresaForm, logo_url: e.target.value })}
//                   />
//                 </div>

//                 {/* Presets Rápidos */}
//                 <div style={{ width: '100%', textAlign: 'left' }}>
//                   <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
//                     Logos de Ejemplo por Rubro:
//                   </span>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
//                     {logoPresets.map((p, i) => (
//                       <button
//                         key={i}
//                         type="button"
//                         onClick={() => setEmpresaForm({ ...empresaForm, logo_url: p.url })}
//                         style={{
//                           padding: '6px',
//                           background: '#f1f5f9',
//                           border: '1px solid #e2e8f0',
//                           borderRadius: '8px',
//                           fontSize: '0.68rem',
//                           fontWeight: 600,
//                           cursor: 'pointer',
//                           color: '#334155'
//                         }}
//                       >
//                         {p.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Columna Derecha: Formulario de Datos */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
//                   Información Legal & Operativa
//                 </h3>

//                 <div className="ssoma-form-grid">
//                   <div className="ssoma-form-group full">
//                     <label className="ssoma-label">Razón Social Oficial *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       value={empresaForm.razon_social || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, razon_social: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">RUC / NIF / Tax ID *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       value={empresaForm.ruc || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, ruc: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Nombre Comercial / Siglas</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.nombre_comercial || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_comercial: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Rubro / Sector Industrial</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       placeholder="Ej. Minería, Construcción, Manufactura..."
//                       value={empresaForm.rubro || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, rubro: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Sitio Web</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.sitio_web || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, sitio_web: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group full">
//                     <label className="ssoma-label">Dirección Fiscal / Sede Principal</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.direccion || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Teléfono Central</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.telefono || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Correo Electrónico de Contacto</label>
//                     <input
//                       type="email"
//                       className="ssoma-input"
//                       value={empresaForm.email || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Representante Legal / Gerente General</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.representante_legal || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, representante_legal: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Responsable / Jefe SSOMA Corporativo</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.responsable_ssoma || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, responsable_ssoma: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
//                   <button 
//                     type="submit" 
//                     className="ssoma-btn ssoma-btn-primary"
//                     style={{ backgroundColor: '#0d5f3d' }}
//                   >
//                     <Save size={18} />
//                     <span>Guardar Datos de la Empresa</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 2: GESTIÓN DE USUARIOS Y ACCESOS DEL SISTEMA          */}
//         {/* ========================================================= */}
//         {activeTab === 'usuarios' && (
//           <div className="ssoma-table-card" style={{ border: '1px solid #e5ece7', borderRadius: '20px', padding: '24px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
//               <div>
//                 <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#132219', margin: 0 }}>
//                   Usuarios con Acceso a la Plataforma
//                 </h3>
//                 <p style={{ fontSize: '0.78rem', color: '#53695c', margin: '4px 0 0 0' }}>
//                   Control de credenciales, niveles de autorización y permisos del sistema
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setEditingUserId(null);
//                   setUserForm({
//                     nombre: '',
//                     email: '',
//                     password: '',
//                     rol: 'supervisor',
//                     cargo: 'Supervisor SSOMA'
//                   });
//                   setUserFormError('');
//                   setShowUserModal(true);
//                 }}
//                 style={{
//                   backgroundColor: '#0d5f3d',
//                   color: '#ffffff',
//                   border: 'none',
//                   borderRadius: '12px',
//                   padding: '10px 18px',
//                   fontSize: '0.85rem',
//                   fontWeight: 700,
//                   display: 'inline-flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                   cursor: 'pointer',
//                   boxShadow: '0 4px 12px rgba(13, 95, 61, 0.25)'
//                 }}
//               >
//                 <UserPlus size={18} />
//                 <span>+ Nuevo Usuario</span>
//               </button>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//               <table className="ssoma-table">
//                 <thead>
//                   <tr>
//                     <th>Usuario</th>
//                     <th>Correo Electrónico</th>
//                     <th>Cargo Funcional</th>
//                     <th>Rol en Plataforma</th>
//                     <th>Estado</th>
//                     <th style={{ textAlign: 'center' }}>Acciones</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loadingUsers ? (
//                     <tr>
//                       <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#899e92' }}>
//                         Cargando usuarios...
//                       </td>
//                     </tr>
//                   ) : usersList.length === 0 ? (
//                     <tr>
//                       <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#899e92' }}>
//                         No se registraron usuarios adicionales.
//                       </td>
//                     </tr>
//                   ) : (
//                     usersList.map((u) => (
//                       <tr key={u.id}>
//                         <td>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                             <img
//                               src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
//                               alt={u.nombre}
//                               style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #d9c7a3' }}
//                             />
//                             <strong style={{ color: '#132219', fontSize: '0.88rem' }}>{u.nombre}</strong>
//                           </div>
//                         </td>
//                         <td style={{ color: '#0d5f3d', fontWeight: 600 }}>{u.email}</td>
//                         <td style={{ color: '#334155' }}>{u.cargo || '—'}</td>
//                         <td>
//                           <span style={{
//                             padding: '4px 10px',
//                             borderRadius: '20px',
//                             fontSize: '0.74rem',
//                             fontWeight: 800,
//                             textTransform: 'uppercase',
//                             background: u.rol === 'admin' ? '#eaf4ef' : (u.rol === 'auditor' ? '#f6f1e8' : '#e0e7ff'),
//                             color: u.rol === 'admin' ? '#0d5f3d' : (u.rol === 'auditor' ? '#c9a227' : '#4338ca'),
//                             border: `1px solid ${u.rol === 'admin' ? '#a3cfbb' : (u.rol === 'auditor' ? '#d9c7a3' : '#c7d2fe')}`
//                           }}>
//                             {u.rol}
//                           </span>
//                         </td>
//                         <td>
//                           <span style={{
//                             padding: '3px 8px',
//                             borderRadius: '6px',
//                             fontSize: '0.72rem',
//                             fontWeight: 700,
//                             background: u.activo ? '#dcfce7' : '#fee2e2',
//                             color: u.activo ? '#15803d' : '#b91c1c'
//                           }}>
//                             {u.activo ? '● Activo' : '○ Inactivo'}
//                           </span>
//                         </td>
//                         <td style={{ textAlign: 'center' }}>
//                           <div style={{ display: 'inline-flex', gap: '8px' }}>
//                             <button
//                               type="button"
//                               onClick={() => handleOpenEditUser(u)}
//                               style={{
//                                 background: '#f6f1e8',
//                                 border: '1px solid #d9c7a3',
//                                 color: '#8c764e',
//                                 cursor: 'pointer',
//                                 borderRadius: '8px',
//                                 padding: '6px 10px',
//                                 display: 'inline-flex',
//                                 alignItems: 'center',
//                                 gap: '4px',
//                                 fontSize: '0.75rem',
//                                 fontWeight: 700
//                               }}
//                               title="Editar usuario o contraseña"
//                             >
//                               <Edit2 size={13} />
//                               Editar
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() => handleDeleteUser(u.id, u.nombre)}
//                               style={{
//                                 background: '#fef2f2',
//                                 border: '1px solid #fee2e2',
//                                 color: '#dc2626',
//                                 cursor: 'pointer',
//                                 borderRadius: '8px',
//                                 padding: '6px 8px',
//                                 display: 'inline-flex',
//                                 alignItems: 'center'
//                               }}
//                               title="Eliminar usuario"
//                             >
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 3: MONEDA, DECIMALES, MILES & METAS SSOMA            */}
//         {/* ========================================================= */}
//         {activeTab === 'moneda' && (
//           <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 340px',
//               gap: '24px',
//               background: '#ffffff',
//               padding: '28px',
//               borderRadius: '20px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)'
//             }}>
//               {/* Formulario de Configuración Regional */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Moneda y Formateo Numérico
//                   </h3>
//                   <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
//                     Personalice la divisa utilizada en costos de incidentes, compras de EPP y métricas cuantificables.
//                   </p>
//                 </div>

//                 {/* Botones de moneda rápida */}
//                 <div>
//                   <label className="ssoma-label">Selección Rápida de Moneda</label>
//                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
//                     {[
//                       { simbolo: 'S/.', codigo: 'PEN', label: 'Soles (S/.)' },
//                       { simbolo: '$', codigo: 'USD', label: 'Dólares ($)' },
//                       { simbolo: '€', codigo: 'EUR', label: 'Euros (€)' },
//                       { simbolo: '$', codigo: 'MXN', label: 'Pesos MXN ($)' },
//                       { simbolo: '$', codigo: 'COP', label: 'Pesos COP ($)' }
//                     ].map((m, i) => (
//                       <button
//                         key={i}
//                         type="button"
//                         onClick={() => setEmpresaForm({ ...empresaForm, moneda_simbolo: m.simbolo, moneda_codigo: m.codigo })}
//                         style={{
//                           padding: '8px 14px',
//                           borderRadius: '10px',
//                           border: `1px solid ${empresaForm.moneda_codigo === m.codigo ? '#0d5f3d' : '#cbd5e1'}`,
//                           background: empresaForm.moneda_codigo === m.codigo ? '#eaf4ef' : '#ffffff',
//                           color: empresaForm.moneda_codigo === m.codigo ? '#0d5f3d' : '#334155',
//                           fontWeight: 700,
//                           fontSize: '0.8rem',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {m.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="ssoma-form-grid">
//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Símbolo Monetario</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.moneda_simbolo || 'S/.'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_simbolo: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Código ISO Divisa</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.moneda_codigo || 'PEN'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_codigo: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Separador de Decimales</label>
//                     <select
//                       className="ssoma-select"
//                       value={empresaForm.separador_decimales || '.'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, separador_decimales: e.target.value })}
//                     >
//                       <option value=".">Punto ( . ) — Estándar Internacional / Perú / EE.UU.</option>
//                       <option value=",">Coma ( , ) — Estándar Europeo / Sudamericano</option>
//                     </select>
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Separador de Miles</label>
//                     <select
//                       className="ssoma-select"
//                       value={empresaForm.separador_miles || ','}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, separador_miles: e.target.value })}
//                     >
//                       <option value=",">Coma ( , )</option>
//                       <option value=".">Punto ( . )</option>
//                       <option value=" ">Espacio en blanco ( )</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
//                   <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
//                     Metas Institucionales SSOMA
//                   </h4>
//                   <div className="ssoma-form-grid">
//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Días Meta sin Accidentes</label>
//                       <input
//                         type="number"
//                         className="ssoma-input"
//                         value={empresaForm.dias_meta_sin_accidentes || 180}
//                         onChange={(e) => setEmpresaForm({ ...empresaForm, dias_meta_sin_accidentes: e.target.value })}
//                       />
//                     </div>
//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Índice Frecuencia (IF) Límite</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         className="ssoma-input"
//                         value={empresaForm.limite_frecuencia_if || 2.00}
//                         onChange={(e) => setEmpresaForm({ ...empresaForm, limite_frecuencia_if: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
//                   <button 
//                     type="submit" 
//                     className="ssoma-btn ssoma-btn-primary"
//                     style={{ backgroundColor: '#0d5f3d' }}
//                   >
//                     <Save size={18} />
//                     <span>Guardar Moneda & Formatos</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Columna Derecha: Vista Previa Dinámica */}
//               <div style={{
//                 background: 'linear-gradient(145deg, #0d5f3d, #132219)',
//                 color: '#ffffff',
//                 padding: '24px',
//                 borderRadius: '18px',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '18px',
//                 boxShadow: 'var(--shadow-md)',
//                 border: '1px solid #d9c7a3'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9a227' }}>
//                   <Sparkles size={20} />
//                   <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                     Simulador en Vivo
//                   </span>
//                 </div>

//                 <p style={{ fontSize: '0.78rem', color: '#d9c7a3' }}>
//                   Así se visualizarán los montos y unidades en los reportes, gráficos y tablas del sistema:
//                 </p>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
//                   <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Costo Estimado de Incidente</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c9a227', marginTop: '4px' }}>
//                       {empresaForm.moneda_simbolo || 'S/.'} {
//                         '12' + (empresaForm.separador_miles || ',') + '450' + (empresaForm.separador_decimales || '.') + '00'
//                       }
//                     </div>
//                   </div>

//                   <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Presupuesto EPP / Kardex</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
//                       {empresaForm.moneda_simbolo || 'S/.'} {
//                         '8' + (empresaForm.separador_miles || ',') + '920' + (empresaForm.separador_decimales || '.') + '50'
//                       }
//                     </div>
//                   </div>

//                   <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(217, 199, 163, 0.2)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#d9c7a3', textTransform: 'uppercase', fontWeight: 700 }}>Residuos Gestionados (kg)</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
//                       {
//                         '1' + (empresaForm.separador_miles || ',') + '890' + (empresaForm.separador_decimales || '.') + '50'
//                       } kg
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: '#d9c7a3', textAlign: 'center' }}>
//                   Aplica globalmente en Dashboard, Módulos Operativos y Reporte Mensual PDF.
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 4: COPIAS DE SEGURIDAD (BACKUP) & RESTAURACIÓN        */}
//         {/* ========================================================= */}
//         {activeTab === 'backup' && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
//             {/* Tarjeta 1: Sacar Copia de Seguridad */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '28px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'space-between',
//               gap: '20px'
//             }}>
//               <div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
//                   <div style={{
//                     width: '44px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: '#eaf4ef',
//                     color: '#0d5f3d',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Download size={22} />
//                   </div>
//                   <div>
//                     <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
//                       Generar Copia de Seguridad
//                     </h3>
//                     <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
//                       Exportación íntegra de la base de datos MySQL
//                     </p>
//                   </div>
//                 </div>

//                 <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
//                   Descarga un archivo estructurado con la totalidad de tablas del sistema: usuarios, incidentes,
//                   inspecciones, hallazgos, matriz IPERC, pesajes de residuos, monitoreos, capacitaciones y entregas de EPP.
//                 </p>

//                 <div style={{
//                   marginTop: '16px',
//                   background: '#f8fafc',
//                   borderRadius: '12px',
//                   padding: '14px',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '8px',
//                   fontSize: '0.8rem'
//                 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Formato de descarga:</span>
//                     <strong style={{ color: '#0f172a' }}>JSON Estructurado (.json)</strong>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Tablas respaldadas:</span>
//                     <strong style={{ color: '#0d5f3d' }}>13 tablas relacionales</strong>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Compatibilidad:</span>
//                     <strong style={{ color: '#0f172a' }}>Multiplataforma (Windows / Linux)</strong>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleExportBackup}
//                 disabled={isExporting}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '10px',
//                   padding: '14px',
//                   borderRadius: '14px',
//                   background: 'linear-gradient(135deg, #0d5f3d, #14744d)',
//                   color: '#ffffff',
//                   border: 'none',
//                   fontWeight: 700,
//                   fontSize: '0.9rem',
//                   cursor: 'pointer',
//                   boxShadow: '0 6px 18px rgba(13, 95, 61, 0.3)'
//                 }}
//               >
//                 <Download size={20} />
//                 <span>{isExporting ? 'Generando Copia de Seguridad...' : '⬇ Descargar Copia de Seguridad Completa'}</span>
//               </button>
//             </div>

//             {/* Tarjeta 2: Restaurar Copia de Seguridad */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '28px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'space-between',
//               gap: '20px'
//             }}>
//               <div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
//                   <div style={{
//                     width: '44px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: '#f6f1e8',
//                     color: '#c9a227',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Upload size={22} />
//                   </div>
//                   <div>
//                     <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
//                       Restaurar Copia de Seguridad
//                     </h3>
//                     <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
//                       Recuperación de datos desde archivo de respaldo
//                     </p>
//                   </div>
//                 </div>

//                 <div style={{
//                   padding: '16px',
//                   borderRadius: '14px',
//                   border: '2px dashed #cbd5e1',
//                   background: '#f8fafc',
//                   textAlign: 'center',
//                   cursor: 'pointer'
//                 }}>
//                   <input
//                     type="file"
//                     accept=".json"
//                     id="restoreFileInput"
//                     style={{ display: 'none' }}
//                     onChange={handleFileSelect}
//                   />
//                   <label htmlFor="restoreFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
//                     <Upload size={28} color="#c9a227" />
//                     <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
//                       Seleccione o arrastre el archivo .json
//                     </span>
//                     <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
//                       Archivos generados previamente por el sistema SSOMA
//                     </span>
//                   </label>
//                 </div>

//                 {restorePreview && (
//                   <div style={{
//                     marginTop: '14px',
//                     padding: '12px 14px',
//                     borderRadius: '12px',
//                     background: '#eaf4ef',
//                     border: '1px solid #a3cfbb',
//                     fontSize: '0.78rem',
//                     color: '#0d5f3d'
//                   }}>
//                     <div style={{ fontWeight: 800, marginBottom: '4px' }}>📁 {restorePreview.nombre} ({restorePreview.tamano})</div>
//                     <div>Fecha Backup: <strong>{new Date(restorePreview.fecha).toLocaleString()}</strong></div>
//                     <div>Tablas detectadas: <strong>{restorePreview.tablas} tablas ({restorePreview.totalRegistros} registros)</strong></div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="button"
//                 disabled={!restoreFile || isRestoring}
//                 onClick={() => setShowRestoreModal(true)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '10px',
//                   padding: '14px',
//                   borderRadius: '14px',
//                   background: !restoreFile ? '#94a3b8' : 'linear-gradient(135deg, #c9a227, #b08d1f)',
//                   color: '#ffffff',
//                   border: 'none',
//                   fontWeight: 700,
//                   fontSize: '0.9rem',
//                   cursor: !restoreFile ? 'not-allowed' : 'pointer',
//                   boxShadow: restoreFile ? '0 6px 18px rgba(201, 162, 39, 0.35)' : 'none'
//                 }}
//               >
//                 <RefreshCw size={20} />
//                 <span>Restaurar Base de Datos Ahora</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 5: PUESTA A CERO / RESET PARA NUEVA EMPRESA           */}
//         {/* ========================================================= */}
//         {activeTab === 'reset' && (
//           <div style={{
//             background: '#ffffff',
//             borderRadius: '20px',
//             padding: '32px',
//             border: '1px solid #fee2e2',
//             boxShadow: 'var(--shadow-sm)',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '24px'
//           }}>
//             {/* Banner de Advertencia Severa */}
//             <div style={{
//               display: 'flex',
//               alignItems: 'flex-start',
//               gap: '16px',
//               padding: '18px 22px',
//               borderRadius: '16px',
//               background: '#fef2f2',
//               border: '1px solid #fecaca',
//               color: '#991b1b'
//             }}>
//               <AlertTriangle size={32} style={{ flexShrink: 0, marginTop: '2px' }} />
//               <div>
//                 <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
//                   Zona Crítica: Puesta a Cero para Nueva Empresa
//                 </h3>
//                 <p style={{ fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5 }}>
//                   Esta acción eliminará de forma irreversible los registros operacionales (incidentes, inspecciones,
//                   hallazgos subestándar, matriz IPERC, pesaje de residuos, mediciones ambientales, capacitaciones y actas de EPP),
//                   dejando la plataforma completamente limpia para comenzar las operaciones de una <strong>nueva empresa o nuevo ciclo anual</strong>.
//                   La cuenta de administrador principal será conservada para asegurar el acceso continuo.
//                 </p>
//               </div>
//             </div>

//             {/* Configuración de Nueva Empresa al Resetear */}
//             <div style={{
//               background: '#f8fafc',
//               padding: '20px',
//               borderRadius: '16px',
//               border: '1px solid #e2e8f0'
//             }}>
//               <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
//                 Datos de la Nueva Organización (Opcional - puede configurarse después)
//               </h4>

//               <div className="ssoma-form-grid">
//                 <div className="ssoma-form-group full">
//                   <label className="ssoma-label">Razón Social de la Nueva Empresa</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. Minera Los Andes S.A.C."
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.razon_social}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, razon_social: e.target.value })}
//                   />
//                 </div>
//                 <div className="ssoma-form-group">
//                   <label className="ssoma-label">RUC de la Nueva Empresa</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. 20554433221"
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.ruc}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, ruc: e.target.value })}
//                   />
//                 </div>
//                 <div className="ssoma-form-group">
//                   <label className="ssoma-label">Rubro Principal</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. Construcción y Montaje"
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.rubro}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, rubro: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div style={{ marginTop: '14px' }}>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
//                   <input
//                     type="checkbox"
//                     checked={limpiarPersonalYAreas}
//                     onChange={(e) => setLimpiarPersonalYAreas(e.target.checked)}
//                   />
//                   <span>Reiniciar también el directorio de personal, áreas y catálogo de EPP (iniciar con plantilla base)</span>
//                 </label>
//               </div>
//             </div>

//             {/* Reto de Seguridad */}
//             <div style={{
//               background: '#fff1f2',
//               padding: '20px',
//               borderRadius: '16px',
//               border: '1px solid #ffe4e6',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '12px'
//             }}>
//               <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c' }}>
//                 Reto de Seguridad Obligatorio:
//               </div>
//               <p style={{ fontSize: '0.8rem', color: '#881337' }}>
//                 Para evitar accidentes, escriba exactamente <strong style={{ textDecoration: 'underline' }}>CONFIRMAR RESET</strong> en el siguiente campo:
//               </p>
//               <div style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
//                 <input
//                   type="text"
//                   placeholder="Escriba CONFIRMAR RESET"
//                   className="ssoma-input"
//                   style={{
//                     fontWeight: 800,
//                     letterSpacing: '1px',
//                     borderColor: resetConfirmText === 'CONFIRMAR RESET' ? '#0d5f3d' : '#fda4af'
//                   }}
//                   value={resetConfirmText}
//                   onChange={(e) => setResetConfirmText(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   disabled={resetConfirmText !== 'CONFIRMAR RESET' || isResetting}
//                   onClick={() => setShowResetModal(true)}
//                   style={{
//                     padding: '10px 20px',
//                     borderRadius: '12px',
//                     background: resetConfirmText === 'CONFIRMAR RESET' ? '#e11d48' : '#cbd5e1',
//                     color: '#ffffff',
//                     border: 'none',
//                     fontWeight: 800,
//                     fontSize: '0.85rem',
//                     cursor: resetConfirmText === 'CONFIRMAR RESET' ? 'pointer' : 'not-allowed',
//                     whiteSpace: 'nowrap',
//                     boxShadow: resetConfirmText === 'CONFIRMAR RESET' ? '0 4px 14px rgba(225, 29, 72, 0.35)' : 'none'
//                   }}
//                 >
//                   Resetear Sistema
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 6: DIAGNÓSTICO & NORMATIVAS                           */}
//         {/* ========================================================= */}
//         {activeTab === 'diagnostico' && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
//             {/* Card de Conexión a Base de Datos MySQL */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '24px',
//               boxShadow: 'var(--shadow-sm)',
//               border: '1px solid #edf2f7'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                 <div style={{
//                   width: '42px',
//                   height: '42px',
//                   borderRadius: '12px',
//                   background: '#eaf4ef',
//                   color: '#0d5f3d',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Database size={22} />
//                 </div>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Servidor MySQL
//                   </h3>
//                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Conexión activa a base de datos de producción</p>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Host:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>localhost</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Puerto:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>3306</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Base de Datos:</span>
//                   <span style={{ fontWeight: 800, color: '#0d5f3d' }}>dev_ssoma</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Usuario:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>root</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#eaf4ef', borderRadius: '10px', color: '#0d5f3d', fontWeight: 700 }}>
//                   <span>Estado:</span>
//                   <span>🟢 Conectado y Operativo (13 tablas)</span>
//                 </div>
//               </div>
//             </div>

//             {/* Card de Normativas Legales */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '24px',
//               boxShadow: 'var(--shadow-sm)',
//               border: '1px solid #edf2f7'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                 <div style={{
//                   width: '42px',
//                   height: '42px',
//                   borderRadius: '12px',
//                   background: '#f6f1e8',
//                   color: '#c9a227',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Shield size={22} />
//                 </div>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Estándares & Normativas SSOMA
//                   </h3>
//                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Marcos de gestión y cumplimiento legal</p>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>ISO 45001:2018</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sistemas de Gestión de la Seguridad y Salud en el Trabajo</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>ISO 14001:2015</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sistemas de Gestión Ambiental y Control de Huella Ecológica</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>Ley N° 29783 & D.S. 005-2012-TR</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ley de Seguridad y Salud en el Trabajo e IPERC continuo</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>NTP 900.058:2019</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Código de Colores para el Almacenamiento de Residuos Sólidos</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Modal: Crear / Editar Usuario */}
//         {showUserModal && (
//           <div className="ssoma-modal-overlay" onClick={() => setShowUserModal(false)}>
//             <div 
//               className="ssoma-modal" 
//               style={{ maxWidth: '480px', borderRadius: '20px', border: '1px solid #d9c7a3' }} 
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="ssoma-modal-header" style={{ borderBottom: '1px solid #e5ece7', padding: '18px 24px' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <div style={{ background: '#eaf4ef', color: '#0d5f3d', padding: '8px', borderRadius: '10px', display: 'flex' }}>
//                     <UserPlus size={20} />
//                   </div>
//                   <div>
//                     <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#132219' }}>
//                       {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario del Sistema'}
//                     </h3>
//                     <span style={{ fontSize: '0.75rem', color: '#53695c' }}>
//                       {editingUserId ? 'Actualizar permisos o contraseña' : 'Creación de credenciales de acceso'}
//                     </span>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setShowUserModal(false)}
//                   style={{ background: '#f6f1e8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#53695c' }}
//                 >
//                   <X size={16} />
//                 </button>
//               </div>

//               {userFormError && (
//                 <div style={{ margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
//                   <AlertCircle size={17} />
//                   <span>{userFormError}</span>
//                 </div>
//               )}

//               <form onSubmit={handleSaveUser}>
//                 <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
//                   <div>
//                     <label className="ssoma-label">Nombres y Apellidos *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={userForm.nombre}
//                       onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
//                       placeholder="Ej: Lic. Patricia Solís"
//                     />
//                   </div>

//                   <div>
//                     <label className="ssoma-label">Correo Electrónico (Login) *</label>
//                     <input
//                       type="email"
//                       required
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={userForm.email}
//                       onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
//                       placeholder="usuario@ssoma.com"
//                     />
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                     <div>
//                       <label className="ssoma-label">Rol en el Sistema *</label>
//                       <select
//                         required
//                         className="ssoma-select"
//                         style={{ width: '100%', marginTop: '4px' }}
//                         value={userForm.rol}
//                         onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
//                       >
//                         <option value="admin">Administrador (Total)</option>
//                         <option value="supervisor">Supervisor de Campo</option>
//                         <option value="auditor">Auditor Trinorma</option>
//                         <option value="medico">Médico Ocupacional</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="ssoma-label">Cargo Institucional</label>
//                       <input
//                         type="text"
//                         className="ssoma-input"
//                         style={{ width: '100%', marginTop: '4px' }}
//                         value={userForm.cargo}
//                         onChange={(e) => setUserForm({ ...userForm, cargo: e.target.value })}
//                         placeholder="Ej: Auditor Trinorma ISO"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="ssoma-label">
//                       {editingUserId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña de Acceso *'}
//                     </label>
//                     <input
//                       type="password"
//                       required={!editingUserId}
//                       className="ssoma-input"
//                       style={{ width: '100%', marginTop: '4px' }}
//                       value={userForm.password}
//                       onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
//                       placeholder={editingUserId ? '••••••••' : 'Mínimo 6 caracteres'}
//                     />
//                   </div>
//                 </div>

//                 <div className="ssoma-modal-footer" style={{ borderTop: '1px solid #e5ece7', padding: '16px 24px' }}>
//                   <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowUserModal(false)}>
//                     Cancelar
//                   </button>
//                   <button 
//                     type="submit" 
//                     className="ssoma-btn ssoma-btn-primary" 
//                     style={{ backgroundColor: '#0d5f3d' }}
//                   >
//                     {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Modal de Confirmación de Restauración */}
//         {showRestoreModal && (
//           <div className="ssoma-modal-overlay" onClick={() => setShowRestoreModal(false)}>
//             <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
//               <div className="ssoma-modal-header" style={{ background: '#0d5f3d', color: '#fff' }}>
//                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
//                   ¿Confirmar Restauración de Base de Datos?
//                 </h3>
//                 <button onClick={() => setShowRestoreModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
//               </div>
//               <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
//                   Esta acción sobreescribirá las tablas existentes con el contenido del archivo de copia de seguridad
//                   <strong> {restorePreview?.nombre}</strong>.
//                 </p>
//                 <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontSize: '0.78rem', fontWeight: 600 }}>
//                   ⚠️ Se recomienda haber descargado una copia de seguridad reciente antes de continuar.
//                 </div>
//               </div>
//               <div className="ssoma-modal-footer">
//                 <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowRestoreModal(false)}>Cancelar</button>
//                 <button
//                   className="ssoma-btn ssoma-btn-primary"
//                   style={{ background: '#0d5f3d' }}
//                   disabled={isRestoring}
//                   onClick={handleExecuteRestore}
//                 >
//                   {isRestoring ? 'Restaurando...' : 'Sí, Restaurar Ahora'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Modal de Confirmación de Reset del Sistema */}
//         {showResetModal && (
//           <div className="ssoma-modal-overlay" onClick={() => setShowResetModal(false)}>
//             <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
//               <div className="ssoma-modal-header" style={{ background: '#e11d48', color: '#fff' }}>
//                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
//                   ⚠️ Confirmación Final de Reset
//                 </h3>
//                 <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
//               </div>
//               <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
//                   ¿Está absolutamente seguro de proceder con el vaciado del sistema?
//                 </p>
//                 <ul style={{ fontSize: '0.8rem', color: '#e11d48', paddingLeft: '20px', lineHeight: 1.4 }}>
//                   <li>Se eliminarán todos los incidentes registrados</li>
//                   <li>Se vaciarán inspecciones, hallazgos y matrices IPERC</li>
//                   <li>Se limpiarán pesajes ambientales y capacitaciones</li>
//                   <li>Se conservará el usuario administrador para el inicio de sesión</li>
//                 </ul>
//               </div>
//               <div className="ssoma-modal-footer">
//                 <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowResetModal(false)}>Cancelar</button>
//                 <button
//                   className="ssoma-btn"
//                   style={{ background: '#e11d48', color: '#fff', fontWeight: 800, border: 'none' }}
//                   disabled={isResetting}
//                   onClick={handleExecuteReset}
//                 >
//                   {isResetting ? 'Vaciando registros...' : 'Confirmar y Resetear'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

























// import React, { useState } from 'react';
// import Header from '../components/Header';
// import {
//   Building2,
//   DollarSign,
//   Database,
//   RefreshCw,
//   Shield,
//   Upload,
//   Download,
//   CheckCircle2,
//   AlertTriangle,
//   FileCheck,
//   Save,
//   Image as ImageIcon,
//   Sparkles,
//   ArrowRight,
//   Trash2,
//   Lock
// } from 'lucide-react';
// import { useCompany } from '../context/CompanyContext';

// export default function ConfiguracionView() {
//   const { company, updateCompany, formatMoney, formatNumber, loadCompany } = useCompany();

//   const [activeTab, setActiveTab] = useState('empresa'); // 'empresa' | 'moneda' | 'backup' | 'reset' | 'diagnostico'

//   // Estados del Formulario de Empresa
//   const [empresaForm, setEmpresaForm] = useState({ ...company });

//   // Sincronizar si cambia el contexto
//   React.useEffect(() => {
//     setEmpresaForm({ ...company });
//   }, [company]);

//   // Feedback Toast
//   const [statusMessage, setStatusMessage] = useState(null);

//   // Estados de Backup & Restore
//   const [isExporting, setIsExporting] = useState(false);
//   const [restoreFile, setRestoreFile] = useState(null);
//   const [restorePreview, setRestorePreview] = useState(null);
//   const [isRestoring, setIsRestoring] = useState(false);
//   const [showRestoreModal, setShowRestoreModal] = useState(false);

//   // Estados de Reset / Nueva Empresa
//   const [resetConfirmText, setResetConfirmText] = useState('');
//   const [limpiarPersonalYAreas, setLimpiarPersonalYAreas] = useState(false);
//   const [nuevaEmpresaForm, setNuevaEmpresaForm] = useState({
//     razon_social: '',
//     ruc: '',
//     rubro: 'Operaciones Industriales & Servicios'
//   });
//   const [isResetting, setIsResetting] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);

//   const showNotification = (type, text) => {
//     setStatusMessage({ type, text });
//     setTimeout(() => setStatusMessage(null), 5000);
//   };

//   // Guardar datos de Empresa o Moneda
//   const handleSaveConfig = async (e) => {
//     if (e) e.preventDefault();
//     const result = await updateCompany(empresaForm);
//     if (result.success) {
//       showNotification('success', '¡Configuración guardada exitosamente!');
//     } else {
//       showNotification('error', result.message || 'Error al guardar la configuración.');
//     }
//   };

//   // Manejador de subida de imagen de logo (convertir a Base64)
//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       showNotification('error', 'La imagen no debe superar los 5MB.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setEmpresaForm({ ...empresaForm, logo_url: event.target.result });
//       showNotification('success', 'Logotipo cargado y previsualizado.');
//     };
//     reader.readAsDataURL(file);
//   };

//   // Presets de logotipos industriales
//   const logoPresets = [
//     { label: 'Minería & Energía', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Construcción Civil', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Manufactura Pesada', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80' },
//     { label: 'Eco & Sostenible', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80' }
//   ];

//   // Descarga de Copia de Seguridad
//   const handleExportBackup = async () => {
//     setIsExporting(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/export');
//       if (!res.ok) throw new Error('Fallo al generar archivo de respaldo.');

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `backup_ssoma_${new Date().toISOString().slice(0, 10)}.json`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//       showNotification('success', 'Copia de seguridad descargada exitosamente en formato JSON.');
//     } catch (err) {
//       showNotification('error', err.message);
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   // Manejar selección de archivo de restauración
//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const parsed = JSON.parse(event.target.result);
//         if (!parsed.tablas) {
//           throw new Error('El archivo no contiene la clave "tablas" requerida.');
//         }
//         setRestoreFile(parsed);
//         setRestorePreview({
//           nombre: file.name,
//           tamano: (file.size / 1024).toFixed(1) + ' KB',
//           sistema: parsed.metadata?.sistema || 'SSOMA Backup',
//           fecha: parsed.metadata?.fechaGeneracion || 'Fecha no especificada',
//           tablas: Object.keys(parsed.tablas).length,
//           totalRegistros: parsed.metadata?.totalRegistros || 'No calculado'
//         });
//       } catch (err) {
//         showNotification('error', 'El archivo no es un JSON de respaldo válido.');
//         setRestoreFile(null);
//         setRestorePreview(null);
//       }
//     };
//     reader.readAsText(file);
//   };

//   // Ejecutar Restauración
//   const handleExecuteRestore = async () => {
//     if (!restoreFile) return;
//     setIsRestoring(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/backup/restore', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ backup: restoreFile })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showNotification('success', data.message);
//         setShowRestoreModal(false);
//         setRestoreFile(null);
//         setRestorePreview(null);
//         loadCompany();
//       } else {
//         showNotification('error', data.message);
//       }
//     } catch (err) {
//       showNotification('error', 'Error al procesar la restauración.');
//     } finally {
//       setIsRestoring(false);
//     }
//   };

//   // Ejecutar Reset para Nueva Empresa
//   const handleExecuteReset = async () => {
//     if (resetConfirmText !== 'CONFIRMAR RESET') {
//       showNotification('error', 'Debe escribir exactamente "CONFIRMAR RESET".');
//       return;
//     }

//     setIsResetting(true);
//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/configuracion/sistema/reset', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           confirmText: resetConfirmText,
//           limpiarPersonalYAreas,
//           nuevaEmpresa: nuevaEmpresaForm.razon_social ? nuevaEmpresaForm : null
//         })
//       });
//       const data = await res.json();
//       if (data.success) {
//         showNotification('success', data.message);
//         setShowResetModal(false);
//         setResetConfirmText('');
//         loadCompany();
//       } else {
//         showNotification('error', data.message);
//       }
//     } catch (err) {
//       showNotification('error', 'Error ejecutando puesta a cero del sistema.');
//     } finally {
//       setIsResetting(false);
//     }
//   };

//   return (
//     <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
//       <main className="ssoma-main-panel" style={{ width: '100%' }}>
//         <Header title="Configuración del Sistema & Empresa" />

//         {/* Notificación Toast Flotante */}
//         {statusMessage && (
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             padding: '12px 18px',
//             borderRadius: '12px',
//             background: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
//             color: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
//             border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
//             fontSize: '0.88rem',
//             fontWeight: 700,
//             boxShadow: 'var(--shadow-md)',
//             animation: 'fadeIn 0.3s ease'
//           }}>
//             {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
//             <span>{statusMessage.text}</span>
//           </div>
//         )}

//         {/* Barra de Pestañas Principales */}
//         <div style={{
//           display: 'flex',
//           gap: '8px',
//           background: '#ffffff',
//           padding: '8px',
//           borderRadius: '16px',
//           border: '1px solid #edf2f7',
//           boxShadow: 'var(--shadow-sm)',
//           overflowX: 'auto'
//         }}>
//           {[
//             { id: 'empresa', label: 'Datos de la Empresa', icon: Building2 },
//             { id: 'moneda', label: 'Moneda & Formatos', icon: DollarSign },
//             { id: 'backup', label: 'Copias de Seguridad & Restauración', icon: Database },
//             { id: 'reset', label: 'Puesta a Cero / Nueva Empresa', icon: RefreshCw },
//             { id: 'diagnostico', label: 'Diagnóstico & Normativas', icon: Shield }
//           ].map((tab) => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                   padding: '10px 18px',
//                   borderRadius: '12px',
//                   border: 'none',
//                   background: isActive ? '#0f172a' : 'transparent',
//                   color: isActive ? '#ffffff' : '#64748b',
//                   fontSize: '0.84rem',
//                   fontWeight: 700,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 <Icon size={18} color={isActive ? '#10b981' : '#94a3b8'} />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* ========================================================= */}
//         {/* TAB 1: DATOS DE LA EMPRESA & LOGOTIPO                     */}
//         {/* ========================================================= */}
//         {activeTab === 'empresa' && (
//           <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: '320px 1fr',
//               gap: '24px',
//               background: '#ffffff',
//               padding: '28px',
//               borderRadius: '20px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)'
//             }}>
//               {/* Columna Izquierda: Logo y Branding */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
//                 <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
//                   Logotipo Institucional
//                 </span>

//                 <div style={{
//                   width: '160px',
//                   height: '160px',
//                   borderRadius: '20px',
//                   border: '2px dashed #cbd5e1',
//                   background: '#f8fafc',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   overflow: 'hidden',
//                   position: 'relative',
//                   boxShadow: 'var(--shadow-sm)'
//                 }}>
//                   {empresaForm.logo_url ? (
//                     <img
//                       src={empresaForm.logo_url}
//                       alt="Logo Empresa"
//                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150'; }}
//                     />
//                   ) : (
//                     <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
//                       <ImageIcon size={36} />
//                       <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sin Logotipo</span>
//                     </div>
//                   )}
//                 </div>

//                 <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
//                   <label style={{
//                     flex: 1,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '6px',
//                     padding: '8px 12px',
//                     background: '#10b981',
//                     color: '#fff',
//                     borderRadius: '10px',
//                     fontSize: '0.78rem',
//                     fontWeight: 700,
//                     cursor: 'pointer'
//                   }}>
//                     <Upload size={16} />
//                     <span>Subir Archivo</span>
//                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
//                   </label>

//                   {empresaForm.logo_url && (
//                     <button
//                       type="button"
//                       onClick={() => setEmpresaForm({ ...empresaForm, logo_url: '' })}
//                       style={{
//                         padding: '8px 12px',
//                         background: '#fee2e2',
//                         color: '#ef4444',
//                         border: 'none',
//                         borderRadius: '10px',
//                         fontSize: '0.78rem',
//                         fontWeight: 700,
//                         cursor: 'pointer'
//                       }}
//                       title="Quitar logotipo"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   )}
//                 </div>

//                 <div style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
//                   <label className="ssoma-label">O ingresar URL de Imagen</label>
//                   <input
//                     type="text"
//                     className="ssoma-input"
//                     style={{ fontSize: '0.78rem' }}
//                     placeholder="https://ejemplo.com/logo.png"
//                     value={empresaForm.logo_url || ''}
//                     onChange={(e) => setEmpresaForm({ ...empresaForm, logo_url: e.target.value })}
//                   />
//                 </div>

//                 {/* Presets Rápidos */}
//                 <div style={{ width: '100%', textAlign: 'left' }}>
//                   <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
//                     Logos de Ejemplo por Rubro:
//                   </span>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
//                     {logoPresets.map((p, i) => (
//                       <button
//                         key={i}
//                         type="button"
//                         onClick={() => setEmpresaForm({ ...empresaForm, logo_url: p.url })}
//                         style={{
//                           padding: '6px',
//                           background: '#f1f5f9',
//                           border: '1px solid #e2e8f0',
//                           borderRadius: '8px',
//                           fontSize: '0.68rem',
//                           fontWeight: 600,
//                           cursor: 'pointer',
//                           color: '#334155'
//                         }}
//                       >
//                         {p.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Columna Derecha: Formulario de Datos */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
//                   Información Legal & Operativa
//                 </h3>

//                 <div className="ssoma-form-grid">
//                   <div className="ssoma-form-group full">
//                     <label className="ssoma-label">Razón Social Oficial *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       value={empresaForm.razon_social || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, razon_social: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">RUC / NIF / Tax ID *</label>
//                     <input
//                       type="text"
//                       required
//                       className="ssoma-input"
//                       value={empresaForm.ruc || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, ruc: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Nombre Comercial / Siglas</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.nombre_comercial || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_comercial: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Rubro / Sector Industrial</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       placeholder="Ej. Minería, Construcción, Manufactura..."
//                       value={empresaForm.rubro || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, rubro: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Sitio Web</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.sitio_web || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, sitio_web: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group full">
//                     <label className="ssoma-label">Dirección Fiscal / Sede Principal</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.direccion || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Teléfono Central</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.telefono || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Correo Electrónico de Contacto</label>
//                     <input
//                       type="email"
//                       className="ssoma-input"
//                       value={empresaForm.email || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Representante Legal / Gerente General</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.representante_legal || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, representante_legal: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Responsable / Jefe SSOMA Corporativo</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.responsable_ssoma || ''}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, responsable_ssoma: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
//                   <button type="submit" className="ssoma-btn ssoma-btn-primary">
//                     <Save size={18} />
//                     <span>Guardar Datos de la Empresa</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 2: MONEDA, DECIMALES, MILES & METAS SSOMA            */}
//         {/* ========================================================= */}
//         {activeTab === 'moneda' && (
//           <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 340px',
//               gap: '24px',
//               background: '#ffffff',
//               padding: '28px',
//               borderRadius: '20px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)'
//             }}>
//               {/* Formulario de Configuración Regional */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Moneda y Formateo Numérico
//                   </h3>
//                   <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
//                     Personalice la divisa utilizada en costos de incidentes, compras de EPP y métricas cuantificables.
//                   </p>
//                 </div>

//                 {/* Botones de moneda rápida */}
//                 <div>
//                   <label className="ssoma-label">Selección Rápida de Moneda</label>
//                   <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
//                     {[
//                       { simbolo: 'S/.', codigo: 'PEN', label: 'Soles (S/.)' },
//                       { simbolo: '$', codigo: 'USD', label: 'Dólares ($)' },
//                       { simbolo: '€', codigo: 'EUR', label: 'Euros (€)' },
//                       { simbolo: '$', codigo: 'MXN', label: 'Pesos MXN ($)' },
//                       { simbolo: '$', codigo: 'COP', label: 'Pesos COP ($)' }
//                     ].map((m, i) => (
//                       <button
//                         key={i}
//                         type="button"
//                         onClick={() => setEmpresaForm({ ...empresaForm, moneda_simbolo: m.simbolo, moneda_codigo: m.codigo })}
//                         style={{
//                           padding: '8px 14px',
//                           borderRadius: '10px',
//                           border: `1px solid ${empresaForm.moneda_codigo === m.codigo ? '#10b981' : '#cbd5e1'}`,
//                           background: empresaForm.moneda_codigo === m.codigo ? '#ecfdf5' : '#ffffff',
//                           color: empresaForm.moneda_codigo === m.codigo ? '#065f46' : '#334155',
//                           fontWeight: 700,
//                           fontSize: '0.8rem',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {m.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="ssoma-form-grid">
//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Símbolo Monetario</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.moneda_simbolo || 'S/.'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_simbolo: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Código ISO Divisa</label>
//                     <input
//                       type="text"
//                       className="ssoma-input"
//                       value={empresaForm.moneda_codigo || 'PEN'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, moneda_codigo: e.target.value })}
//                     />
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Separador de Decimales</label>
//                     <select
//                       className="ssoma-select"
//                       value={empresaForm.separador_decimales || '.'}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, separador_decimales: e.target.value })}
//                     >
//                       <option value=".">Punto ( . ) — Estándar Internacional / Perú / EE.UU.</option>
//                       <option value=",">Coma ( , ) — Estándar Europeo / Sudamericano</option>
//                     </select>
//                   </div>

//                   <div className="ssoma-form-group">
//                     <label className="ssoma-label">Separador de Miles</label>
//                     <select
//                       className="ssoma-select"
//                       value={empresaForm.separador_miles || ','}
//                       onChange={(e) => setEmpresaForm({ ...empresaForm, separador_miles: e.target.value })}
//                     >
//                       <option value=",">Coma ( , )</option>
//                       <option value=".">Punto ( . )</option>
//                       <option value=" ">Espacio en blanco ( )</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
//                   <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
//                     Metas Institucionales SSOMA
//                   </h4>
//                   <div className="ssoma-form-grid">
//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Días Meta sin Accidentes</label>
//                       <input
//                         type="number"
//                         className="ssoma-input"
//                         value={empresaForm.dias_meta_sin_accidentes || 180}
//                         onChange={(e) => setEmpresaForm({ ...empresaForm, dias_meta_sin_accidentes: e.target.value })}
//                       />
//                     </div>
//                     <div className="ssoma-form-group">
//                       <label className="ssoma-label">Índice Frecuencia (IF) Límite</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         className="ssoma-input"
//                         value={empresaForm.limite_frecuencia_if || 2.00}
//                         onChange={(e) => setEmpresaForm({ ...empresaForm, limite_frecuencia_if: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
//                   <button type="submit" className="ssoma-btn ssoma-btn-primary">
//                     <Save size={18} />
//                     <span>Guardar Moneda & Formatos</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Columna Derecha: Vista Previa Dinámica */}
//               <div style={{
//                 background: 'linear-gradient(145deg, #0d1527, #1c2541)',
//                 color: '#ffffff',
//                 padding: '24px',
//                 borderRadius: '18px',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '18px',
//                 boxShadow: 'var(--shadow-md)'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
//                   <Sparkles size={20} />
//                   <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
//                     Simulador en Vivo
//                   </span>
//                 </div>

//                 <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
//                   Así se visualizarán los montos y unidades en los reportes, gráficos y tablas del sistema:
//                 </p>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
//                   <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Costo Estimado de Incidente</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
//                       {empresaForm.moneda_simbolo || 'S/.'} {
//                         '12' + (empresaForm.separador_miles || ',') + '450' + (empresaForm.separador_decimales || '.') + '00'
//                       }
//                     </div>
//                   </div>

//                   <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Presupuesto EPP / Kardex</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
//                       {empresaForm.moneda_simbolo || 'S/.'} {
//                         '8' + (empresaForm.separador_miles || ',') + '920' + (empresaForm.separador_decimales || '.') + '50'
//                       }
//                     </div>
//                   </div>

//                   <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
//                     <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Residuos Gestionados (kg)</div>
//                     <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
//                       {
//                         '1' + (empresaForm.separador_miles || ',') + '890' + (empresaForm.separador_decimales || '.') + '50'
//                       } kg
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
//                   Aplica globalmente en Dashboard, Módulos Operativos y Reporte Mensual PDF.
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 3: COPIAS DE SEGURIDAD (BACKUP) & RESTAURACIÓN        */}
//         {/* ========================================================= */}
//         {activeTab === 'backup' && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
//             {/* Tarjeta 1: Sacar Copia de Seguridad */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '28px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'space-between',
//               gap: '20px'
//             }}>
//               <div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
//                   <div style={{
//                     width: '44px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: '#dcfce7',
//                     color: '#10b981',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Download size={22} />
//                   </div>
//                   <div>
//                     <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
//                       Generar Copia de Seguridad
//                     </h3>
//                     <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
//                       Exportación íntegra de la base de datos MySQL
//                     </p>
//                   </div>
//                 </div>

//                 <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
//                   Descarga un archivo estructurado con la totalidad de tablas del sistema: usuarios, incidentes,
//                   inspecciones, hallazgos, matriz IPERC, pesajes de residuos, monitoreos, capacitaciones y entregas de EPP.
//                 </p>

//                 <div style={{
//                   marginTop: '16px',
//                   background: '#f8fafc',
//                   borderRadius: '12px',
//                   padding: '14px',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '8px',
//                   fontSize: '0.8rem'
//                 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Formato de descarga:</span>
//                     <strong style={{ color: '#0f172a' }}>JSON Estructurado (.json)</strong>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Tablas respaldadas:</span>
//                     <strong style={{ color: '#10b981' }}>13 tablas relacionales</strong>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <span style={{ color: '#64748b' }}>Compatibilidad:</span>
//                     <strong style={{ color: '#0f172a' }}>Multiplataforma (Windows / Linux)</strong>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleExportBackup}
//                 disabled={isExporting}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '10px',
//                   padding: '14px',
//                   borderRadius: '14px',
//                   background: 'linear-gradient(135deg, #10b981, #059669)',
//                   color: '#ffffff',
//                   border: 'none',
//                   fontWeight: 700,
//                   fontSize: '0.9rem',
//                   cursor: 'pointer',
//                   boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)'
//                 }}
//               >
//                 <Download size={20} />
//                 <span>{isExporting ? 'Generando Copia de Seguridad...' : '⬇ Descargar Copia de Seguridad Completa'}</span>
//               </button>
//             </div>

//             {/* Tarjeta 2: Restaurar Copia de Seguridad */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '28px',
//               border: '1px solid #edf2f7',
//               boxShadow: 'var(--shadow-sm)',
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'space-between',
//               gap: '20px'
//             }}>
//               <div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
//                   <div style={{
//                     width: '44px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: '#e0e7ff',
//                     color: '#6366f1',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Upload size={22} />
//                   </div>
//                   <div>
//                     <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
//                       Restaurar Copia de Seguridad
//                     </h3>
//                     <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
//                       Recuperación de datos desde archivo de respaldo
//                     </p>
//                   </div>
//                 </div>

//                 <div style={{
//                   padding: '16px',
//                   borderRadius: '14px',
//                   border: '2px dashed #cbd5e1',
//                   background: '#f8fafc',
//                   textAlign: 'center',
//                   cursor: 'pointer'
//                 }}>
//                   <input
//                     type="file"
//                     accept=".json"
//                     id="restoreFileInput"
//                     style={{ display: 'none' }}
//                     onChange={handleFileSelect}
//                   />
//                   <label htmlFor="restoreFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
//                     <Upload size={28} color="#6366f1" />
//                     <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
//                       Seleccione o arrastre el archivo .json
//                     </span>
//                     <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
//                       Archivos generados previamente por el sistema SSOMA
//                     </span>
//                   </label>
//                 </div>

//                 {restorePreview && (
//                   <div style={{
//                     marginTop: '14px',
//                     padding: '12px 14px',
//                     borderRadius: '12px',
//                     background: '#ecfdf5',
//                     border: '1px solid #bbf7d0',
//                     fontSize: '0.78rem',
//                     color: '#065f46'
//                   }}>
//                     <div style={{ fontWeight: 800, marginBottom: '4px' }}>📁 {restorePreview.nombre} ({restorePreview.tamano})</div>
//                     <div>Fecha Backup: <strong>{new Date(restorePreview.fecha).toLocaleString()}</strong></div>
//                     <div>Tablas detectadas: <strong>{restorePreview.tablas} tablas ({restorePreview.totalRegistros} registros)</strong></div>
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="button"
//                 disabled={!restoreFile || isRestoring}
//                 onClick={() => setShowRestoreModal(true)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '10px',
//                   padding: '14px',
//                   borderRadius: '14px',
//                   background: !restoreFile ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
//                   color: '#ffffff',
//                   border: 'none',
//                   fontWeight: 700,
//                   fontSize: '0.9rem',
//                   cursor: !restoreFile ? 'not-allowed' : 'pointer',
//                   boxShadow: restoreFile ? '0 6px 18px rgba(99, 102, 241, 0.35)' : 'none'
//                 }}
//               >
//                 <RefreshCw size={20} />
//                 <span>Restaurar Base de Datos Ahora</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 4: PUESTA A CERO / RESET PARA NUEVA EMPRESA           */}
//         {/* ========================================================= */}
//         {activeTab === 'reset' && (
//           <div style={{
//             background: '#ffffff',
//             borderRadius: '20px',
//             padding: '32px',
//             border: '1px solid #fee2e2',
//             boxShadow: 'var(--shadow-sm)',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '24px'
//           }}>
//             {/* Banner de Advertencia Severa */}
//             <div style={{
//               display: 'flex',
//               alignItems: 'flex-start',
//               gap: '16px',
//               padding: '18px 22px',
//               borderRadius: '16px',
//               background: '#fef2f2',
//               border: '1px solid #fecaca',
//               color: '#991b1b'
//             }}>
//               <AlertTriangle size={32} style={{ flexShrink: 0, marginTop: '2px' }} />
//               <div>
//                 <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
//                   Zona Crítica: Puesta a Cero para Nueva Empresa
//                 </h3>
//                 <p style={{ fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.5 }}>
//                   Esta acción eliminará de forma irreversible los registros operacionales (incidentes, inspecciones,
//                   hallazgos subestándar, matriz IPERC, pesaje de residuos, mediciones ambientales, capacitaciones y actas de EPP),
//                   dejando la plataforma completamente limpia para comenzar las operaciones de una <strong>nueva empresa o nuevo ciclo anual</strong>.
//                   La cuenta de administrador principal será conservada para asegurar el acceso continuo.
//                 </p>
//               </div>
//             </div>

//             {/* Configuración de Nueva Empresa al Resetear */}
//             <div style={{
//               background: '#f8fafc',
//               padding: '20px',
//               borderRadius: '16px',
//               border: '1px solid #e2e8f0'
//             }}>
//               <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
//                 Datos de la Nueva Organización (Opcional - puede configurarse después)
//               </h4>

//               <div className="ssoma-form-grid">
//                 <div className="ssoma-form-group full">
//                   <label className="ssoma-label">Razón Social de la Nueva Empresa</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. Minera Los Andes S.A.C."
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.razon_social}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, razon_social: e.target.value })}
//                   />
//                 </div>
//                 <div className="ssoma-form-group">
//                   <label className="ssoma-label">RUC de la Nueva Empresa</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. 20554433221"
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.ruc}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, ruc: e.target.value })}
//                   />
//                 </div>
//                 <div className="ssoma-form-group">
//                   <label className="ssoma-label">Rubro Principal</label>
//                   <input
//                     type="text"
//                     placeholder="Ej. Construcción y Montaje"
//                     className="ssoma-input"
//                     value={nuevaEmpresaForm.rubro}
//                     onChange={(e) => setNuevaEmpresaForm({ ...nuevaEmpresaForm, rubro: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div style={{ marginTop: '14px' }}>
//                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
//                   <input
//                     type="checkbox"
//                     checked={limpiarPersonalYAreas}
//                     onChange={(e) => setLimpiarPersonalYAreas(e.target.checked)}
//                   />
//                   <span>Reiniciar también el directorio de personal, áreas y catálogo de EPP (iniciar con plantilla base)</span>
//                 </label>
//               </div>
//             </div>

//             {/* Reto de Seguridad */}
//             <div style={{
//               background: '#fff1f2',
//               padding: '20px',
//               borderRadius: '16px',
//               border: '1px solid #ffe4e6',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '12px'
//             }}>
//               <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c' }}>
//                 Reto de Seguridad Obligatorio:
//               </div>
//               <p style={{ fontSize: '0.8rem', color: '#881337' }}>
//                 Para evitar accidentes, escriba exactamente <strong style={{ textDecoration: 'underline' }}>CONFIRMAR RESET</strong> en el siguiente campo:
//               </p>
//               <div style={{ display: 'flex', gap: '12px', maxWidth: '480px' }}>
//                 <input
//                   type="text"
//                   placeholder="Escriba CONFIRMAR RESET"
//                   className="ssoma-input"
//                   style={{
//                     fontWeight: 800,
//                     letterSpacing: '1px',
//                     borderColor: resetConfirmText === 'CONFIRMAR RESET' ? '#10b981' : '#fda4af'
//                   }}
//                   value={resetConfirmText}
//                   onChange={(e) => setResetConfirmText(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   disabled={resetConfirmText !== 'CONFIRMAR RESET' || isResetting}
//                   onClick={() => setShowResetModal(true)}
//                   style={{
//                     padding: '10px 20px',
//                     borderRadius: '12px',
//                     background: resetConfirmText === 'CONFIRMAR RESET' ? '#e11d48' : '#cbd5e1',
//                     color: '#ffffff',
//                     border: 'none',
//                     fontWeight: 800,
//                     fontSize: '0.85rem',
//                     cursor: resetConfirmText === 'CONFIRMAR RESET' ? 'pointer' : 'not-allowed',
//                     whiteSpace: 'nowrap',
//                     boxShadow: resetConfirmText === 'CONFIRMAR RESET' ? '0 4px 14px rgba(225, 29, 72, 0.35)' : 'none'
//                   }}
//                 >
//                   Resetear Sistema
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ========================================================= */}
//         {/* TAB 5: DIAGNÓSTICO & NORMATIVAS                           */}
//         {/* ========================================================= */}
//         {activeTab === 'diagnostico' && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
//             {/* Card de Conexión a Base de Datos MySQL */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '24px',
//               boxShadow: 'var(--shadow-sm)',
//               border: '1px solid #edf2f7'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                 <div style={{
//                   width: '42px',
//                   height: '42px',
//                   borderRadius: '12px',
//                   background: '#e0f2fe',
//                   color: '#0284c7',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Database size={22} />
//                 </div>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Servidor MySQL
//                   </h3>
//                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Conexión activa a base de datos de producción</p>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Host:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>localhost</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Puerto:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>3306</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Base de Datos:</span>
//                   <span style={{ fontWeight: 800, color: '#10b981' }}>dev_ssoma</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <span style={{ color: '#64748b', fontWeight: 600 }}>Usuario:</span>
//                   <span style={{ fontWeight: 700, color: '#0f172a' }}>root</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#dcfce7', borderRadius: '10px', color: '#15803d', fontWeight: 700 }}>
//                   <span>Estado:</span>
//                   <span>🟢 Conectado y Operativo (13 tablas)</span>
//                 </div>
//               </div>
//             </div>

//             {/* Card de Normativas Legales */}
//             <div style={{
//               background: '#ffffff',
//               borderRadius: '20px',
//               padding: '24px',
//               boxShadow: 'var(--shadow-sm)',
//               border: '1px solid #edf2f7'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                 <div style={{
//                   width: '42px',
//                   height: '42px',
//                   borderRadius: '12px',
//                   background: '#dcfce7',
//                   color: '#10b981',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Shield size={22} />
//                 </div>
//                 <div>
//                   <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
//                     Estándares & Normativas SSOMA
//                   </h3>
//                   <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Marcos de gestión y cumplimiento legal</p>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>ISO 45001:2018</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sistemas de Gestión de la Seguridad y Salud en el Trabajo</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>ISO 14001:2015</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sistemas de Gestión Ambiental y Control de Huella Ecológica</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>Ley N° 29783 & D.S. 005-2012-TR</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ley de Seguridad y Salud en el Trabajo e IPERC continuo</div>
//                 </div>
//                 <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '10px' }}>
//                   <div style={{ fontWeight: 700, color: '#0f172a' }}>NTP 900.058:2019</div>
//                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Código de Colores para el Almacenamiento de Residuos Sólidos</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Modal de Confirmación de Restauración */}
//         {showRestoreModal && (
//           <div className="ssoma-modal-overlay" onClick={() => setShowRestoreModal(false)}>
//             <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
//               <div className="ssoma-modal-header" style={{ background: '#4f46e5', color: '#fff' }}>
//                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
//                   ¿Confirmar Restauración de Base de Datos?
//                 </h3>
//                 <button onClick={() => setShowRestoreModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
//               </div>
//               <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
//                   Esta acción sobreescribirá las tablas existentes con el contenido del archivo de copia de seguridad
//                   <strong> {restorePreview?.nombre}</strong>.
//                 </p>
//                 <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontSize: '0.78rem', fontWeight: 600 }}>
//                   ⚠️ Se recomienda haber descargado una copia de seguridad reciente antes de continuar.
//                 </div>
//               </div>
//               <div className="ssoma-modal-footer">
//                 <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowRestoreModal(false)}>Cancelar</button>
//                 <button
//                   className="ssoma-btn ssoma-btn-primary"
//                   style={{ background: '#4f46e5' }}
//                   disabled={isRestoring}
//                   onClick={handleExecuteRestore}
//                 >
//                   {isRestoring ? 'Restaurando...' : 'Sí, Restaurar Ahora'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Modal de Confirmación de Reset del Sistema */}
//         {showResetModal && (
//           <div className="ssoma-modal-overlay" onClick={() => setShowResetModal(false)}>
//             <div className="ssoma-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
//               <div className="ssoma-modal-header" style={{ background: '#e11d48', color: '#fff' }}>
//                 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
//                   ⚠️ Confirmación Final de Reset
//                 </h3>
//                 <button onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
//               </div>
//               <div className="ssoma-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
//                   ¿Está absolutamente seguro de proceder con el vaciado del sistema?
//                 </p>
//                 <ul style={{ fontSize: '0.8rem', color: '#e11d48', paddingLeft: '20px', lineHeight: 1.4 }}>
//                   <li>Se eliminarán todos los incidentes registrados</li>
//                   <li>Se vaciarán inspecciones, hallazgos y matrices IPERC</li>
//                   <li>Se limpiarán pesajes ambientales y capacitaciones</li>
//                   <li>Se conservará el usuario administrador para el inicio de sesión</li>
//                 </ul>
//               </div>
//               <div className="ssoma-modal-footer">
//                 <button className="ssoma-btn ssoma-btn-secondary" onClick={() => setShowResetModal(false)}>Cancelar</button>
//                 <button
//                   className="ssoma-btn"
//                   style={{ background: '#e11d48', color: '#fff', fontWeight: 800, border: 'none' }}
//                   disabled={isResetting}
//                   onClick={handleExecuteReset}
//                 >
//                   {isResetting ? 'Vaciando registros...' : 'Confirmar y Resetear'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
