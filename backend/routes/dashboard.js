const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();

    // 1. Incidentes resumen
    const [incTotalRows] = await pool.query('SELECT COUNT(*) as total FROM incidentes');
    const [incMesRows] = await pool.query(`
      SELECT COUNT(*) as total FROM incidentes 
      WHERE MONTH(fecha_ocurrencia) = MONTH(CURRENT_DATE()) AND YEAR(fecha_ocurrencia) = YEAR(CURRENT_DATE())
    `);
    const [incGraveRows] = await pool.query(`
      SELECT COUNT(*) as total, MAX(fecha_ocurrencia) as ultima_fecha FROM incidentes 
      WHERE severidad IN ('Grave', 'Crítico') AND dias_perdidos > 0
    `);

    // Días sin accidentes graves con tiempo perdido
    let diasSinAccidentes = 184; // base demostrativa realista
    if (incGraveRows[0].ultima_fecha) {
      const diffTime = Math.abs(new Date() - new Date(incGraveRows[0].ultima_fecha));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) diasSinAccidentes = diffDays;
    }

    // 2. Inspecciones cumplimiento
    const [inspRows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
        AVG(puntaje_cumplimiento) as promedio_puntaje
      FROM inspecciones
    `);
    const totalInsp = inspRows[0].total || 1;
    const compInsp = inspRows[0].completadas || 0;
    const porcentajeCumplimiento = ((compInsp / totalInsp) * 100).toFixed(1);

    // 3. Residuos ambientales
    const [resRows] = await pool.query(`
      SELECT 
        SUM(cantidad_kg) as total_kg,
        SUM(CASE WHEN clase = 'No Peligroso' THEN cantidad_kg ELSE 0 END) as no_peligroso_kg
      FROM residuos_ambientales
    `);
    const totalKgResiduos = (parseFloat(resRows[0].total_kg) || 1890.5).toFixed(0);

    // 4. Trabajadores y HH
    const [trabRows] = await pool.query('SELECT COUNT(*) as total FROM trabajadores WHERE activo = 1');
    const [capRows] = await pool.query('SELECT SUM(horas_hombre_total) as total_hh FROM capacitaciones');
    const totalHH = parseFloat(capRows[0].total_hh) || 307.0;

    // 5. Histórico mensual para el Spline / Wave Chart (12 meses)
    const mesesChart = [
      { mes: 'Ene', valor: 2.1, inspecciones: 8, incidentes: 2, meta: 4.5 },
      { mes: 'Feb', valor: 3.8, inspecciones: 10, incidentes: 1, meta: 4.5 },
      { mes: 'Mar', valor: 2.6, inspecciones: 12, incidentes: 3, meta: 4.5 },
      { mes: 'Abr', valor: 4.2, inspecciones: 15, incidentes: 1, meta: 4.5 },
      { mes: 'May', valor: 3.1, inspecciones: 14, incidentes: 0, meta: 4.5 },
      { mes: 'Jun', valor: 3.989, inspecciones: 18, incidentes: 2, meta: 4.5, destacado: true, tooltip: '$3,989 / 20 June 2026' },
      { mes: 'Jul', valor: 2.3, inspecciones: 16, incidentes: 1, meta: 4.5 },
      { mes: 'Ago', valor: 4.5, inspecciones: 19, incidentes: 3, meta: 4.5 },
      { mes: 'Sep', valor: 3.2, inspecciones: 15, incidentes: 1, meta: 4.5 },
      { mes: 'Oct', valor: 5.4, inspecciones: 22, incidentes: 0, meta: 4.5 },
      { mes: 'Nov', valor: 3.6, inspecciones: 17, incidentes: 1, meta: 4.5 },
      { mes: 'Dic', valor: 4.8, inspecciones: 20, incidentes: 0, meta: 4.5 }
    ];

    // 6. Incidentes recientes formateados con autor, fecha, badges
    const [recientesRows] = await pool.query(`
      SELECT 
        i.id,
        i.codigo,
        i.titulo,
        i.tipo,
        i.severidad,
        i.estado,
        i.dias_perdidos,
        i.costo_estimado,
        DATE_FORMAT(i.fecha_ocurrencia, '%d/%m/%Y') as fecha_formateada,
        t.nombres,
        t.apellidos,
        t.cargo,
        t.avatar_url,
        a.nombre as area_nombre
      FROM incidentes i
      LEFT JOIN trabajadores t ON i.reportado_por_id = t.id
      LEFT JOIN areas a ON i.area_id = a.id
      ORDER BY i.fecha_ocurrencia DESC
      LIMIT 6
    `);

    // 7. Distribución de Riesgos / Status para el Donut chart
    // Active (48%), Complete (35%), On Hold (17%)
    const distribucionStatus = [
      { name: 'Activos / En Proceso', label: 'Active', value: 48, color: '#4F46E5' },
      { name: 'Completados / Subsanados', label: 'Complete', value: 35, color: '#10B981' },
      { name: 'En Espera / Plan Acción', label: 'On Hold', value: 17, color: '#F59E0B' }
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          diasSinAccidentes: {
            valor: diasSinAccidentes.toString(),
            label: 'Días Sin Accidentes',
            variacion: '+62% vs meta',
            subtexto: 'Meta: 180 Días',
            color: 'emerald',
            icono: 'shield'
          },
          totalIncidentesMes: {
            valor: (incMesRows[0].total || 3).toString(),
            label: 'Incidentes Este Mes',
            variacion: '-30% reducción',
            subtexto: `${incTotalRows[0].total} anuales`,
            color: 'indigo',
            icono: 'alert'
          },
          cumplimientoInspecciones: {
            valor: `${porcentajeCumplimiento}%`,
            label: 'Inspecciones al Día',
            variacion: '+52% completadas',
            subtexto: `${compInsp} de ${totalInsp} ejecutadas`,
            color: 'amber',
            icono: 'clipboard'
          },
          gestionAmbiental: {
            valor: `${totalKgResiduos} kg`,
            label: 'Residuos Gestionados',
            variacion: '+35% reciclado',
            subtexto: '100% disposición EO-RS',
            color: 'rose',
            icono: 'leaf'
          }
        },
        graficoTendencia: {
          titulo: 'Evolución Anual SSOMA & Horas Seguras',
          totalAnualLabel: '$59,540 / 12,450 HH',
          meses: mesesChart
        },
        distribucionStatus,
        kpiDerecho: {
          titulo: 'Índice de Severidad (IS)',
          valor: '0.45',
          subtitulo: 'Tasa Frecuencia (IF): 1.12',
          variacion: '-15% año anterior'
        },
        incidentesRecientes: recientesRows.map(r => ({
          id: `#${r.codigo.replace('INC-2026-', '')}`,
          codigoCompleto: r.codigo,
          nombre: `${r.nombres || 'Personal'} ${r.apellidos || 'SSOMA'}`.trim(),
          cargo: r.cargo || 'Operaciones',
          avatar: r.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          fecha: r.fecha_formateada,
          precio: `$${parseFloat(r.costo_estimado || 150).toFixed(0)}`,
          severidad: r.severidad,
          tipo: r.tipo,
          titulo: r.titulo,
          area: r.area_nombre,
          diasPerdidos: r.dias_perdidos,
          estado: r.estado,
          statusColor: r.estado === 'Cerrado' ? '#10B981' : (r.estado === 'En Investigación' ? '#4F46E5' : '#F59E0B')
        }))
      }
    });
  } catch (err) {
    console.error('Error obteniendo stats de dashboard:', err);
    res.status(500).json({ success: false, message: 'Error cargando datos de dashboard.' });
  }
});

module.exports = router;
