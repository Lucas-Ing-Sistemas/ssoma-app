const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/inspecciones
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        i.*,
        DATE_FORMAT(i.fecha_programada, '%Y-%m-%d') as fecha_programada_fmt,
        DATE_FORMAT(i.fecha_ejecucion, '%Y-%m-%d') as fecha_ejecucion_fmt,
        a.nombre as area_nombre,
        CONCAT(t.nombres, ' ', t.apellidos) as responsable_nombre,
        (SELECT COUNT(*) FROM hallazgos h WHERE h.inspeccion_id = i.id) as total_hallazgos
      FROM inspecciones i
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN trabajadores t ON i.responsable_id = t.id
      ORDER BY i.fecha_programada DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error listando inspecciones:', err);
    res.status(500).json({ success: false, message: 'Error cargando inspecciones.' });
  }
});

// GET /api/inspecciones/:id/hallazgos
router.get('/:id/hallazgos', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        h.*,
        DATE_FORMAT(h.fecha_limite, '%Y-%m-%d') as fecha_limite_fmt,
        CONCAT(t.nombres, ' ', t.apellidos) as responsable_nombre
      FROM hallazgos h
      LEFT JOIN trabajadores t ON h.responsable_id = t.id
      WHERE h.inspeccion_id = ?
      ORDER BY h.creado_en DESC
    `, [req.params.id]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cargando hallazgos.' });
  }
});

// POST /api/inspecciones
router.post('/', async (req, res) => {
  try {
    const { titulo, tipo, fecha_programada, area_id, responsable_id, observaciones } = req.body;
    const pool = getPool();

    const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM inspecciones');
    const codigo = `INS-2026-${(cnt[0].cnt + 1).toString().padStart(2, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO inspecciones (codigo, titulo, tipo, estado, fecha_programada, area_id, responsable_id, observaciones)
      VALUES (?, ?, ?, 'Programada', ?, ?, ?, ?)
    `, [codigo, titulo, tipo, fecha_programada, area_id || null, responsable_id || null, observaciones || '']);

    res.status(201).json({ success: true, message: 'Inspección programada con éxito', id: result.insertId, codigo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al programar inspección.' });
  }
});

module.exports = router;
