const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// ==========================================
// INVENTARIO / CATÁLOGO DE EPP
// ==========================================

// GET /api/epp/inventario (Listar catálogo con alertas de stock)
router.get('/inventario', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        *,
        (stock_actual <= stock_minimo) as alerta_stock_bajo
      FROM tipos_epp
      ORDER BY categoria, nombre
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error cargando inventario EPP:', err);
    res.status(500).json({ success: false, message: 'Error cargando inventario EPP.' });
  }
});

// POST /api/epp/inventario (Crear nuevo tipo de EPP con código autogenerado)
router.post('/inventario', async (req, res) => {
  try {
    const { nombre, categoria, stock_actual, stock_minimo, unidad_medida, costo_unitario } = req.body;

    if (!nombre || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y la categoría del equipo son obligatorios.'
      });
    }

    const pool = getPool();

    // Generar código correlativo basado en el ID máximo para evitar colisiones tras borrados
    const [maxIdRow] = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM tipos_epp');
    const nextNum = maxIdRow[0].next_id;
    const codigo = `EPP-${nextNum.toString().padStart(3, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO tipos_epp (codigo, nombre, categoria, stock_actual, stock_minimo, unidad_medida, costo_unitario)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo,
      nombre.trim(),
      categoria.trim(),
      parseInt(stock_actual || 0, 10),
      parseInt(stock_minimo || 5, 10),
      unidad_medida || 'Unidad',
      parseFloat(costo_unitario || 0)
    ]);

    res.status(201).json({
      success: true,
      message: 'Equipo de protección registrado exitosamente.',
      id: result.insertId,
      codigo
    });
  } catch (err) {
    console.error('Error creando EPP:', err);
    res.status(500).json({ success: false, message: 'Error interno al registrar el EPP.' });
  }
});

// PUT /api/epp/inventario/:id/stock (Ajustar o Reabastecer Stock y Costo)
router.put('/inventario/:id/stock', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { stock_actual, costo_unitario, stock_minimo } = req.body;

    if (stock_actual === undefined && costo_unitario === undefined && stock_minimo === undefined) {
      return res.status(400).json({ success: false, message: 'No se enviaron campos para actualizar.' });
    }

    await pool.query(`
      UPDATE tipos_epp 
      SET 
        stock_actual = COALESCE(?, stock_actual),
        costo_unitario = COALESCE(?, costo_unitario),
        stock_minimo = COALESCE(?, stock_minimo)
      WHERE id = ?
    `, [
      stock_actual !== undefined ? parseInt(stock_actual, 10) : null,
      costo_unitario !== undefined ? parseFloat(costo_unitario) : null,
      stock_minimo !== undefined ? parseInt(stock_minimo, 10) : null,
      id
    ]);

    res.json({ success: true, message: 'Inventario actualizado con éxito.' });
  } catch (err) {
    console.error('Error actualizando stock EPP:', err);
    res.status(500).json({ success: false, message: 'Error interno al actualizar el stock.' });
  }
});

// PUT /api/epp/inventario/:id (Editar información completa del EPP)
router.put('/inventario/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { nombre, categoria, stock_minimo, unidad_medida, costo_unitario } = req.body;

    await pool.query(`
      UPDATE tipos_epp 
      SET 
        nombre = COALESCE(?, nombre),
        categoria = COALESCE(?, categoria),
        stock_minimo = COALESCE(?, stock_minimo),
        unidad_medida = COALESCE(?, unidad_medida),
        costo_unitario = COALESCE(?, costo_unitario)
      WHERE id = ?
    `, [
      nombre ? nombre.trim() : null,
      categoria ? categoria.trim() : null,
      stock_minimo !== undefined ? parseInt(stock_minimo, 10) : null,
      unidad_medida || null,
      costo_unitario !== undefined ? parseFloat(costo_unitario) : null,
      id
    ]);

    res.json({ success: true, message: 'Datos del equipo actualizados.' });
  } catch (err) {
    console.error('Error editando EPP:', err);
    res.status(500).json({ success: false, message: 'Error interno al editar el equipo.' });
  }
});

// DELETE /api/epp/inventario/:id (Eliminar tipo de EPP)
router.delete('/inventario/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    // Validar si tiene actas de entrega históricas antes de eliminar
    const [assigned] = await pool.query(
      'SELECT COUNT(*) as total FROM entregas_epp WHERE tipo_epp_id = ?',
      [id]
    );

    if (assigned[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el equipo porque tiene registros de entrega asociados.'
      });
    }

    const [result] = await pool.query('DELETE FROM tipos_epp WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Equipo no encontrado.' });
    }

    res.json({ success: true, message: 'Equipo eliminado del inventario.' });
  } catch (err) {
    console.error('Error eliminando EPP:', err);
    res.status(500).json({ success: false, message: 'Error interno al eliminar el equipo.' });
  }
});

// ==========================================
// ACTAS DE ENTREGA DE EPP
// ==========================================

// GET /api/epp/entregas
router.get('/entregas', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        e.*,
        DATE_FORMAT(e.fecha_entrega, '%Y-%m-%d') as fecha_fmt,
        te.nombre as epp_nombre,
        te.categoria as epp_categoria,
        CONCAT(t.nombres, ' ', t.apellidos) as trabajador_nombre,
        t.cargo as trabajador_cargo,
        a.nombre as area_nombre
      FROM entregas_epp e
      JOIN tipos_epp te ON e.tipo_epp_id = te.id
      JOIN trabajadores t ON e.trabajador_id = t.id
      LEFT JOIN areas a ON t.area_id = a.id
      ORDER BY e.fecha_entrega DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error cargando entregas de EPP:', err);
    res.status(500).json({ success: false, message: 'Error cargando entregas de EPP.' });
  }
});

// POST /api/epp/entregas
router.post('/entregas', async (req, res) => {
  try {
    const { tipo_epp_id, trabajador_id, cantidad, fecha_entrega, motivo, observaciones } = req.body;
    const pool = getPool();
    const cant = parseInt(cantidad || 1, 10);

    // Reducir stock del EPP sin permitir valores negativos
    await pool.query(
      'UPDATE tipos_epp SET stock_actual = GREATEST(0, stock_actual - ?) WHERE id = ?',
      [cant, tipo_epp_id]
    );

    const [result] = await pool.query(`
      INSERT INTO entregas_epp (tipo_epp_id, trabajador_id, cantidad, fecha_entrega, motivo, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tipo_epp_id,
      trabajador_id,
      cant,
      fecha_entrega || new Date(),
      motivo || 'Dotación Periódica',
      observaciones || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Entrega de EPP registrada con éxito.',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error registrando entrega de EPP:', err);
    res.status(500).json({ success: false, message: 'Error registrando entrega de EPP.' });
  }
});

