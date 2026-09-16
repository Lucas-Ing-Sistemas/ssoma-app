import React, { useEffect, useState } from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText, Building2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function ReportModal({ isOpen, onClose }) {
  const { company, formatMoney } = useCompany();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:5000/api/reportes/mensual')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReportData(data.reporte);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ssoma-modal-overlay" onClick={onClose}>
      <div className="ssoma-modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div className="ssoma-modal-header" style={{ background: '#0d1527', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt="Logo"
                style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={20} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Informe Mensual SSOMA - {company?.nombre_comercial || 'Gestión SSOMA'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {company?.razon_social} • RUC: {company?.ruc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="ssoma-modal-body" style={{ padding: '28px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando informe ejecutivo...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Report Card */}
              <div style={{
                background: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Días Sin Accidentes</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{reportData?.diasSinAccidentes || 184}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Índice Frecuencia (IF)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>{reportData?.indiceFrecuencia || '1.12'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Índice Severidad (IS)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{reportData?.indiceSeveridad || '0.45'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cumplimiento Legal</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>98.5%</div>
                </div>
              </div>

              {/* Secciones del Reporte */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                  1. Resumen de Incidentes por Severidad
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Severidad</th>
                      <th style={{ padding: '8px 12px' }}>Total Eventos</th>
                      <th style={{ padding: '8px 12px' }}>Días Perdidos</th>
                      <th style={{ padding: '8px 12px' }}>Costo Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.incidentes && reportData.incidentes.map((inc, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{inc.severidad}</td>
                        <td style={{ padding: '8px 12px' }}>{inc.total}</td>
                        <td style={{ padding: '8px 12px' }}>{inc.dias_perdidos || 0}</td>
                        <td style={{ padding: '8px 12px' }}>{formatMoney(inc.costo_total || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                  2. Monitoreo Ambiental de Factores Físicos y Químicos
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Parámetro</th>
                      <th style={{ padding: '8px 12px' }}>Valor Medido</th>
                      <th style={{ padding: '8px 12px' }}>Límite Máximo Permisible</th>
                      <th style={{ padding: '8px 12px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.monitoreo && reportData.monitoreo.map((mon, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{mon.parametro}</td>
                        <td style={{ padding: '8px 12px' }}>{mon.valor_medido} {mon.unidad}</td>
                        <td style={{ padding: '8px 12px' }}>{mon.limite_permisible} {mon.unidad}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: mon.estado_cumplimiento === 'Dentro de Límites' ? '#dcfce7' : '#fef3c7',
                            color: mon.estado_cumplimiento === 'Dentro de Límites' ? '#15803d' : '#b45309'
                          }}>
                            {mon.estado_cumplimiento}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#64748b'
              }}>
                <div>Emitido por: {reportData?.elaboradoPor || 'Ing. Carlos Mendoza (Jefe SSOMA)'}</div>
                <div>EcoSafe SSOMA Cloud System v2.6</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
