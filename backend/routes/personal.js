const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// ==========================================
// RUTAS DE TRABAJADORES
// ==========================================

// GET /api/personal/trabajadores
router.get('/trabajadores', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        CONCAT(t.nombres, ' ', t.apellidos) as nombre_completo,
        DATE_FORMAT(t.fecha_ingreso, '%Y-%m-%d') as fecha_ingreso_fmt,
        a.nombre as area_nombre,
        a.codigo as area_codigo
      FROM trabajadores t
      LEFT JOIN areas a ON t.area_id = a.id
      ORDER BY t.apellidos, t.nombres
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error cargando trabajadores:', err);
    res.status(500).json({ success: false, message: 'Error cargando trabajadores.' });
  }
});

// POST /api/personal/trabajadores (Crear nuevo trabajador)
router.post('/trabajadores', async (req, res) => {
  try {
    const pool = getPool();
    const { dni, nombres, apellidos, cargo, area_id, telefono, email, aptitud_medica } = req.body;

    if (!dni || !nombres || !apellidos || !cargo || !area_id) {
      return res.status(400).json({
        success: false,
        message: 'DNI, Nombres, Apellidos, Cargo y Área son obligatorios.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO trabajadores 
        (dni, nombres, apellidos, cargo, area_id, telefono, email, aptitud_medica, fecha_ingreso, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Activo')`,
      [
        dni.trim(),
        nombres.trim(),
        apellidos.trim(),
        cargo.trim(),
        area_id,
        telefono ? telefono.trim() : '',
        email ? email.trim() : '',
        aptitud_medica || 'Apto'
      ]
    );

    res.json({
      success: true,
      message: 'Trabajador registrado exitosamente.',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error al registrar trabajador:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'El DNI o correo ingresado ya existe.' });
    }
    res.status(500).json({ success: false, message: 'Error interno al registrar trabajador.' });
  }
});

// DELETE /api/personal/trabajadores/:id (Eliminar trabajador)
router.delete('/trabajadores/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM trabajadores WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado.' });
    }

    res.json({ success: true, message: 'Trabajador eliminado exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar trabajador:', err);
    res.status(500).json({ success: false, message: 'Error interno al eliminar trabajador.' });
  }
});

// ==========================================
// RUTAS DE ÁREAS OPERATIVAS
// ==========================================

// GET /api/personal/areas
router.get('/areas', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM trabajadores t WHERE t.area_id = a.id) as total_trabajadores,
        (SELECT COUNT(*) FROM incidentes i WHERE i.area_id = a.id) as total_incidentes
      FROM areas a
      ORDER BY a.nombre
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error cargando áreas:', err);
    res.status(500).json({ success: false, message: 'Error cargando áreas.' });
  }
});