module.exports = router;


















// const express = require('express');
// const router = express.Router();
// const { getPool } = require('../config/db');

// // GET /api/epp/inventario
// router.get('/inventario', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         *,
//         (stock_actual <= stock_minimo) as alerta_stock_bajo
//       FROM tipos_epp
//       ORDER BY categoria, nombre
//     `);

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error cargando inventario EPP.' });
//   }
// });

// // POST /api/epp/inventario
// router.post('/inventario', async (req, res) => {
//   try {
//     const { nombre, categoria, stock_actual, stock_minimo, unidad_medida, costo_unitario } = req.body;
//     const pool = getPool();

//     const [cnt] = await pool.query('SELECT COUNT(*) as cnt FROM tipos_epp');
//     const codigo = `EPP-${(cnt[0].cnt + 1).toString().padStart(3, '0')}`;

//     const [result] = await pool.query(`
//       INSERT INTO tipos_epp (codigo, nombre, categoria, stock_actual, stock_minimo, unidad_medida, costo_unitario)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `, [
//       codigo, nombre, categoria, parseInt(stock_actual || 0, 10),
//       parseInt(stock_minimo || 5, 10), unidad_medida || 'Unidad', parseFloat(costo_unitario || 0)
//     ]);

//     res.status(201).json({ success: true, message: 'EPP registrado', id: result.insertId, codigo });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error creando EPP.' });
//   }
// });

// // GET /api/epp/entregas
// router.get('/entregas', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         e.*,
//         DATE_FORMAT(e.fecha_entrega, '%Y-%m-%d') as fecha_fmt,
//         te.nombre as epp_nombre,
//         te.categoria as epp_categoria,
//         CONCAT(t.nombres, ' ', t.apellidos) as trabajador_nombre,
//         t.cargo as trabajador_cargo,
//         a.nombre as area_nombre
//       FROM entregas_epp e
//       JOIN tipos_epp te ON e.tipo_epp_id = te.id
//       JOIN trabajadores t ON e.trabajador_id = t.id
//       LEFT JOIN areas a ON t.area_id = a.id
//       ORDER BY e.fecha_entrega DESC
//     `);

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error cargando entregas de EPP.' });
//   }
// });

// // POST /api/epp/entregas
// router.post('/entregas', async (req, res) => {
//   try {
//     const { tipo_epp_id, trabajador_id, cantidad, fecha_entrega, motivo, observaciones } = req.body;
//     const pool = getPool();
//     const cant = parseInt(cantidad || 1, 10);

//     // Reducir stock del EPP
//     await pool.query('UPDATE tipos_epp SET stock_actual = GREATEST(0, stock_actual - ?) WHERE id = ?', [cant, tipo_epp_id]);

//     const [result] = await pool.query(`
//       INSERT INTO entregas_epp (tipo_epp_id, trabajador_id, cantidad, fecha_entrega, motivo, observaciones)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `, [tipo_epp_id, trabajador_id, cant, fecha_entrega || new Date(), motivo || 'Dotación Periódica', observaciones || '']);

//     res.status(201).json({ success: true, message: 'Entrega de EPP registrada con éxito', id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error registrando entrega de EPP.' });
//   }
// });

// module.exports = router;
