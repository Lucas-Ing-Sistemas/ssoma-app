const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbName = process.env.DB_NAME || 'dev_ssoma';

async function initializeDatabase() {
  console.log(`[SSOMA DB] Conectando a MySQL en ${dbHost}:${dbPort}...`);
  let connection;
  try {
    // 1. Conexión sin base de datos seleccionada
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });

    console.log(`[SSOMA DB] Verificando / creando base de datos "${dbName}"...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.changeUser({ database: dbName });

    console.log(`[SSOMA DB] Creando tablas del sistema SSOMA...`);

    // Tablas del sistema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL DEFAULT 'supervisor',
        cargo VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(255) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(120) NOT NULL,
        responsable VARCHAR(120) NOT NULL,
        ubicacion VARCHAR(150) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS trabajadores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dni VARCHAR(15) NOT NULL UNIQUE,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        cargo VARCHAR(100) NOT NULL,
        area_id INT NULL,
        telefono VARCHAR(30) NULL,
        email VARCHAR(120) NULL,
        avatar_url VARCHAR(255) NULL,
        fecha_ingreso DATE NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        CONSTRAINT fk_trabajadores_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS incidentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        tipo VARCHAR(80) NOT NULL,
        severidad ENUM('Leve', 'Moderado', 'Grave', 'Crítico') NOT NULL DEFAULT 'Leve',
        estado ENUM('Reportado', 'En Investigación', 'Plan de Acción', 'Cerrado') NOT NULL DEFAULT 'Reportado',
        lugar VARCHAR(200) NOT NULL,
        fecha_ocurrencia DATETIME NOT NULL,
        area_id INT NULL,
        reportado_por_id INT NULL,
        afectado_id INT NULL,
        dias_perdidos INT NOT NULL DEFAULT 0,
        descripcion TEXT NOT NULL,
        causa_raiz TEXT NULL,
        accion_correctiva TEXT NULL,
        costo_estimado DECIMAL(10,2) DEFAULT 0.00,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_inc_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
        CONSTRAINT fk_inc_reportado FOREIGN KEY (reportado_por_id) REFERENCES trabajadores(id) ON DELETE SET NULL,
        CONSTRAINT fk_inc_afectado FOREIGN KEY (afectado_id) REFERENCES trabajadores(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inspecciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        tipo VARCHAR(80) NOT NULL,
        estado ENUM('Programada', 'En Curso', 'Completada', 'Observada') NOT NULL DEFAULT 'Programada',
        fecha_programada DATE NOT NULL,
        fecha_ejecucion DATE NULL,
        puntaje_cumplimiento DECIMAL(5,2) DEFAULT 100.00,
        observaciones TEXT NULL,
        area_id INT NULL,
        responsable_id INT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_insp_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
        CONSTRAINT fk_insp_resp FOREIGN KEY (responsable_id) REFERENCES trabajadores(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS hallazgos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inspeccion_id INT NOT NULL,
        descripcion VARCHAR(350) NOT NULL,
        tipo_hallazgo ENUM('Condición Subestándar', 'Acto Subestándar', 'Desvío Procedimiento') NOT NULL DEFAULT 'Condición Subestándar',
        nivel_riesgo ENUM('Bajo', 'Medio', 'Alto', 'Crítico') NOT NULL DEFAULT 'Medio',
        estado ENUM('Pendiente', 'En Proceso', 'Subsanado') NOT NULL DEFAULT 'Pendiente',
        accion_correctiva TEXT NOT NULL,
        responsable_id INT NULL,
        fecha_limite DATE NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_hallazgo_insp FOREIGN KEY (inspeccion_id) REFERENCES inspecciones(id) ON DELETE CASCADE,
        CONSTRAINT fk_hallazgo_resp FOREIGN KEY (responsable_id) REFERENCES trabajadores(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS iperc (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        proceso VARCHAR(150) NOT NULL,
        actividad VARCHAR(200) NOT NULL,
        tarea VARCHAR(200) NOT NULL,
        peligro VARCHAR(250) NOT NULL,
        riesgo VARCHAR(250) NOT NULL,
        probabilidad INT NOT NULL,
        severidad INT NOT NULL,
        nivel_riesgo ENUM('Bajo', 'Medio', 'Alto', 'Crítico') NOT NULL,
        jerarquia_control ENUM('Eliminación', 'Sustitución', 'Control de Ingeniería', 'Control Administrativo', 'EPP') NOT NULL,
        medidas_control TEXT NOT NULL,
        area_id INT NULL,
        responsable_id INT NULL,
        fecha_evaluacion DATE NOT NULL,
        CONSTRAINT fk_iperc_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
        CONSTRAINT fk_iperc_resp FOREIGN KEY (responsable_id) REFERENCES trabajadores(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS residuos_ambientales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        tipo VARCHAR(120) NOT NULL,
        clase ENUM('Peligroso', 'No Peligroso') NOT NULL,
        color_tacho VARCHAR(50) NOT NULL,
        cantidad_kg DECIMAL(10,2) NOT NULL,
        fecha DATE NOT NULL,
        disposicion_final VARCHAR(200) NOT NULL,
        empresa_operadora_eors VARCHAR(150) NOT NULL,
        area_id INT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_residuos_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS monitoreo_ambiental (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        parametro VARCHAR(100) NOT NULL,
        valor_medido DECIMAL(10,2) NOT NULL,
        limite_permisible DECIMAL(10,2) NOT NULL,
        unidad VARCHAR(30) NOT NULL,
        estado_cumplimiento ENUM('Dentro de Límites', 'Alerta Preventiva', 'Supera Límites') NOT NULL,
        punto_muestreo VARCHAR(150) NOT NULL,
        fecha_medicion DATE NOT NULL,
        area_id INT NULL,
        CONSTRAINT fk_monitoreo_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS capacitaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        tema VARCHAR(250) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        estado ENUM('Programada', 'Ejecutada', 'Reprogramada') NOT NULL DEFAULT 'Programada',
        expositor VARCHAR(150) NOT NULL,
        fecha DATE NOT NULL,
        duracion_horas DECIMAL(4,1) NOT NULL DEFAULT 2.0,
        area_id INT NULL,
        total_asistentes INT NOT NULL DEFAULT 0,
        horas_hombre_total DECIMAL(8,1) NOT NULL DEFAULT 0.0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_cap_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tipos_epp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(30) NOT NULL UNIQUE,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        stock_actual INT NOT NULL DEFAULT 0,
        stock_minimo INT NOT NULL DEFAULT 5,
        unidad_medida VARCHAR(20) NOT NULL DEFAULT 'Unidad',
        costo_unitario DECIMAL(10,2) DEFAULT 0.00
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entregas_epp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo_epp_id INT NOT NULL,
        trabajador_id INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        fecha_entrega DATE NOT NULL,
        motivo VARCHAR(100) NOT NULL DEFAULT 'Dotación Periódica',
        observaciones VARCHAR(255) NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ent_epp FOREIGN KEY (tipo_epp_id) REFERENCES tipos_epp(id) ON DELETE CASCADE,
        CONSTRAINT fk_ent_trabajador FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion_empresa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        razon_social VARCHAR(200) NOT NULL,
        ruc VARCHAR(20) NOT NULL,
        nombre_comercial VARCHAR(200) NULL,
        rubro VARCHAR(150) NOT NULL DEFAULT 'Minería e Industria',
        direccion VARCHAR(255) NULL,
        telefono VARCHAR(50) NULL,
        email VARCHAR(120) NULL,
        sitio_web VARCHAR(150) NULL,
        logo_url LONGTEXT NULL,
        representante_legal VARCHAR(150) NULL,
        responsable_ssoma VARCHAR(150) NULL,
        moneda_simbolo VARCHAR(10) NOT NULL DEFAULT 'S/.',
        moneda_codigo VARCHAR(10) NOT NULL DEFAULT 'PEN',
        separador_decimales VARCHAR(5) NOT NULL DEFAULT '.',
        separador_miles VARCHAR(5) NOT NULL DEFAULT ',',
        dias_meta_sin_accidentes INT NOT NULL DEFAULT 180,
        limite_frecuencia_if DECIMAL(5,2) NOT NULL DEFAULT 2.00,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    console.log(`[SSOMA DB] Poblando datos iniciales y usuarios...`);

    // Insertar Usuarios con password hasheado 'admin123'
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Limpiar si existen o verificar
    const [userRows] = await connection.query(`SELECT COUNT(*) as count FROM usuarios`);
    if (userRows[0].count === 0) {
      await connection.query(`
        INSERT INTO usuarios (nombre, email, password_hash, rol, cargo, avatar_url) VALUES
        ('Ing. Carlos Mendoza', 'admin@ssoma.com', ?, 'admin_ssoma', 'Jefe Corporativo SSOMA', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
        ('Ing. Elena Ramos', 'supervisor@ssoma.com', ?, 'supervisor', 'Supervisora de Seguridad y Ambiente', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
        ('Dr. Roberto Farfán', 'medico@ssoma.com', ?, 'medico', 'Médico Ocupacional', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'),
        ('Ing. Patricia Solís', 'auditor@ssoma.com', ?, 'auditor', 'Auditora Trinorma ISO 45001/14001', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80')
      `, [passwordHash, passwordHash, passwordHash, passwordHash]);
    }

    // Areas
    const [areaRows] = await connection.query(`SELECT COUNT(*) as count FROM areas`);
    if (areaRows[0].count === 0) {
      await connection.query(`
        INSERT INTO areas (codigo, nombre, responsable, ubicacion) VALUES
        ('AR-PLANTA', 'Planta de Producción Principal', 'Ing. Javier Rojas', 'Nave Industrial A - Bloque 1'),
        ('AR-ALMACEN', 'Almacén Central y Logística', 'Marcos Salcedo', 'Zona de Embarque 2'),
        ('AR-MANT', 'Taller de Mantenimiento Mecánico', 'Ing. Walter Alva', 'Pabellón Técnico B'),
        ('AR-LAB', 'Laboratorio de Control Ambiental y Calidad', 'Lic. Diana Prado', 'Edificio Administrativo Piso 2'),
        ('AR-MINA', 'Frente de Operaciones / Obra', 'Ing. Raúl Cárdenas', 'Frente de Avance Norte'),
        ('AR-ADMIN', 'Oficinas Administrativas', 'Sofía Benítez', 'Pabellón Central')
      `);
    }

    // Trabajadores
    const [trabRows] = await connection.query(`SELECT COUNT(*) as count FROM trabajadores`);
    if (trabRows[0].count === 0) {
      await connection.query(`
        INSERT INTO trabajadores (dni, nombres, apellidos, cargo, area_id, telefono, email, avatar_url, fecha_ingreso) VALUES
        ('71234567', 'Jared', 'Terry', 'Operador de Montacargas', 2, '+51 987654321', 'jterry@ssoma.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', '2023-03-15'),
        ('72345678', 'Jasmine', 'Kuhlman', 'Técnica Ambiental de Campo', 4, '+51 987654322', 'jkuhlman@ssoma.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '2022-06-10'),
        ('73456789', 'Peonie', 'Hoeger', 'Supervisora de Planta', 1, '+51 987654323', 'phoeger@ssoma.com', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '2021-11-20'),
        ('74567890', 'Cedar', 'Botsford', 'Mecánico de Mantenimiento', 3, '+51 987654324', 'cbotsford@ssoma.com', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', '2024-01-15'),
        ('75678901', 'Elm', 'Flatley', 'Especialista en Seguridad Ocupacional', 1, '+51 987654325', 'eflatley@ssoma.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '2020-08-01'),
        ('76789012', 'Mateo', 'Villanueva', 'Soldador Calificado 6G', 3, '+51 987654326', 'mvillanueva@ssoma.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '2023-09-12'),
        ('77890123', 'Valeria', 'Guerrero', 'Analista de Monitoreo Ambiental', 4, '+51 987654327', 'vguerrero@ssoma.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', '2022-04-05'),
        ('78901234', 'Rodrigo', 'Paredes', 'Jefe de Cuadrilla Civil', 5, '+51 987654328', 'rparedes@ssoma.com', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', '2023-05-18')
      `);
    }

    // Incidentes con datos reales SSOMA
    const [incRows] = await connection.query(`SELECT COUNT(*) as count FROM incidentes`);
    if (incRows[0].count === 0) {
      await connection.query(`
        INSERT INTO incidentes (codigo, titulo, tipo, severidad, estado, lugar, fecha_ocurrencia, area_id, reportado_por_id, afectado_id, dias_perdidos, descripcion, causa_raiz, accion_correctiva, costo_estimado) VALUES
        ('INC-2026-001', 'Derrame menor de aceite hidráulico en bahía de carga', 'Emergencia Ambiental', 'Leve', 'Cerrado', 'Bahía de carga Almacén 2', '2026-09-08 10:30:00', 2, 1, NULL, 0, 'Fuga de manguera presurizada en montacargas durante maniobra de estiba.', 'Falta de inspección pre-uso en mangueras de acople rápido.', 'Contención inmediata con kit antiderrames, cambio de manguera y reentrenamiento pre-uso.', 150.00),
        ('INC-2026-002', 'Cuasi-accidente por desprendimiento de carga suspendida', 'Cuasi-Accidente', 'Moderado', 'Plan de Acción', 'Línea de ensamblaje nave A', '2026-09-05 15:20:00', 1, 3, 4, 0, 'Eslinga textil rozó borde cortante y se fisuró sin llegar a soltar la pieza en el suelo.', 'Uso de eslinga sin cantoneras de protección en aristas filosas.', 'Retiro de lote de eslingas desgastadas y compra de cantoneras de poliuretano.', 300.00),
        ('INC-2026-003', 'Corte leve en antebrazo derecho durante amolado', 'Accidente Sin Tiempo Perdido', 'Leve', 'Cerrado', 'Taller mecánico banco 4', '2026-09-02 11:45:00', 3, 4, 6, 0, 'Proyección de rebaba metálica al amolar cordón de soldadura sin manga de cuero.', 'Exceso de confianza del operario al no utilizar la manga de cuero reglamentaria.', 'Atención en tópico con desinfección, charla de 5 minutos sobre EPP específico.', 80.00),
        ('INC-2026-004', 'Bloqueo temporal de pasadizo de evacuación por parihuelas', 'Condición Insegura', 'Leve', 'Cerrado', 'Pasillo central almacén', '2026-08-28 09:15:00', 2, 2, NULL, 0, 'Parihuelas vacías dejadas en zona de tránsito señalizada con líneas amarillas.', 'Abarrotamiento temporal de pedidos entrantes.', 'Reubicación inmediata al rack de almacenamiento y demarcación reforzada.', 50.00),
        ('INC-2026-005', 'Emisión de humos por sobrecalentamiento de compresor', 'Emergencia Ambiental', 'Moderado', 'En Investigación', 'Sala de máquinas compresores', '2026-08-20 16:10:00', 1, 5, NULL, 0, 'Falla en termostato de refrigeración provocó humo denso que activó sensor.', 'Retraso en mantenimiento preventivo mensual del sistema de refrigeración.', 'Parada programada, cambio de termostato y filtros de escape.', 650.00),
        ('INC-2026-006', 'Esguince de tobillo por desnivel en rampa exterior', 'Accidente con Tiempo Perdido', 'Grave', 'Plan de Acción', 'Rampa peatonal acceso oeste', '2026-08-14 08:30:00', 5, 8, 8, 3, 'Pérdida de pisada al descender por rampa húmeda con calzado de seguridad sin antideslizante en suela.', 'Desgaste en la cinta antideslizante de la rampa y suelo resbaloso por llovizna matutina.', 'Colocación de rejilla grating antideslizante, pasamanos doble y reposo médico 3 días.', 950.00)
      `);
    }

    // Inspecciones
    const [inspRows] = await connection.query(`SELECT COUNT(*) as count FROM inspecciones`);
    if (inspRows[0].count === 0) {
      await connection.query(`
        INSERT INTO inspecciones (codigo, titulo, tipo, estado, fecha_programada, fecha_ejecucion, puntaje_cumplimiento, observaciones, area_id, responsable_id) VALUES
        ('INS-2026-01', 'Inspección Mensual de Extintores y Gabinetes Contra Incendio', 'Extintores y Emergencias', 'Completada', '2026-09-01', '2026-09-02', 96.50, '30 extintores PQS y CO2 revisados. Presión óptima y tarjetas de control al día.', 1, 5),
        ('INS-2026-02', 'Inspección Planeada de Orden y Limpieza 5S', 'Orden y Limpieza 5S', 'Completada', '2026-09-04', '2026-09-04', 92.00, 'Se detectaron residuos acumulados en taller que ya fueron reordenados.', 3, 3),
        ('INS-2026-03', 'Auditoría de Almacenamiento de Residuos Peligrosos y No Peligrosos', 'Ambiental y Manejo de Residuos', 'Completada', '2026-09-07', '2026-09-08', 98.00, 'Tachos rotulados conforme a NTP 900.058. Hojas SDS presentes.', 4, 2),
        ('INS-2026-04', 'Inspección de Equipos de Izaje, Tecles y Grúa Puente', 'Equipos y Maquinaria', 'En Curso', '2026-09-12', '2026-09-12', 88.00, 'Verificación de seguros de ganchos y cables de acero.', 1, 4),
        ('INS-2026-05', 'Inspección de Botiquines de Primeros Auxilios y Lavaojos', 'Seguridad en Campo', 'Programada', '2026-09-18', NULL, 100.00, 'Verificación de stock de medicamentos y caducidades.', 2, 5)
      `);
    }

    // Hallazgos
    const [hallRows] = await connection.query(`SELECT COUNT(*) as count FROM hallazgos`);
    if (hallRows[0].count === 0) {
      await connection.query(`
        INSERT INTO hallazgos (inspeccion_id, descripcion, tipo_hallazgo, nivel_riesgo, estado, accion_correctiva, responsable_id, fecha_limite) VALUES
        (1, 'Extintor CO2 de 5kg en bahía 3 tiene precinto roto sin descarga evidente.', 'Condición Subestándar', 'Medio', 'Subsanado', 'Reemplazo preventivo y nuevo precintado.', 5, '2026-09-04'),
        (2, 'Líquido refrigerante goteando cerca de torno mecánico sin bandeja de contención.', 'Condición Subestándar', 'Medio', 'Subsanado', 'Instalación de bandeja de goteo y limpieza del piso.', 4, '2026-09-06'),
        (4, 'Pestillo de seguridad en gancho de tecle eléctrico n° 2 presenta holgura.', 'Condición Subestándar', 'Alto', 'En Proceso', 'Cambio inmediato del kit de pestillo de seguridad por mantenimiento.', 4, '2026-09-16')
      `);
    }

    // IPERC
    const [ipercRows] = await connection.query(`SELECT COUNT(*) as count FROM iperc`);
    if (ipercRows[0].count === 0) {
      await connection.query(`
        INSERT INTO iperc (codigo, proceso, actividad, tarea, peligro, riesgo, probabilidad, severidad, nivel_riesgo, jerarquia_control, medidas_control, area_id, responsable_id, fecha_evaluacion) VALUES
        ('IPERC-2026-01', 'Mantenimiento Mecánico', 'Corte y Soldadura de Planchas', 'Amolado de superficies metálicas', 'Material particulado y chispas a alta velocidad', 'Quemaduras cutáneas y lesiones oculares', 2, 3, 'Medio', 'EPP', 'Uso obligatorio de careta facial de policarbonato, mandil de cuero, guantes de caña larga y biombos ignífugos.', 3, 4, '2026-01-15'),
        ('IPERC-2026-02', 'Logística y Almacenes', 'Carga y Descarga de Mercadería', 'Operación de montacargas en pasillos', 'Tránsito de vehículos y peatones en la misma zona', 'Atropello, colisión o caída de carga', 2, 4, 'Alto', 'Control de Ingeniería', 'Demarcación de vías peatonales exclusivas con barreras físicas, sirena y sensor de proximidad en montacargas.', 2, 1, '2026-02-10'),
        ('IPERC-2026-03', 'Operaciones de Planta', 'Mantenimiento de Silos y Tanques', 'Trabajos en Espacios Confinados', 'Atmósfera deficiente de oxígeno y gases tóxicos', 'Asfixia, pérdida de conciencia y muerte', 1, 5, 'Crítico', 'Control Administrativo', 'Monitoreo continuo multigas, vigía permanente, ventilación forzada y permiso de trabajo de alto riesgo (PETAR).', 1, 5, '2026-03-05'),
        ('IPERC-2026-04', 'Gestión de Laboratorio', 'Análisis Químico de Muestras', 'Manipulación de Ácido Sulfúrico concentrado', 'Contacto con reactivo corrosivo', 'Quemaduras químicas severas en piel y ojos', 2, 3, 'Medio', 'Control de Ingeniería', 'Trabajo bajo campana extractora de gases, uso de guantes de nitrilo alto espesor y disponibilidad de ducha lavaojos a 5 metros.', 4, 7, '2026-04-12'),
        ('IPERC-2026-05', 'Construcción y Montaje', 'Armado de Andamios y Estructuras', 'Trabajos en Altura superior a 1.80m', 'Trabajo sobre plataformas elevadas sin baranda perimétrica', 'Caída a distinto nivel con traumatismos graves', 2, 4, 'Alto', 'Control de Ingeniería', 'Andamios multidireccionales certificados, arnés de cuerpo entero con doble línea de vida y punto de anclaje certificado.', 5, 8, '2026-05-18')
      `);
    }

    // Residuos Ambientales
    const [resRows] = await connection.query(`SELECT COUNT(*) as count FROM residuos_ambientales`);
    if (resRows[0].count === 0) {
      await connection.query(`
        INSERT INTO residuos_ambientales (codigo, tipo, clase, color_tacho, cantidad_kg, fecha, disposicion_final, empresa_operadora_eors, area_id) VALUES
        ('RES-2026-080', 'Residuos de Hidrocarburos y Paños Contaminados', 'Peligroso', 'Rojo', 185.50, '2026-09-02', 'Incineración y Relleno de Seguridad', 'Ecológica San Martín EO-RS S.A.C.', 3),
        ('RES-2026-081', 'Plástico Film y Botellas PET', 'No Peligroso', 'Blanco', 340.00, '2026-09-03', 'Reciclaje y Valorización Material', 'ReciclaPerú Operadora Ambiental', 2),
        ('RES-2026-082', 'Cartón Corrugado y Cajas de Embalaje', 'No Peligroso', 'Azul', 520.00, '2026-09-05', 'Reciclaje y Pulpeado', 'Papelera del Norte EO-RS', 2),
        ('RES-2026-083', 'Chatarra Metálica y Virutas de Torno', 'No Peligroso', 'Amarillo', 640.00, '2026-09-07', 'Fundición y Reciclaje Metalúrgico', 'Aceros Sidercorp Reciclaje', 1),
        ('RES-2026-084', 'Baterías y Pilas Industriales Agotadas', 'Peligroso', 'Rojo', 95.00, '2026-09-08', 'Desactivación Química en Relleno de Seguridad', 'Bebat Ambiental Logística', 3),
        ('RES-2026-085', 'Residuos de Vidrio y Envases de Reactivos Lavados', 'No Peligroso', 'Gris', 110.00, '2026-09-10', 'Reciclaje de Vidrio Industrial', 'Vidriería Sostenible del Perú', 4)
      `);
    }

    // Monitoreo Ambiental
    const [monRows] = await connection.query(`SELECT COUNT(*) as count FROM monitoreo_ambiental`);
    if (monRows[0].count === 0) {
      await connection.query(`
        INSERT INTO monitoreo_ambiental (codigo, parametro, valor_medido, limite_permisible, unidad, estado_cumplimiento, punto_muestreo, fecha_medicion, area_id) VALUES
        ('MON-2026-01', 'Ruido Ocupacional Continuo', 78.40, 85.00, 'dBA', 'Dentro de Límites', 'Estación de Prensas - Nave A', '2026-09-03', 1),
        ('MON-2026-02', 'Material Particulado PM10', 42.10, 100.00, 'µg/m3', 'Dentro de Límites', 'Perímetro Oeste - Barlovento', '2026-09-05', 5),
        ('MON-2026-03', 'Material Particulado PM2.5', 21.30, 25.00, 'µg/m3', 'Alerta Preventiva', 'Perímetro Este - Sotavento', '2026-09-05', 5),
        ('MON-2026-04', 'Monóxido de Carbono CO', 4.50, 10.00, 'PPM', 'Dentro de Límites', 'Bahía de montacargas a gas GLP', '2026-09-07', 2),
        ('MON-2026-05', 'Potencial de Hidrógeno pH Efluentes', 7.20, 8.50, 'pH', 'Dentro de Límites', 'Cámara de neutralización efluentes', '2026-09-08', 4),
        ('MON-2026-06', 'Demanda Bioquímica de Oxígeno DBO5', 28.00, 50.00, 'mg/L', 'Dentro de Límites', 'Salida de planta de tratamiento', '2026-09-08', 4)
      `);
    }

    // Capacitaciones
    const [capRows] = await connection.query(`SELECT COUNT(*) as count FROM capacitaciones`);
    if (capRows[0].count === 0) {
      await connection.query(`
        INSERT INTO capacitaciones (codigo, tema, tipo, estado, expositor, fecha, duracion_horas, area_id, total_asistentes, horas_hombre_total) VALUES
        ('CAP-2026-01', 'IPERC Continuo y Jerarquía de Controles Operacionales', 'Seguridad Preventiva', 'Ejecutada', 'Ing. Carlos Mendoza', '2026-08-15', 2.5, 1, 38, 95.0),
        ('CAP-2026-02', 'Manejo Seguro de Sustancias Peligrosas y Uso de Hojas SDS', 'Salud y Medio Ambiente', 'Ejecutada', 'Lic. Diana Prado', '2026-08-25', 2.0, 4, 25, 50.0),
        ('CAP-2026-03', 'Taller Teórico-Práctico de Trabajos en Altura y Rescate', 'Trabajos de Alto Riesgo', 'Ejecutada', 'Ing. Raúl Cárdenas', '2026-09-04', 4.0, 5, 18, 72.0),
        ('CAP-2026-04', 'Segregación de Residuos Sólidos y Código de Colores NTP', 'Gestión Ambiental', 'Programada', 'Ing. Elena Ramos', '2026-09-20', 2.0, 2, 45, 90.0),
        ('CAP-2026-05', 'Brigada de Lucha Contra Incendios y Evacuación de Emergencia', 'Respuesta a Emergencias', 'Programada', 'Cuerpo de Bomberos Voluntarios', '2026-09-28', 3.0, 1, 30, 90.0)
      `);
    }

    // Tipos de EPP
    const [eppRows] = await connection.query(`SELECT COUNT(*) as count FROM tipos_epp`);
    if (eppRows[0].count === 0) {
      await connection.query(`
        INSERT INTO tipos_epp (codigo, nombre, categoria, stock_actual, stock_minimo, unidad_medida, costo_unitario) VALUES
        ('EPP-001', 'Casco de Seguridad Tipo I Clase E con Barboquejo', 'Protección Craneal', 42, 15, 'Unidad', 45.00),
        ('EPP-002', 'Lentes de Seguridad Anti-empañantes UV 400', 'Protección Ocular', 85, 30, 'Par', 18.50),
        ('EPP-003', 'Protector Auditivo Tipo Copa para Casco SNR 32dB', 'Protección Auditiva', 28, 10, 'Par', 65.00),
        ('EPP-004', 'Respirador de Media Cara con Filtros Mixtos para Vapores/Gases', 'Protección Respiratoria', 16, 12, 'Juego', 110.00),
        ('EPP-005', 'Botas Dieléctricas con Puntera de Composite ASTM F2413', 'Protección Pies', 19, 10, 'Par', 185.00),
        ('EPP-006', 'Arnés de Seguridad Multipropósito de 4 Anillos Dieléctrico', 'Protección Caídas', 12, 8, 'Unidad', 240.00),
        ('EPP-007', 'Guantes de Nitrilo para Manipulación Química Solvex', 'Protección Manos', 60, 25, 'Par', 22.00)
      `);
    }

    // Entregas de EPP
    const [entRows] = await connection.query(`SELECT COUNT(*) as count FROM entregas_epp`);
    if (entRows[0].count === 0) {
      await connection.query(`
        INSERT INTO entregas_epp (tipo_epp_id, trabajador_id, cantidad, fecha_entrega, motivo, observaciones) VALUES
        (1, 1, 1, '2026-08-01', 'Dotación Periódica', 'Casco blanco con barboquejo'),
        (2, 1, 2, '2026-08-01', 'Dotación Periódica', 'Lentes claros y oscuros'),
        (5, 4, 1, '2026-08-15', 'Renovación por Deterioro', 'Cambio por suela desgastada en taller'),
        (6, 6, 1, '2026-08-20', 'Dotación Especial', 'Arnés para trabajo en andamios nave A'),
        (4, 7, 2, '2026-09-01', 'Dotación Periódica', 'Cartuchos químicos para laboratorio'),
        (7, 4, 3, '2026-09-05', 'Dotación Periódica', 'Guantes para solventes')
      `);
    }

    // Configuración Empresa
    const [cfgRows] = await connection.query(`SELECT COUNT(*) as count FROM configuracion_empresa`);
    if (cfgRows[0].count === 0) {
      await connection.query(`
        INSERT INTO configuracion_empresa (
          razon_social, ruc, nombre_comercial, rubro, direccion, telefono, email, sitio_web,
          logo_url, representante_legal, responsable_ssoma, moneda_simbolo, moneda_codigo,
          separador_decimales, separador_miles, dias_meta_sin_accidentes, limite_frecuencia_if
        ) VALUES (
          'Corporación Industrial & Minera EcoSafe S.A.C.',
          '20601234567',
          'EcoSafe SSOMA Solutions',
          'Minería y Metalmecánica Pesada',
          'Av. Las Begonias 441, Piso 12, San Isidro, Lima - Perú',
          '+51 (01) 456-7890',
          'contacto@ecosafe.com.pe',
          'https://www.ecosafe-ssoma.com',
          'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
          'Ing. Roberto Carrión Morales',
          'Ing. Carlos Mendoza (Jefe SSOMA)',
          'S/.',
          'PEN',
          '.',
          ',',
          180,
          2.00
        )
      `);
    }

    console.log(`[SSOMA DB] ✅ Base de datos "${dbName}" inicializada exitosamente con datos completos.`);
  } catch (error) {
    console.error(`[SSOMA DB] ❌ Error al inicializar base de datos:`, error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
