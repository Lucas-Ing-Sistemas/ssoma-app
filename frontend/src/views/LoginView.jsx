import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ssoma.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { name: 'Jefe SSOMA', email: 'admin@ssoma.com' },
    { name: 'Supervisora', email: 'supervisor@ssoma.com' },
    { name: 'Auditora', email: 'auditor@ssoma.com' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        login(data.user, data.token);
      } else {
        setError(data.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor backend en https://ssoma-app-fbwe.onrender.com');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (accountEmail) => {
    setEmail(accountEmail);
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="login-responsive-container">
      {/* Panel Verde Institucional */}
      <div className="login-brand-panel">
        {/* Rombos decorativos */}
        <div className="login-decor-diamond diamond-top" />
        <div className="login-decor-diamond diamond-bottom" />

        <div className="login-brand-content">
          <div className="login-brand-icon">
            <ShieldCheck size={48} strokeWidth={2.2} color="#ffffff" />
          </div>
          <h1 className="login-brand-title">CUMPLESST</h1>
          <p className="login-brand-subtitle">Seguridad y Salud en el Trabajo</p>
        </div>
      </div>

      {/* Panel Blanco de Acceso */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-form-header-badge">
            <div className="login-form-icon-circle">
              <ShieldCheck size={36} strokeWidth={2} />
            </div>
          </div>

          {error && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form-body">
            {/* Input Correo */}
            <div className="login-field-group">
              <div className="login-field-icon user-icon">
                <User size={18} color="#0d5f3d" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico / Usuario"
                className="login-input-text"
              />
            </div>

            {/* Input Contraseña */}
            <div className="login-field-group">
              <div className="login-field-icon lock-icon">
                <Lock size={18} color="#64748b" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="login-input-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Recordarme */}
            <div className="login-remember-row">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <label htmlFor="remember" className="login-checkbox-label">
                Recordarme
              </label>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? 'Ingresando...' : 'INGRESAR'}
            </button>
          </form>

          {/* Accesos Rápidos Demo */}
          <div className="login-demo-section">
            <span className="login-demo-label">
              ACCESO RÁPIDO PARA DEMOSTRACIÓN
            </span>
            <div className="login-demo-grid">
              {demoAccounts.map((acc) => {
                const isActive = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => selectDemoUser(acc.email)}
                    className={`login-demo-btn ${isActive ? 'active' : ''}`}
                  >
                    {acc.name}
                  </button>
                );
              })}
            </div>

            <div className="login-compliance-footer">
              Conforme a Ley 29783 • ISO 45001 • ISO 14001
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






















// import React, { useState } from 'react';
// import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// export default function LoginView() {
//   const { login } = useAuth();
//   const [email, setEmail] = useState('admin@ssoma.com');
//   const [password, setPassword] = useState('admin123');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const demoAccounts = [
//     { name: 'Jefe SSOMA', email: 'admin@ssoma.com' },
//     { name: 'Supervisora', email: 'supervisor@ssoma.com' },
//     { name: 'Auditora', email: 'auditor@ssoma.com' }
//   ];

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });
//       const data = await res.json();

//       if (data.success) {
//         login(data.user, data.token);
//       } else {
//         setError(data.message || 'Error al iniciar sesión.');
//       }
//     } catch (err) {
//       setError('No se pudo conectar con el servidor backend en https://ssoma-app-fbwe.onrender.com');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectDemoUser = (accountEmail) => {
//     setEmail(accountEmail);
//     setPassword('admin123');
//     setError('');
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       width: '100vw',
//       display: 'flex',
//       flexDirection: 'row',
//       margin: 0,
//       padding: 0,
//       overflow: 'hidden',
//       fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif'
//     }}>
//       {/* Panel Izquierdo Verde Corporativo (CUMPLESST) */}
//       <div style={{
//         flex: '1 1 55%',
//         backgroundColor: '#0d5c38',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//         overflow: 'hidden',
//         padding: '40px',
//         boxSizing: 'border-box'
//       }}>
//         {/* Rombos decorativos de fondo */}
//         <div style={{
//           position: 'absolute',
//           width: '560px',
//           height: '560px',
//           border: '1.5px solid rgba(255, 255, 255, 0.08)',
//           transform: 'rotate(45deg)',
//           top: '-180px',
//           left: '-180px',
//           pointerEvents: 'none'
//         }} />
//         <div style={{
//           position: 'absolute',
//           width: '520px',
//           height: '520px',
//           border: '1.5px solid rgba(255, 255, 255, 0.08)',
//           transform: 'rotate(45deg)',
//           bottom: '-160px',
//           right: '-140px',
//           pointerEvents: 'none'
//         }} />

