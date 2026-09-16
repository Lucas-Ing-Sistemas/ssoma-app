const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/capacitaciones
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') as fecha_fmt,
        a.nombre as area_nombre
      FROM capacitaciones c
      LEFT JOIN areas a ON c.area_id = a.id
      ORDER BY c.fecha DESC
    `);

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_sesiones,
        SUM(total_asistentes) as total_personas,
        SUM(horas_hombre_total) as total_hh
      FROM capacitaciones
    `);

    res.json({ success: true, data: rows, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cargando capacitaciones.' });
  }
});

// POST /api/capacitaciones
router.post('/', async (req, res) => {
  try {
    const { tema, tipo, expositor, fecha, duracion_horas, area_id, total_asistentes, estado } = req.body;
    const pool = getPool();

    const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM capacitaciones');
    const codigo = `CAP-2026-${(cnt[0].cnt + 1).toString().padStart(2, '0')}`;

    const dur = parseFloat(duracion_horas || 2);
    const asist = parseInt(total_asistentes || 0, 10);
    const hh = dur * asist;

    const [result] = await pool.query(`
      INSERT INTO capacitaciones (
        codigo, tema, tipo, estado, expositor, fecha, duracion_horas, area_id, total_asistentes, horas_hombre_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, tema, tipo || 'Seguridad Preventiva', estado || 'Programada',
      expositor, fecha || new Date(), dur, area_id || null, asist, hh
    ]);

    res.status(201).json({ success: true, message: 'Capacitación programada con éxito', id: result.insertId, codigo, hh });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al programar capacitación.' });
  }
});

module.exports = router;
