const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const incidentesRoutes = require('./routes/incidentes');
const inspeccionesRoutes = require('./routes/inspecciones');
const ipercRoutes = require('./routes/iperc');
const ambientalRoutes = require('./routes/ambiental');
const capacitacionesRoutes = require('./routes/capacitaciones');
const eppRoutes = require('./routes/epp');
const personalRoutes = require('./routes/personal');
const reportesRoutes = require('./routes/reportes');
const configuracionRoutes = require('./routes/configuracion');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging sencillo de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SSOMA Seguridad y Medio Ambiente API',
    database: 'dev_ssoma',
    timestamp: new Date().toISOString()
  });
});

// Rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidentes', incidentesRoutes);
app.use('/api/inspecciones', inspeccionesRoutes);
app.use('/api/iperc', ipercRoutes);
app.use('/api/ambiental', ambientalRoutes);
app.use('/api/capacitaciones', capacitacionesRoutes);
app.use('/api/epp', eppRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno en el servidor SSOMA.',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor SSOMA Backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos MySQL conectada en dev_ssoma`);
});