//         {/* Branding Central */}
//         <div style={{ textAlign: 'center', zIndex: 1, color: '#ffffff' }}>
//           <div style={{
//             width: '92px',
//             height: '92px',
//             borderRadius: '50%',
//             border: '3px solid rgba(255, 255, 255, 0.85)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             margin: '0 auto 24px'
//           }}>
//             <ShieldCheck size={52} strokeWidth={2.2} color="#ffffff" />
//           </div>
//           <h1 style={{
//             fontSize: '2.8rem',
//             fontWeight: 800,
//             letterSpacing: '2px',
//             margin: 0,
//             textTransform: 'uppercase'
//           }}>
//             CUMPLESST
//           </h1>
//           <p style={{
//             fontSize: '1.05rem',
//             fontWeight: 400,
//             opacity: 0.9,
//             marginTop: '12px',
//             letterSpacing: '0.4px'
//           }}>
//             Seguridad y Salud en el Trabajo
//           </p>
//         </div>
//       </div>

//       {/* Panel Derecho Blanco (Formulario y Accesos) */}
//       <div style={{
//         flex: '1 1 45%',
//         backgroundColor: '#fbfcfd',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '40px 30px',
//         boxSizing: 'border-box'
//       }}>
//         <div style={{ width: '100%', maxWidth: '380px' }}>
//           {/* Logo / Escudo Verde Superior */}
//           <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//             <div style={{
//               width: '64px',
//               height: '64px',
//               border: '2.5px solid #0d5c38',
//               borderRadius: '50%',
//               display: 'inline-flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: '#0d5c38'
//             }}>
//               <ShieldCheck size={36} strokeWidth={2} />
//             </div>
//           </div>

//           {error && (
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px',
//               padding: '12px 14px',
//               background: '#fef2f2',
//               border: '1px solid #fecaca',
//               borderRadius: '8px',
//               color: '#dc2626',
//               fontSize: '0.82rem',
//               marginBottom: '20px'
//             }}>
//               <AlertCircle size={18} />
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//             {/* Input Correo con Icono Izquierdo */}
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               border: '1px solid #a3cfbb',
//               borderRadius: '6px',
//               overflow: 'hidden',
//               background: '#ffffff',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
//             }}>
//               <div style={{
//                 background: '#e8f4ee',
//                 padding: '13px 14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRight: '1px solid #c8e6d9'
//               }}>
//                 <User size={18} color="#0d5c38" />
//               </div>
//               <input
//                 type="text"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Correo electrónico / Usuario"
//                 style={{
//                   border: 'none',
//                   outline: 'none',
//                   padding: '12px 14px',
//                   fontSize: '0.9rem',
//                   color: '#334155',
//                   width: '100%',
//                   background: 'transparent'
//                 }}
//               />
//             </div>

