# Plan de Implementación: Sistema Web SSOMA (Seguridad, Salud Ocupacional y Medio Ambiente)

Desarrollo de una solución web integral para la gestión de **SSOMA** orientada a estándares reales (ISO 45001, ISO 14001 y normativas de seguridad y salud en el trabajo como la Ley 29783). La aplicación contará con una arquitectura cliente-servidor completa: **Frontend en React con Vite**, **Backend en Node.js con Express** y base de datos relacional en **MySQL (localhost:3306, base de datos `dev_ssoma`)**.

El diseño visual adaptará y elevará la interfaz propuesta en el mockup:
1. **Sidebar vertical oscuro** con navegación completa por módulos, logo corporativo, indicador de estado activo y botón de cierre de sesión.
2. **Dashboard ejecutivo principal** con las 4 tarjetas KPI en gradientes (Días sin accidentes, Incidentes del mes, Cumplimiento de inspecciones, Residuos/Monitoreo ambiental), gráfico interactivo de tendencia de ondas/spline, tabla estilizada de eventos recientes con avatares y badges de estado.
3. **Panel lateral derecho** con velocímetro/donut de nivel de riesgo y tarjeta de acción rápida para descargar el Reporte Mensual SSOMA en PDF.
4. **Módulo de Login profesional** con credenciales rápidas de prueba y diseño industrial/ambiental moderno.
5. **Módulos operativos completos** para casos de negocio reales (Incidentes, Inspecciones, Matriz IPERC 5x5, Gestión Ambiental y Residuos, Capacitaciones y Horas-Hombre, Control de EPPs y Directorio de Personal).

---

## User Review Required

> [!IMPORTANT]
> - **Servidor MySQL local**: Se utilizará el servidor MySQL activo en `localhost:3306` con usuario `root` y contraseña vacía (o configurada vía `.env`).
> - **Creación automática de BD**: Se incluirá un script de inicialización (`npm run init-db` y auto-arranque en backend) que creará la base de datos `dev_ssoma` con todas sus tablas relacionales y datos semilla realistas precargados.

---

## Proposed Changes

### 1. Base de Datos MySQL (`dev_ssoma`)

#### [NEW] [backend/scripts/init_db.js](file:///c:/DEV/dev_ssoma/backend/scripts/init_db.js)
Script de inicialización para crear la base de datos `dev_ssoma` e insertar tablas con relaciones foráneas:
- `usuarios`: Autenticación, roles (`admin`, `supervisor`, `medico_ssoma`, `auditor`).
- `areas`: Plantas, almacenes, operaciones, oficinas, mantenimiento.
- `trabajadores`: Personal con DNI, cargo, área y contacto.
- `incidentes`: Registro de accidentes, incidentes y cuasi-accidentes, severidad (Leve, Grave, Fatal), días perdidos, causa raíz y estado (`Reportado`, `En Investigación`, `Cerrado`).
- `inspecciones`: Programa de inspecciones periódicas, puntajes de cumplimiento y observaciones.
- `hallazgos`: Actos y condiciones subestándar asociadas a inspecciones con plazos de subsanación.
- `iperc`: Matriz de identificación de peligros y evaluación de riesgos (probabilidad x severidad 5x5) con controles operacionales.
- `residuos_ambientales`: Control de residuos sólidos peligrosos y no peligrosos por clase y peso (kg), disposición final.
- `monitoreo_ambiental`: Medición de ruido ambiental (dB), material particulado (PPM), gases y efluentes vs límites máximos permisibles (LMP).
- `capacitaciones`: Inducciones, cursos de seguridad, horas-hombre de formación y registro de asistentes.
- `tipos_epp`: Catálogo de EPPs con stocks y alertas mínimas.
- `entregas_epp`: Trazabilidad de entrega de equipos de protección personal por trabajador.

---

### 2. Backend Node.js / Express (`backend/`)

#### [NEW] [backend/package.json](file:///c:/DEV/dev_ssoma/backend/package.json)
Configuración de dependencias: `express`, `mysql2`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`.

#### [NEW] [backend/config/db.js](file:///c:/DEV/dev_ssoma/backend/config/db.js)
Conexión mediante `mysql2/promise` con pool de conexiones y fallback seguro para inicializar la base de datos si no existe.

#### [NEW] [backend/controllers/ & routes/](file:///c:/DEV/dev_ssoma/backend/routes/)
- `authRoutes.js`: Login con JWT y perfiles demostrativos.
- `dashboardRoutes.js`: Cálculo en tiempo real de KPIs (Días sin accidentes, IF/IS, tasa de resolución, serie histórica mensual, distribución de riesgos).
- `incidentesRoutes.js`: CRUD completo de incidentes con estadísticas y cambio de estados.
- `inspeccionesRoutes.js`: Listado de inspecciones y registro de hallazgos.
- `ipercRoutes.js`: Matriz IPERC interactiva y cálculo de criticidad.
- `ambientalRoutes.js`: Métricas de residuos y monitoreo ambiental.
- `capacitacionesRoutes.js`: Cronograma de capacitaciones y conteo de horas-hombre.
- `eppRoutes.js`: Kardex de EPPs y asignación a trabajadores.
- `reportesRoutes.js`: Generación de datos de reporte mensual para exportación/impresión.

---

### 3. Frontend React + Vite (`frontend/`)

#### [NEW] [frontend/package.json](file:///c:/DEV/dev_ssoma/frontend/package.json)
Proyecto React con Vite, iconos `lucide-react` para una interfaz limpia y moderna.

#### [NEW] [frontend/src/index.css](file:///c:/DEV/dev_ssoma/frontend/src/index.css)
Sistema de diseño completo inspirado en el mockup:
- Tipografía moderna (Inter / Outfit).
- Paleta cromática corporativa: Slate Navy (`#0b132b`, `#1c2541`) para sidebar, fondo suave `#f4f6fb`, tarjetas redondeadas (`18px`) con sutil sombra glassmorphism.
- Gradientes vibrantes para los 4 KPIs (Esmeralda/Cyan, Índigo/Violeta, Ámbar/Naranja, Carmesí/Rosa).
- Badges de severidad y estado con colores semánticos claros.

