const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// Lista completa de tablas del sistema SSOMA
const SYSTEM_TABLES = [
  'configuracion_empresa',
  'usuarios',
  'areas',
  'trabajadores',
  'tipos_epp',
  'incidentes',
  'inspecciones',
  'hallazgos',
  'iperc',
  'residuos_ambientales',
  'monitoreo_ambiental',
  'capacitaciones',
  'entregas_epp'
];

// ==========================================
// 1. CONFIGURACIÓN DE LA EMPRESA
// ==========================================

// GET /api/configuracion/empresa
router.get('/empresa', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM configuracion_empresa LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay configuración registrada.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error obteniendo configuración de empresa:', err);
    res.status(500).json({ success: false, message: 'Error cargando configuración empresarial.' });
  }
});

// PUT /api/configuracion/empresa
router.put('/empresa', async (req, res) => {
  try {
    const {
      razon_social,
      ruc,
      nombre_comercial,
      rubro,
      direccion,
      telefono,
      email,
      sitio_web,
      logo_url,
      representante_legal,
      responsable_ssoma,
      moneda_simbolo,
      moneda_codigo,
      separador_decimales,
      separador_miles,
      dias_meta_sin_accidentes,
      limite_frecuencia_if
    } = req.body;

    if (!razon_social || !ruc) {
      return res.status(400).json({ success: false, message: 'Razón Social y RUC son requeridos.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM configuracion_empresa LIMIT 1');

    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO configuracion_empresa (
          razon_social, ruc, nombre_comercial, rubro, direccion, telefono, email, sitio_web,
          logo_url, representante_legal, responsable_ssoma, moneda_simbolo, moneda_codigo,
          separador_decimales, separador_miles, dias_meta_sin_accidentes, limite_frecuencia_if
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        razon_social, ruc, nombre_comercial || '', rubro || '', direccion || '',
        telefono || '', email || '', sitio_web || '', logo_url || '',
        representante_legal || '', responsable_ssoma || '',
        moneda_simbolo || 'S/.', moneda_codigo || 'PEN',
        separador_decimales || '.', separador_miles || ',',
        parseInt(dias_meta_sin_accidentes || 180, 10),
        parseFloat(limite_frecuencia_if || 2.00)
      ]);
    } else {
      await pool.query(`
        UPDATE configuracion_empresa SET
          razon_social = ?,
          ruc = ?,
          nombre_comercial = ?,
          rubro = ?,
          direccion = ?,
          telefono = ?,
          email = ?,
          sitio_web = ?,
          logo_url = ?,
          representante_legal = ?,
          responsable_ssoma = ?,
          moneda_simbolo = ?,
          moneda_codigo = ?,
          separador_decimales = ?,
          separador_miles = ?,
          dias_meta_sin_accidentes = ?,
          limite_frecuencia_if = ?
        WHERE id = ?
      `, [
        razon_social, ruc, nombre_comercial || '', rubro || '', direccion || '',
        telefono || '', email || '', sitio_web || '', logo_url || '',
        representante_legal || '', responsable_ssoma || '',
        moneda_simbolo || 'S/.', moneda_codigo || 'PEN',
        separador_decimales || '.', separador_miles || ',',
        parseInt(dias_meta_sin_accidentes || 180, 10),
        parseFloat(limite_frecuencia_if || 2.00),
        existing[0].id
      ]);
    }

    const [updated] = await pool.query('SELECT * FROM configuracion_empresa LIMIT 1');
    res.json({
      success: true,
      message: 'Configuración de la empresa guardada exitosamente.',
      data: updated[0]
    });
  } catch (err) {
    console.error('Error guardando configuración de empresa:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar configuración.' });
  }
});

// ==========================================
// 2. COPIAS DE SEGURIDAD (BACKUP)
// ==========================================

