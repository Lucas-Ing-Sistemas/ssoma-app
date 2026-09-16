const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/ambiental/residuos
router.get('/residuos', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha_fmt,
        a.nombre as area_nombre
      FROM residuos_ambientales r
      LEFT JOIN areas a ON r.area_id = a.id
      ORDER BY r.fecha DESC
    `);

    const [summary] = await pool.query(`
      SELECT 
        tipo,
        clase,
        color_tacho,
        SUM(cantidad_kg) as total_kg
      FROM residuos_ambientales
      GROUP BY tipo, clase, color_tacho
    `);

    res.json({ success: true, data: rows, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cargando residuos ambientales.' });
  }
});

// POST /api/ambiental/residuos
router.post('/residuos', async (req, res) => {
  try {
    const { tipo, clase, color_tacho, cantidad_kg, fecha, disposicion_final, empresa_operadora_eors, area_id } = req.body;
    const pool = getPool();

    const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM residuos_ambientales');
    const codigo = `RES-2026-${(cnt[0].cnt + 86).toString().padStart(3, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO residuos_ambientales (
        codigo, tipo, clase, color_tacho, cantidad_kg, fecha,
        disposicion_final, empresa_operadora_eors, area_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, tipo, clase || 'No Peligroso', color_tacho || 'Blanco',
      parseFloat(cantidad_kg || 0), fecha || new Date(),
      disposicion_final || 'Relleno Sanitario', empresa_operadora_eors || 'Operador EO-RS', area_id || null
    ]);

    res.status(201).json({ success: true, message: 'Registro de residuo guardado', id: result.insertId, codigo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al registrar residuo ambiental.' });
  }
});

// GET /api/ambiental/monitoreo
router.get('/monitoreo', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        DATE_FORMAT(m.fecha_medicion, '%Y-%m-%d') as fecha_fmt,
        a.nombre as area_nombre
      FROM monitoreo_ambiental m
      LEFT JOIN areas a ON m.area_id = a.id
      ORDER BY m.fecha_medicion DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cargando monitoreo ambiental.' });
  }
});

// POST /api/ambiental/monitoreo
router.post('/monitoreo', async (req, res) => {
  try {
    const { parametro, valor_medido, limite_permisible, unidad, punto_muestreo, fecha_medicion, area_id } = req.body;
    const val = parseFloat(valor_medido);
    const lim = parseFloat(limite_permisible);

    let estado_cumplimiento = 'Dentro de Límites';
    if (val > lim) {
      estado_cumplimiento = 'Supera Límites';
    } else if (val >= lim * 0.85) {
      estado_cumplimiento = 'Alerta Preventiva';
    }

    const pool = getPool();
    const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM monitoreo_ambiental');
    const codigo = `MON-2026-${(cnt[0].cnt + 1).toString().padStart(2, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO monitoreo_ambiental (
        codigo, parametro, valor_medido, limite_permisible, unidad,
        estado_cumplimiento, punto_muestreo, fecha_medicion, area_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, parametro, val, lim, unidad,
      estado_cumplimiento, punto_muestreo, fecha_medicion || new Date(), area_id || null
    ]);

    res.status(201).json({ success: true, message: 'Monitoreo ambiental registrado', id: result.insertId, codigo, estado_cumplimiento });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error registrando monitoreo ambiental.' });
  }
});

module.exports = router;