#### [NEW] [frontend/src/components/Sidebar.jsx](file:///c:/DEV/dev_ssoma/frontend/src/components/Sidebar.jsx)
Barra lateral vertical con el estilo exacto de la imagen de referencia:
- Logotipo de SSOMA con insignia ecológica.
- Navegación con iconos:
  - 📊 **Dashboard General**
  - ⚠️ **Incidentes & Accidentes**
  - 📋 **Inspecciones & Hallazgos**
  - 🎯 **Matriz IPERC**
  - 🌿 **Gestión Ambiental**
  - 🎓 **Capacitaciones & HH**
  - 🦺 **Control de EPP**
  - 👥 **Personal & Áreas**
  - ⚙️ **Configuración**
- Botón inferior de Cerrar Sesión.

#### [NEW] [frontend/src/components/Header.jsx](file:///c:/DEV/dev_ssoma/frontend/src/components/Header.jsx)
Barra superior con buscador dinámico, selector de período, campana de notificaciones con conteo de alertas y badge de perfil de usuario.

#### [NEW] [frontend/src/components/RightPanel.jsx](file:///c:/DEV/dev_ssoma/frontend/src/components/RightPanel.jsx)
Panel lateral derecho fiel al diseño:
- Tarjeta de Índice de Severidad / Seguridad.
- Gráfico Donut de estado de cumplimiento / nivel de riesgo (Bajo, Medio, Alto).
- Banner de acción rápida: **Descargar Reporte Mensual SSOMA (PDF)** con botón interactivo e ilustración técnica.

#### [NEW] [frontend/src/views/LoginView.jsx](file:///c:/DEV/dev_ssoma/frontend/src/views/LoginView.jsx)
Pantalla de inicio de sesión moderna, con credenciales demo de un solo clic para Jefe SSOMA, Supervisor de Campo y Auditor.

#### [NEW] [frontend/src/views/DashboardView.jsx](file:///c:/DEV/dev_ssoma/frontend/src/views/DashboardView.jsx)
Dashboard interactivo principal:
- 4 KPIs superiores con variación porcentual e iconos temáticos.
- Gráfico de ondas / Spline interactivo con puntos de datos y tooltip flotante.
- Tabla de **Últimos Incidentes / Hallazgos** con avatares de trabajadores, badges de estado y severidad, modal para ver detalles o registrar nuevo evento.

#### [NEW] Módulos Operativos Adicionales en Vistas
- `IncidentesView.jsx`: Filtros por severidad, buscador, formulario para registrar nuevo incidente con cálculo de días perdidos y causas.
- `InspeccionesView.jsx`: Checklist de inspección, puntajes de cumplimiento y semáforo de hallazgos.
- `IpercView.jsx`: Matriz interactiva de 5x5 con colores de riesgo extremo, alto, moderado y bajo.
- `AmbientalView.jsx`: Registro de pesaje de residuos (tachos normativos) y monitoreo de decibeles/partículas.
- `CapacitacionesView.jsx`: Programación de cursos y registro de asistencia.
- `EppView.jsx`: Control de stock de cascos, guantes, respiradores y actas de entrega.

---

## Verification Plan

### Automated & Sanity Checks
1. Ejecución del script `init_db.js` para verificar la creación de la base de datos `dev_ssoma` y la carga de datos sin errores de sintaxis MySQL.
2. Comprobación del backend Express en `https://ssoma-app-fbwe.onrender.com/api/health` y `/api/dashboard/stats`.
3. Verificación de compilación del frontend en Vite (`npm run build` o servidor de desarrollo activo).

### Manual Verification
1. Navegación en el navegador:
   - Probar el Login con credenciales predeterminadas.
   - Verificar la correspondencia visual con la imagen de referencia (Sidebar oscuro, 4 KPI cards, gráfico spline interactivo, tabla con avatares, panel derecho con gráfico donut y descarga de reporte).
   - Probar la interacción entre las diferentes pestañas/módulos del menú vertical.
   - Probar el registro o edición de un incidente y comprobar que actualice los datos en vivo.
   - Capturar capturas de pantalla de la interfaz para validar la calidad estética y fidelidad al diseño.