// GET /api/configuracion/backup/export
router.get('/backup/export', async (req, res) => {
  try {
    const pool = getPool();
    const backupData = {
      metadata: {
        sistema: 'SSOMA - Seguridad, Salud Ocupacional y Medio Ambiente',
        version: '2.0.0',
        fechaGeneracion: new Date().toISOString(),
        generadoPor: 'Administrador SSOMA',
        totalTablas: SYSTEM_TABLES.length
      },
      tablas: {}
    };

    // Obtener información de empresa para el encabezado del backup
    const [empresaRows] = await pool.query('SELECT razon_social, ruc FROM configuracion_empresa LIMIT 1');
    if (empresaRows.length > 0) {
      backupData.metadata.empresa = empresaRows[0];
    }

    let totalRegistros = 0;

    for (const table of SYSTEM_TABLES) {
      try {
        const [createRows] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
        const [dataRows] = await pool.query(`SELECT * FROM \`${table}\``);

        backupData.tablas[table] = {
          createTableSql: createRows[0]['Create Table'] || '',
          rowCount: dataRows.length,
          rows: dataRows
        };
        totalRegistros += dataRows.length;
      } catch (tableErr) {
        console.warn(`Aviso al respaldar tabla ${table}:`, tableErr.message);
      }
    }

    backupData.metadata.totalRegistros = totalRegistros;

    const fileName = `backup_ssoma_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('Error generando copia de seguridad:', err);
    res.status(500).json({ success: false, message: 'Error generando archivo de respaldo.' });
  }
});

// ==========================================
// 3. RESTAURACIÓN DE COPIA DE SEGURIDAD
// ==========================================

// POST /api/configuracion/backup/restore
router.post('/backup/restore', async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { backup } = req.body;

    if (!backup || !backup.tablas || typeof backup.tablas !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Archivo de respaldo inválido o corrupto. Verifique el formato JSON.'
      });
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.beginTransaction();

    let tablasRestauradas = 0;
    let registrosRestaurados = 0;

    // Restaurar cada tabla presente en el backup
    for (const tableName of Object.keys(backup.tablas)) {
      if (!SYSTEM_TABLES.includes(tableName)) continue;

      const tableData = backup.tablas[tableName];
      const rows = tableData.rows || [];

      // Vaciar tabla existente
      await connection.query(`TRUNCATE TABLE \`${tableName}\``);

      if (rows.length > 0) {
        // Inserción de filas por lotes
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;

        for (const row of rows) {
          const values = columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) return null;
            // Manejar fechas y timestamps en formato ISO 8601
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
              val = val.replace('T', ' ').replace(/\..*Z?$/, '').replace('Z', '');
            }
            return val;
          });
          await connection.query(sql, values);
        }
        registrosRestaurados += rows.length;
      }
      tablasRestauradas++;
    }

    await connection.commit();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    res.json({
      success: true,
      message: `Copia de seguridad restaurada exitosamente. ${tablasRestauradas} tablas y ${registrosRestaurados} registros recuperados.`,
      detalles: {
        tablas: tablasRestauradas,
        registros: registrosRestaurados,
        origenBackup: backup.metadata?.fechaGeneracion || 'Desconocido'
      }
    });
  } catch (err) {
    await connection.rollback();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.error('Error restaurando copia de seguridad:', err);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar base de datos: ' + err.message
    });
  } finally {
    connection.release();
  }
});

// ==========================================
// 4. RESETEAR EL SISTEMA PARA UNA NUEVA EMPRESA
// ==========================================

