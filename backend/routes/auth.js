const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// ==========================================
// AUTENTICACIÓN Y PERFIL
// ==========================================

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos.' });
    }

    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, cargo, avatar_url, activo FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas. Usuario no encontrado.' });
    }

    const user = users[0];
    if (!user.activo) {
      return res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al Administrador SSOMA.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    const tokenPayload = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      cargo: user.cargo
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        cargo: user.cargo,
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor al autenticar.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, nombre, email, rol, cargo, avatar_url FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (err) {
    console.error('Error obteniendo perfil:', err);
    res.status(500).json({ success: false, message: 'Error obteniendo perfil.' });
  }
});

// GET /api/auth/demo-users (Poblar botones dinámicos en login)
router.get('/demo-users', async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, nombre, email, rol, cargo, avatar_url FROM usuarios WHERE activo = 1 ORDER BY id ASC'
    );
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error cargando usuarios demo:', err);
    res.status(500).json({ success: false, message: 'Error cargando usuarios demo.' });
  }
});

// ==========================================
// GESTIÓN CRUD DE USUARIOS (SISTEMA & ROLES)
// ==========================================

// GET /api/auth/users (Listar todos los usuarios para administración)
router.get('/users', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, cargo, avatar_url, activo FROM usuarios ORDER BY id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al consultar usuarios del sistema.' });
  }
});

// POST /api/auth/users (Crear nuevo usuario con contraseña encriptada)
router.post('/users', async (req, res) => {
  try {
    const { nombre, email, password, rol, cargo } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, Email, Contraseña y Rol son obligatorios.'
      });
    }

    const pool = getPool();
    const cleanEmail = email.trim().toLowerCase();

    // Validar duplicados
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya se encuentra registrado.' });
    }

    // Encriptar contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password.trim(), salt);

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const [result] = await pool.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, cargo, avatar_url, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      nombre.trim(),
      cleanEmail,
      password_hash,
      rol.trim(),
      cargo ? cargo.trim() : 'Personal SSOMA',
      defaultAvatar
    ]);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente.',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error registrando usuario:', err);
    res.status(500).json({ success: false, message: 'Error interno al registrar usuario.' });
  }
});

// PUT /api/auth/users/:id (Actualizar usuario o resetear contraseña)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, cargo, activo } = req.body;
    const pool = getPool();

    let query = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, cargo = ?, activo = ?';
    let params = [
      nombre.trim(),
      email.trim().toLowerCase(),
      rol.trim(),
      cargo ? cargo.trim() : 'Personal SSOMA',
      activo !== undefined ? (activo ? 1 : 0) : 1
    ];

    // Si enviaron una nueva contraseña, encriptarla
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password.trim(), salt);
      query += ', password_hash = ?';
      params.push(password_hash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ success: true, message: 'Usuario actualizado exitosamente.' });
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    res.status(500).json({ success: false, message: 'Error interno al actualizar usuario.' });
  }
});

// DELETE /api/auth/users/:id (Eliminar usuario con protección del último administrador)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    if (totalUsers[0].total <= 1) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar al único usuario del sistema.'
      });
    }

    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario.' });
  }
});

module.exports = router;



















// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { getPool } = require('../config/db');
// const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// // POST /api/auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email y contraseña requeridos.' });
//     }

//     const pool = getPool();
//     const [users] = await pool.query(
//       'SELECT id, nombre, email, password_hash, rol, cargo, avatar_url, activo FROM usuarios WHERE email = ?',
//       [email.trim().toLowerCase()]
//     );

//     if (users.length === 0) {
//       return res.status(401).json({ success: false, message: 'Credenciales inválidas. Usuario no encontrado.' });
//     }

//     const user = users[0];
//     if (!user.activo) {
//       return res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al Administrador SSOMA.' });
//     }

//     const match = await bcrypt.compare(password, user.password_hash);
//     if (!match) {
//       return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
//     }

//     const tokenPayload = {
//       id: user.id,
//       nombre: user.nombre,
//       email: user.email,
//       rol: user.rol,
//       cargo: user.cargo
//     };

//     const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

//     res.json({
//       success: true,
//       message: 'Inicio de sesión exitoso',
//       token,
//       user: {
//         id: user.id,
//         nombre: user.nombre,
//         email: user.email,
//         rol: user.rol,
//         cargo: user.cargo,
//         avatar_url: user.avatar_url
//       }
//     });
//   } catch (err) {
//     console.error('Error en login:', err);
//     res.status(500).json({ success: false, message: 'Error en el servidor al autenticar.' });
//   }
// });

// // GET /api/auth/me
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const pool = getPool();
//     const [users] = await pool.query(
//       'SELECT id, nombre, email, rol, cargo, avatar_url FROM usuarios WHERE id = ?',
//       [req.user.id]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
//     }

//     res.json({
//       success: true,
//       user: users[0]
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error obteniendo perfil.' });
//   }
// });

// // GET /api/auth/demo-users (para poblar botones de acceso rápido en el login)
// router.get('/demo-users', async (req, res) => {
//   try {
//     const pool = getPool();
//     const [users] = await pool.query(
//       'SELECT id, nombre, email, rol, cargo, avatar_url FROM usuarios WHERE activo = 1 LIMIT 4'
//     );
//     res.json({ success: true, users });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error cargando usuarios demo.' });
//   }
// });

// module.exports = router;