// POST /api/personal/areas (Crear nueva área operativa)
router.post('/areas', async (req, res) => {
  try {
    const pool = getPool();
    const { nombre, codigo, responsable } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el código del área son obligatorios.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO areas (nombre, codigo, responsable) VALUES (?, ?, ?)`,
      [
        nombre.trim(),
        codigo.trim().toUpperCase(),
        responsable ? responsable.trim() : ''
      ]
    );

    res.json({
      success: true,
      message: 'Área operativa creada exitosamente.',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error al crear área:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'El código del área ya existe.' });
    }
    res.status(500).json({ success: false, message: 'Error interno al crear el área.' });
  }
});

// DELETE /api/personal/areas/:id (Eliminar área operativa)
router.delete('/areas/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    // Verificar si el área tiene trabajadores asociados antes de eliminar
    const [assignedWorkers] = await pool.query(
      'SELECT COUNT(*) as total FROM trabajadores WHERE area_id = ?',
      [id]
    );

    if (assignedWorkers[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el área porque tiene colaboradores asignados.'
      });
    }

    const [result] = await pool.query('DELETE FROM areas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Área no encontrada.' });
    }

    res.json({ success: true, message: 'Área operativa eliminada exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar área:', err);
    res.status(500).json({ success: false, message: 'Error interno al eliminar el área.' });
  }
});

module.exports = router;

























// const express = require('express');
// const router = express.Router();
// const { getPool } = require('../config/db');

// // GET /api/personal/trabajadores
// router.get('/trabajadores', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         t.*,
//         CONCAT(t.nombres, ' ', t.apellidos) as nombre_completo,
//         DATE_FORMAT(t.fecha_ingreso, '%Y-%m-%d') as fecha_ingreso_fmt,
//         a.nombre as area_nombre,
//         a.codigo as area_codigo
//       FROM trabajadores t
//       LEFT JOIN areas a ON t.area_id = a.id
//       ORDER BY t.apellidos, t.nombres
//     `);
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error('Error cargando trabajadores:', err);
//     res.status(500).json({ success: false, message: 'Error cargando trabajadores.' });
//   }
// });

// // GET /api/personal/areas
// router.get('/areas', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         a.*,
//         (SELECT COUNT(*) FROM trabajadores t WHERE t.area_id = a.id) as total_trabajadores,
//         (SELECT COUNT(*) FROM incidentes i WHERE i.area_id = a.id) as total_incidentes
//       FROM areas a
//       ORDER BY a.nombre
//     `);
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error('Error cargando áreas:', err);
//     res.status(500).json({ success: false, message: 'Error cargando áreas.' });
//   }
// });

// // POST /api/personal/trabajadores (Crear nuevo trabajador)
// router.post('/trabajadores', async (req, res) => {
//   try {
//     const pool = getPool();
//     const { dni, nombres, apellidos, cargo, area_id, telefono, email, aptitud_medica } = req.body;

//     if (!dni || !nombres || !apellidos || !cargo || !area_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'DNI, Nombres, Apellidos, Cargo y Área son obligatorios.'
//       });
//     }

//     const [result] = await pool.query(
//       `INSERT INTO trabajadores 
//         (dni, nombres, apellidos, cargo, area_id, telefono, email, aptitud_medica, fecha_ingreso, estado) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Activo')`,
//       [
//         dni.trim(),
//         nombres.trim(),
//         apellidos.trim(),
//         cargo.trim(),
//         area_id,
//         telefono ? telefono.trim() : '',
//         email ? email.trim() : '',
//         aptitud_medica || 'Apto'
//       ]
//     );

//     res.json({
//       success: true,
//       message: 'Trabajador registrado exitosamente.',
//       id: result.insertId
//     });
//   } catch (err) {
//     console.error('Error al registrar trabajador:', err);
//     if (err.code === 'ER_DUP_ENTRY') {
//       return res.status(400).json({ success: false, message: 'El DNI o correo ingresado ya existe.' });
//     }
//     res.status(500).json({ success: false, message: 'Error interno al registrar trabajador.' });
//   }
// });

// // DELETE /api/personal/trabajadores/:id (Eliminar trabajador)
// router.delete('/trabajadores/:id', async (req, res) => {
//   try {
//     const pool = getPool();
//     const { id } = req.params;

//     const [result] = await pool.query('DELETE FROM trabajadores WHERE id = ?', [id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Trabajador no encontrado.' });
//     }

//     res.json({ success: true, message: 'Trabajador eliminado exitosamente.' });
//   } catch (err) {
//     console.error('Error al eliminar trabajador:', err);
//     res.status(500).json({ success: false, message: 'Error interno al eliminar trabajador.' });
//   }
// });

// module.exports = router;











// const express = require('express');
// const router = express.Router();
// const { getPool } = require('../config/db');

// // GET /api/personal/trabajadores
// router.get('/trabajadores', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         t.*,
//         DATE_FORMAT(t.fecha_ingreso, '%Y-%m-%d') as fecha_ingreso_fmt,
//         a.nombre as area_nombre,
//         a.codigo as area_codigo
//       FROM trabajadores t
//       LEFT JOIN areas a ON t.area_id = a.id
//       ORDER BY t.apellidos, t.nombres
//     `);
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error cargando trabajadores.' });
//   }
// });

// // GET /api/personal/areas
// router.get('/areas', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [rows] = await pool.query(`
//       SELECT 
//         a.*,
//         (SELECT COUNT(*) FROM trabajadores t WHERE t.area_id = a.id) as total_trabajadores,
//         (SELECT COUNT(*) FROM incidentes i WHERE i.area_id = a.id) as total_incidentes
//       FROM areas a
//       ORDER BY a.nombre
//     `);
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error cargando áreas.' });
//   }
// });

// module.exports = router;