// POST /api/configuracion/sistema/reset
router.post('/sistema/reset', async (req, res) => {
  const { confirmText, nuevaEmpresa, limpiarPersonalYAreas } = req.body;

  if (confirmText !== 'CONFIRMAR RESET') {
    return res.status(400).json({
      success: false,
      message: 'Frase de confirmación incorrecta. Debe escribir exactamente "CONFIRMAR RESET" para autorizar esta operación.'
    });
  }

  const connection = await getPool().getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.beginTransaction();

    // 1. Limpieza de tablas operacionales y transaccionales
    const operationalTables = [
      'hallazgos',
      'inspecciones',
      'incidentes',
      'iperc',
      'residuos_ambientales',
      'monitoreo_ambiental',
      'capacitaciones',
      'entregas_epp'
    ];

    for (const table of operationalTables) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }

    // 2. Si se solicita limpiar personal y áreas para iniciar en blanco
    if (limpiarPersonalYAreas) {
      await connection.query('TRUNCATE TABLE `trabajadores`');
      await connection.query('TRUNCATE TABLE `areas`');
      await connection.query('TRUNCATE TABLE `tipos_epp`');

      // Crear áreas base para arranque rápido
      await connection.query(`
        INSERT INTO areas (codigo, nombre, responsable, ubicacion) VALUES
        ('AR-OPERAC', 'Operaciones & Producción', 'Supervisor de Operaciones', 'Sede Central'),
        ('AR-ADMIN', 'Administración & SSOMA', 'Coordinador SSOMA', 'Oficina Principal')
      `);

      // Crear trabajador coordinador por defecto
      await connection.query(`
        INSERT INTO trabajadores (dni, nombres, apellidos, cargo, area_id, email, activo) VALUES
        ('00000000', 'Administrador', 'SSOMA', 'Jefe Corporativo SSOMA', 2, 'admin@ssoma.com', 1)
      `);
    }

    // 3. Configurar datos de la nueva empresa si fueron proporcionados
    if (nuevaEmpresa && nuevaEmpresa.razon_social) {
      await connection.query(`TRUNCATE TABLE configuracion_empresa`);
      await connection.query(`
        INSERT INTO configuracion_empresa (
          razon_social, ruc, nombre_comercial, rubro, direccion, telefono, email, sitio_web,
          logo_url, representante_legal, responsable_ssoma, moneda_simbolo, moneda_codigo,
          separador_decimales, separador_miles, dias_meta_sin_accidentes, limite_frecuencia_if
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        nuevaEmpresa.razon_social,
        nuevaEmpresa.ruc || '20000000001',
        nuevaEmpresa.nombre_comercial || nuevaEmpresa.razon_social,
        nuevaEmpresa.rubro || 'Industrial',
        nuevaEmpresa.direccion || '',
        nuevaEmpresa.telefono || '',
        nuevaEmpresa.email || '',
        nuevaEmpresa.sitio_web || '',
        nuevaEmpresa.logo_url || '',
        nuevaEmpresa.representante_legal || '',
        nuevaEmpresa.responsable_ssoma || '',
        nuevaEmpresa.moneda_simbolo || 'S/.',
        nuevaEmpresa.moneda_codigo || 'PEN',
        nuevaEmpresa.separador_decimales || '.',
        nuevaEmpresa.separador_miles || ',',
        parseInt(nuevaEmpresa.dias_meta_sin_accidentes || 180, 10),
        parseFloat(nuevaEmpresa.limite_frecuencia_if || 2.00)
      ]);
    }

    // 4. Asegurar que el usuario Administrador siga activo
    const [adminCheck] = await connection.query("SELECT id FROM usuarios WHERE rol = 'admin_ssoma' LIMIT 1");
    if (adminCheck.length === 0) {
      // Recrear usuario admin si por alguna razón no estuviera
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO usuarios (nombre, email, password_hash, rol, cargo)
        VALUES ('Administrador SSOMA', 'admin@ssoma.com', ?, 'admin_ssoma', 'Jefe SSOMA')
      `, [passwordHash]);
    }

    await connection.commit();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    res.json({
      success: true,
      message: 'Sistema reseteado exitosamente. La base de datos está limpia y lista para operar con la nueva empresa.',
      detalles: {
        tablasLimpiadas: operationalTables.concat(limpiarPersonalYAreas ? ['trabajadores', 'areas', 'tipos_epp'] : []),
        empresaActualizada: nuevaEmpresa?.razon_social || 'Conservada',
        usuarioAdminPreservado: true
      }
    });
  } catch (err) {
    await connection.rollback();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.error('Error al resetear sistema:', err);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar puesta a cero del sistema: ' + err.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
