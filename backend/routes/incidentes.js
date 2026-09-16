const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/incidentes
router.get('/', async (req, res) => {
  try {
    const { severidad, estado, search } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        i.*,
        DATE_FORMAT(i.fecha_ocurrencia, '%Y-%m-%d %H:%i') as fecha_formato,
        a.nombre as area_nombre,
        CONCAT(t.nombres, ' ', t.apellidos) as reportado_por_nombre,
        t.avatar_url as reportado_por_avatar,
        CONCAT(ta.nombres, ' ', ta.apellidos) as afectado_nombre
      FROM incidentes i
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN trabajadores t ON i.reportado_por_id = t.id
      LEFT JOIN trabajadores ta ON i.afectado_id = ta.id
      WHERE 1=1
    `;
    const params = [];

    if (severidad) {
      query += ` AND i.severidad = ?`;
      params.push(severidad);
    }
    if (estado) {
      query += ` AND i.estado = ?`;
      params.push(estado);
    }
    if (search) {
      query += ` AND (i.codigo LIKE ? OR i.titulo LIKE ? OR i.lugar LIKE ? OR i.tipo LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY i.fecha_ocurrencia DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error listando incidentes:', err);
    res.status(500).json({ success: false, message: 'Error cargando incidentes.' });
  }
});

// POST /api/incidentes
router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      tipo,
      severidad,
      estado,
      lugar,
      fecha_ocurrencia,
      area_id,
      reportado_por_id,
      afectado_id,
      dias_perdidos,
      descripcion,
      causa_raiz,
      accion_correctiva,
      costo_estimado
    } = req.body;

    if (!titulo || !tipo || !lugar) {
      return res.status(400).json({ success: false, message: 'Título, tipo y lugar son requeridos.' });
    }

    const pool = getPool();
    // Generar nuevo código autoincrementado
    const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM incidentes');
    const nextNum = (countRows[0].cnt + 1).toString().padStart(3, '0');
    const codigo = `INC-2026-${nextNum}`;

    const [result] = await pool.query(`
      INSERT INTO incidentes (
        codigo, titulo, tipo, severidad, estado, lugar, fecha_ocurrencia,
        area_id, reportado_por_id, afectado_id, dias_perdidos, descripcion,
        causa_raiz, accion_correctiva, costo_estimado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo,
      titulo,
      tipo || 'Cuasi-Accidente',
      severidad || 'Leve',
      estado || 'Reportado',
      lugar,
      fecha_ocurrencia || new Date(),
      area_id || null,
      reportado_por_id || null,
      afectado_id || null,
      parseInt(dias_perdidos || 0, 10),
      descripcion || '',
      causa_raiz || '',
      accion_correctiva || '',
      parseFloat(costo_estimado || 0)
    ]);

    res.status(201).json({
      success: true,
      message: 'Incidente registrado con éxito',
      id: result.insertId,
      codigo
    });
  } catch (err) {
    console.error('Error registrando incidente:', err);
    res.status(500).json({ success: false, message: 'Error al registrar incidente.' });
  }
});

// PATCH /api/incidentes/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado, accion_correctiva } = req.body;
    const pool = getPool();

    await pool.query(
      'UPDATE incidentes SET estado = ?, accion_correctiva = COALESCE(?, accion_correctiva) WHERE id = ?',
      [estado, accion_correctiva || null, req.params.id]
    );

    res.json({ success: true, message: 'Estado del incidente actualizado.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error actualizando estado.' });
  }
});

module.exports = router;