//             {/* Input Contraseña con Icono y Toggle Visibilidad */}
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               border: '1px solid #e2e8f0',
//               borderRadius: '6px',
//               overflow: 'hidden',
//               background: '#ffffff',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
//             }}>
//               <div style={{
//                 background: '#f1f5f9',
//                 padding: '13px 14px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRight: '1px solid #e2e8f0'
//               }}>
//                 <Lock size={18} color="#64748b" />
//               </div>
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Contraseña"
//                 style={{
//                   border: 'none',
//                   outline: 'none',
//                   padding: '12px 14px',
//                   fontSize: '0.9rem',
//                   color: '#334155',
//                   width: '100%',
//                   background: 'transparent'
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   cursor: 'pointer',
//                   padding: '0 14px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   color: '#94a3b8'
//                 }}
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             {/* Checkbox Recordarme */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
//               <input
//                 id="remember"
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 style={{
//                   accentColor: '#0d5c38',
//                   width: '16px',
//                   height: '16px',
//                   cursor: 'pointer'
//                 }}
//               />
//               <label htmlFor="remember" style={{ fontSize: '0.84rem', color: '#64748b', cursor: 'pointer' }}>
//                 Recordarme
//               </label>
//             </div>

//             {/* Botón Principal INGRESAR */}
//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 marginTop: '10px',
//                 backgroundColor: '#0d5c38',
//                 color: '#ffffff',
//                 border: 'none',
//                 borderRadius: '24px',
//                 padding: '13px 0',
//                 fontSize: '0.95rem',
//                 fontWeight: 700,
//                 letterSpacing: '1px',
//                 textTransform: 'uppercase',
//                 cursor: 'pointer',
//                 boxShadow: '0 4px 12px rgba(13, 92, 56, 0.25)',
//                 transition: 'background-color 0.2s, opacity 0.2s',
//                 opacity: loading ? 0.75 : 1
//               }}
//             >
//               {loading ? 'Ingresando...' : 'INGRESAR'}
//             </button>
//           </form>

//           {/* Acceso Rápido para Demostración (Conservado de la Imagen 3) */}
//           <div style={{
//             marginTop: '32px',
//             paddingTop: '20px',
//             borderTop: '1px solid #e2e8f0'
//           }}>
//             <span style={{
//               fontSize: '0.73rem',
//               color: '#64748b',
//               fontWeight: 700,
//               display: 'block',
//               marginBottom: '12px',
//               textAlign: 'center',
//               letterSpacing: '0.5px'
//             }}>
//               ACCESO RÁPIDO PARA DEMOSTRACIÓN
//             </span>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
//               {demoAccounts.map((acc) => {
//                 const isActive = email === acc.email;
//                 return (
//                   <button
//                     key={acc.email}
//                     type="button"
//                     onClick={() => selectDemoUser(acc.email)}
//                     style={{
//                       padding: '9px 4px',
//                       background: isActive ? '#e8f4ee' : '#f8fafc',
//                       border: `1.5px solid ${isActive ? '#0d5c38' : '#cbd5e1'}`,
//                       borderRadius: '20px',
//                       color: isActive ? '#0d5c38' : '#475569',
//                       fontSize: '0.75rem',
//                       fontWeight: 700,
//                       cursor: 'pointer',
//                       textAlign: 'center',
//                       transition: 'all 0.15s ease'
//                     }}
//                   >
//                     {acc.name}
//                   </button>
//                 );
//               })}
//             </div>

//             <div style={{
//               marginTop: '20px',
//               textAlign: 'center',
//               fontSize: '0.72rem',
//               color: '#94a3b8'
//             }}>
//               Conforme a Ley 29783 • ISO 45001 • ISO 14001
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
















// import React, { useState } from 'react';
// import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// export default function LoginView() {
//   const { login } = useAuth();
//   const [email, setEmail] = useState('admin@ssoma.com');
//   const [password, setPassword] = useState('admin123');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const demoAccounts = [
//     { name: 'Jefe SSOMA', email: 'admin@ssoma.com', role: 'Administrador General' },
//     { name: 'Supervisora', email: 'supervisor@ssoma.com', role: 'Seguridad en Campo' },
//     { name: 'Auditora', email: 'auditor@ssoma.com', role: 'Trinorma ISO' }
//   ];

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const res = await fetch('https://ssoma-app-fbwe.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });
//       const data = await res.json();

//       if (data.success) {
//         login(data.user, data.token);
//       } else {
//         setError(data.message || 'Error al iniciar sesión.');
//       }
//     } catch (err) {
//       setError('No se pudo conectar con el servidor backend en https://ssoma-app-fbwe.onrender.com');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectDemoUser = (accountEmail) => {
//     setEmail(accountEmail);
//     setPassword('admin123');
//     setError('');
//   };

//   return (
//     <div style={{
//       minHeight: '100vh',
//       width: '100vw',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: 'radial-gradient(circle at 10% 20%, #0d1527 0%, #060a14 90%)',
//       fontFamily: 'var(--font-main)',
//       padding: '20px',
//       position: 'relative',
//       overflow: 'hidden'
//     }}>
//       {/* Decorative background glow spheres */}
//       <div style={{
//         position: 'absolute',
//         width: '500px',
//         height: '500px',
//         borderRadius: '50%',
//         background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
//         top: '-150px',
//         left: '-100px',
//         pointerEvents: 'none'
//       }}></div>
//       <div style={{
//         position: 'absolute',
//         width: '600px',
//         height: '600px',
//         borderRadius: '50%',
//         background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
//         bottom: '-200px',
//         right: '-150px',
//         pointerEvents: 'none'
//       }}></div>

//       <div style={{
//         maxWidth: '460px',
//         width: '100%',
//         background: 'rgba(255, 255, 255, 0.04)',
//         backdropFilter: 'blur(16px)',
//         border: '1px solid rgba(255, 255, 255, 0.12)',
//         borderRadius: '24px',
//         padding: '36px 32px',
//         boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//         zIndex: 10
//       }}>
//         {/* Brand Header */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
//           <div style={{
//             width: '48px',
//             height: '48px',
//             borderRadius: '14px',
//             background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             boxShadow: '0 8px 18px rgba(16, 185, 129, 0.4)'
//           }}>
//             <ShieldCheck size={28} color="#ffffff" />
//           </div>
//           <div>
//             <h2 style={{
//               fontFamily: 'var(--font-display)',
//               fontSize: '1.45rem',
//               fontWeight: 800,
//               color: '#ffffff',
//               letterSpacing: '-0.5px'
//             }}>
//               SSOMA Suite
//             </h2>
//             <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
//               Seguridad, Salud & Gestión Ambiental
//             </p>
//           </div>
//         </div>

//         <div style={{ marginBottom: '24px' }}>
//           <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
//             Bienvenido al Sistema
//           </h3>
//           <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
//             Ingrese sus credenciales de acceso institucional
//           </p>
//         </div>

//         {error && (
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             padding: '12px 14px',
//             background: 'rgba(239, 68, 68, 0.15)',
//             border: '1px solid rgba(239, 68, 68, 0.3)',
//             borderRadius: '12px',
//             color: '#fca5a5',
//             fontSize: '0.82rem',
//             marginBottom: '20px'
//           }}>
//             <AlertCircle size={18} />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Formulario */}
//         <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           <div>
//             <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
//               Correo Electrónico
//             </label>
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px',
//               background: 'rgba(255, 255, 255, 0.07)',
//               border: '1px solid rgba(255, 255, 255, 0.15)',
//               borderRadius: '12px',
//               padding: '12px 14px',
//               transition: 'all 0.2s'
//             }}>
//               <Mail size={18} color="#94a3b8" />
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="usuario@ssoma.com"
//                 style={{
//                   background: 'transparent',
//                   border: 'none',
//                   outline: 'none',
//                   color: '#ffffff',
//                   fontSize: '0.88rem',
//                   width: '100%'
//                 }}
//               />
//             </div>
//           </div>

//           <div>
//             <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
//               Contraseña
//             </label>
//             <div style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '10px',
//               background: 'rgba(255, 255, 255, 0.07)',
//               border: '1px solid rgba(255, 255, 255, 0.15)',
//               borderRadius: '12px',
//               padding: '12px 14px'
//             }}>
//               <Lock size={18} color="#94a3b8" />
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 style={{
//                   background: 'transparent',
//                   border: 'none',
//                   outline: 'none',
//                   color: '#ffffff',
//                   fontSize: '0.88rem',
//                   width: '100%'
//                 }}
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '10px',
//               marginTop: '10px',
//               padding: '13px',
//               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//               color: '#ffffff',
//               border: 'none',
//               borderRadius: '12px',
//               fontSize: '0.92rem',
//               fontWeight: 700,
//               cursor: 'pointer',
//               boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
//               transition: 'all 0.2s'
//             }}
//           >
//             {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
//             <ArrowRight size={18} />
//           </button>
//         </form>

//         {/* Demo Fast Access Buttons */}
//         <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
//           <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px', textAlign: 'center' }}>
//             ACCESO RÁPIDO PARA DEMOSTRACIÓN
//           </span>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
//             {demoAccounts.map((acc) => (
//               <button
//                 key={acc.email}
//                 type="button"
//                 onClick={() => selectDemoUser(acc.email)}
//                 style={{
//                   padding: '8px 6px',
//                   background: email === acc.email ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
//                   border: `1px solid ${email === acc.email ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
//                   borderRadius: '10px',
//                   color: email === acc.email ? '#34d399' : '#e2e8f0',
//                   fontSize: '0.72rem',
//                   fontWeight: 600,
//                   cursor: 'pointer',
//                   textAlign: 'center',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 <div>{acc.name}</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.7rem', color: '#64748b' }}>
//           Conforme a Ley 29783 • ISO 45001 • ISO 14001
//         </div>
//       </div>
//     </div>
//   );
// }
