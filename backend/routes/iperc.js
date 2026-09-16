const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/iperc
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        ip.*,
        DATE_FORMAT(ip.fecha_evaluacion, '%Y-%m-%d') as fecha_fmt,
        a.nombre as area_nombre,
        CONCAT(t.nombres, ' ', t.apellidos) as responsable_nombre
      FROM iperc ip
      LEFT JOIN areas a ON ip.area_id = a.id
      LEFT JOIN trabajadores t ON ip.responsable_id = t.id
      ORDER BY (ip.probabilidad * ip.severidad) DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cargando matriz IPERC.' });
  }
});

// POST /api/iperc
router.post('/', async (req, res) => {
  try {
    const {
      proceso, actividad, tarea, peligro, riesgo,
      probabilidad, severidad, jerarquia_control, medidas_control,
      area_id, responsable_id, fecha_evaluacion
    } = req.body;

    const prob = parseInt(probabilidad || 1, 10);
    const sev = parseInt(severidad || 1, 10);
    const score = prob * sev;
    let nivel_riesgo = 'Bajo';
    if (score >= 15) nivel_riesgo = 'Crítico';
    else if (score >= 9) nivel_riesgo = 'Alto';
    else if (score >= 5) nivel_riesgo = 'Medio';

    const pool = getPool();
    const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM iperc');
    const codigo = `IPERC-2026-${(cnt[0].cnt + 1).toString().padStart(2, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO iperc (
        codigo, proceso, actividad, tarea, peligro, riesgo,
        probabilidad, severidad, nivel_riesgo, jerarquia_control, medidas_control,
        area_id, responsable_id, fecha_evaluacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, proceso, actividad, tarea, peligro, riesgo,
      prob, sev, nivel_riesgo, jerarquia_control || 'EPP', medidas_control,
      area_id || null, responsable_id || null, fecha_evaluacion || new Date()
    ]);

    res.status(201).json({ success: true, message: 'Registro IPERC agregado con éxito', id: result.insertId, codigo, nivel_riesgo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error registrando matriz IPERC.' });
  }
});

module.exports = router;
