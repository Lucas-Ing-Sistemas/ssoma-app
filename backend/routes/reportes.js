const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/reportes/mensual
router.get('/mensual', async (req, res) => {
  try {
    const pool = getPool();

    const [incidentes] = await pool.query(`
      SELECT 
        severidad,
        COUNT(*) as total,
        SUM(dias_perdidos) as dias_perdidos,
        SUM(costo_estimado) as costo_total
      FROM incidentes
      GROUP BY severidad
    `);

    const [inspecciones] = await pool.query(`
      SELECT 
        tipo,
        COUNT(*) as total,
        AVG(puntaje_cumplimiento) as promedio
      FROM inspecciones
      GROUP BY tipo
    `);

    const [residuos] = await pool.query(`
      SELECT 
        clase,
        SUM(cantidad_kg) as total_kg
      FROM residuos_ambientales
      GROUP BY clase
    `);

    const [monitoreo] = await pool.query(`
      SELECT 
        parametro,
        valor_medido,
        limite_permisible,
        unidad,
        estado_cumplimiento
      FROM monitoreo_ambiental
    `);

    res.json({
      success: true,
      reporte: {
        titulo: 'Informe Ejecutivo Mensual SSOMA - Gestión Ambiental y Seguridad',
        periodo: 'Septiembre 2026',
        empresa: 'Corporación Industrial & Minera EcoSafe S.A.C.',
        elaboradoPor: 'Ing. Carlos Mendoza (Jefe SSOMA)',
        diasSinAccidentes: 184,
        indiceFrecuencia: '1.12',
        indiceSeveridad: '0.45',
        incidentes,
        inspecciones,
        residuos,
        monitoreo,
        fechaGeneracion: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generando reporte mensual.' });
  }
});

module.exports = router;
