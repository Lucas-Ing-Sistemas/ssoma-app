import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Leaf, Trash2, Activity, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AmbientalView() {
  const [activeSubTab, setActiveSubTab] = useState('residuos');
  const [residuos, setResiduos] = useState([]);
  const [monitoreo, setMonitoreo] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalResiduo, setIsModalResiduo] = useState(false);
  const [isModalMonitoreo, setIsModalMonitoreo] = useState(false);
  const [areas, setAreas] = useState([]);

  const [formResiduo, setFormResiduo] = useState({
    tipo: 'Plástico Film y Botellas PET',
    clase: 'No Peligroso',
    color_tacho: 'Blanco',
    cantidad_kg: '',
    disposicion_final: 'Reciclaje y Valorización',
    empresa_operadora_eors: 'ReciclaPerú EO-RS',
    area_id: ''
  });

  const [formMonitoreo, setFormMonitoreo] = useState({
    parametro: 'Ruido Ocupacional Continuo',
    valor_medido: '',
    limite_permisible: '85.00',
    unidad: 'dBA',
    punto_muestreo: '',
    area_id: ''
  });

  const loadData = () => {
    setLoading(true);
    fetch('https://ssoma-app-fbwe.onrender.com/api/ambiental/residuos')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setResiduos(d.data);
          setSummary(d.summary);
        }
      });

    fetch('https://ssoma-app-fbwe.onrender.com/api/ambiental/monitoreo')
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setMonitoreo(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('https://ssoma-app-fbwe.onrender.com/api/personal/areas').then((res) => res.json()).then((d) => d.success && setAreas(d.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveResiduo = async (e) => {
    e.preventDefault();
    await fetch('https://ssoma-app-fbwe.onrender.com/api/ambiental/residuos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formResiduo)
    });
    setIsModalResiduo(false);
    loadData();
  };

  const handleSaveMonitoreo = async (e) => {
    e.preventDefault();
    await fetch('https://ssoma-app-fbwe.onrender.com/api/ambiental/monitoreo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formMonitoreo)
    });
    setIsModalMonitoreo(false);
    loadData();
  };

  const getColorHex = (colorName) => {
    switch (colorName.toLowerCase()) {
      case 'rojo': return '#ef4444';
      case 'azul': return '#3b82f6';
      case 'amarillo': return '#eab308';
      case 'blanco': return '#64748b';
      case 'gris': return '#94a3b8';
      default: return '#10b981';
    }
  };

  return (
    <div className="ssoma-content-wrapper" style={{ maxWidth: '100%' }}>
      <main className="ssoma-main-panel" style={{ width: '100%' }}>
        <Header title="Gestión Ambiental & Sostenibilidad" searchTerm={searchTerm} onSearch={setSearchTerm} />

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveSubTab('residuos')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeSubTab === 'residuos' ? '#10b981' : '#ffffff',
              color: activeSubTab === 'residuos' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Trash2 size={18} />
            <span>Residuos Sólidos (NTP 900.058)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('monitoreo')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeSubTab === 'monitoreo' ? '#10b981' : '#ffffff',
              color: activeSubTab === 'monitoreo' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Activity size={18} />
            <span>Monitoreo de Calidad Ambiental</span>
          </button>
        </div>

        {activeSubTab === 'residuos' && (
          <>
            {/* Tarjetas de Resumen por Tipo de Tacho / Residuo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', borderTop: '4px solid #ef4444' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Residuos Peligrosos (Rojo)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  {residuos.filter(r => r.clase === 'Peligroso').reduce((acc, c) => acc + parseFloat(c.cantidad_kg), 0).toFixed(0)} kg
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Confinamiento de seguridad</span>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', borderTop: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Papel & Cartón (Azul)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                  {residuos.filter(r => r.color_tacho === 'Azul').reduce((acc, c) => acc + parseFloat(c.cantidad_kg), 0).toFixed(0)} kg
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>100% Reciclaje papelero</span>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', borderTop: '4px solid #eab308' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Metales & Chatarra (Amarillo)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>
                  {residuos.filter(r => r.color_tacho === 'Amarillo').reduce((acc, c) => acc + parseFloat(c.cantidad_kg), 0).toFixed(0)} kg
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fundición siderúrgica</span>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', borderTop: '4px solid #10b981' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Plásticos y Film (Blanco)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {residuos.filter(r => r.color_tacho === 'Blanco').reduce((acc, c) => acc + parseFloat(c.cantidad_kg), 0).toFixed(0)} kg
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Transformación en pellets</span>
              </div>
            </div>

            {/* Tabla de Registros de Residuos */}
            <div className="ssoma-table-card">
              <div className="ssoma-table-header">
                <h2 className="ssoma-table-title">Bitácora de Pesaje y Evacuación de Residuos</h2>
                <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalResiduo(true)}>
                  <Plus size={18} />
                  <span>+ Registrar Pesaje</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ssoma-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Tipo de Residuo</th>
                      <th>Clase</th>
                      <th>Color Tacho</th>
                      <th>Peso (Kg)</th>
                      <th>Fecha</th>
                      <th>Disposición Final</th>
                      <th>Operador Autorizado EO-RS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residuos.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 800, color: '#334155' }}>{r.codigo}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.tipo}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: r.clase === 'Peligroso' ? '#fee2e2' : '#dcfce7',
                            color: r.clase === 'Peligroso' ? '#b91c1c' : '#15803d'
                          }}>
                            {r.clase}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getColorHex(r.color_tacho) }}></span>
                            {r.color_tacho}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#0f172a' }}>{parseFloat(r.cantidad_kg).toFixed(1)} kg</td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.fecha_fmt}</td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>{r.disposicion_final}</td>
                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{r.empresa_operadora_eors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeSubTab === 'monitoreo' && (
          <div className="ssoma-table-card">
            <div className="ssoma-table-header">
              <div>
                <h2 className="ssoma-table-title">Monitoreo de Agentes Físicos y Calidad Ambiental</h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Límites Máximos Permisibles (LMP) según estándares ambientales vigentes
                </p>
              </div>
              <button className="ssoma-btn ssoma-btn-primary" onClick={() => setIsModalMonitoreo(true)}>
                <Plus size={18} />
                <span>+ Registrar Muestra</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ssoma-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Parámetro Monitoreado</th>
                    <th>Valor Medido</th>
                    <th>Límite Máximo Permisible</th>
                    <th>Punto de Muestreo</th>
                    <th>Fecha</th>
                    <th>Estado de Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoreo.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 800, color: '#334155' }}>{m.codigo}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.parametro}</td>
                      <td style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        {m.valor_medido} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{m.unidad}</span>
                      </td>
                      <td style={{ color: '#475569', fontWeight: 600 }}>
                        {m.limite_permisible} {m.unidad}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#334155' }}>{m.punto_muestreo}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.fecha_fmt}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: m.estado_cumplimiento === 'Dentro de Límites' ? '#dcfce7' : (m.estado_cumplimiento === 'Alerta Preventiva' ? '#fef3c7' : '#fee2e2'),
                          color: m.estado_cumplimiento === 'Dentro de Límites' ? '#15803d' : (m.estado_cumplimiento === 'Alerta Preventiva' ? '#b45309' : '#b91c1c')
                        }}>
                          {m.estado_cumplimiento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Residuo */}
        {isModalResiduo && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalResiduo(false)}>
            <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nuevo Pesaje de Residuos</h3>
                <button onClick={() => setIsModalResiduo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleSaveResiduo}>
                <div className="ssoma-modal-body">
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group full">
                      <label className="ssoma-label">Tipo de Residuo</label>
                      <input
                        type="text"
                        required
                        className="ssoma-input"
                        value={formResiduo.tipo}
                        onChange={(e) => setFormResiduo({ ...formResiduo, tipo: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Clase</label>
                      <select
                        className="ssoma-select"
                        value={formResiduo.clase}
                        onChange={(e) => setFormResiduo({ ...formResiduo, clase: e.target.value })}
                      >
                        <option value="No Peligroso">No Peligroso</option>
                        <option value="Peligroso">Peligroso</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Color de Tacho (NTP 900.058)</label>
                      <select
                        className="ssoma-select"
                        value={formResiduo.color_tacho}
                        onChange={(e) => setFormResiduo({ ...formResiduo, color_tacho: e.target.value })}
                      >
                        <option value="Blanco">Blanco (Plásticos)</option>
                        <option value="Azul">Azul (Papel y Cartón)</option>
                        <option value="Amarillo">Amarillo (Metales)</option>
                        <option value="Rojo">Rojo (Peligrosos)</option>
                        <option value="Gris">Gris (Vidrio)</option>
                        <option value="Marrón">Marrón (Orgánicos)</option>
                      </select>
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Cantidad (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        className="ssoma-input"
                        placeholder="Ej. 120.5"
                        value={formResiduo.cantidad_kg}
                        onChange={(e) => setFormResiduo({ ...formResiduo, cantidad_kg: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Empresa Operadora EO-RS</label>
                      <input
                        type="text"
                        required
                        className="ssoma-input"
                        value={formResiduo.empresa_operadora_eors}
                        onChange={(e) => setFormResiduo({ ...formResiduo, empresa_operadora_eors: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="ssoma-modal-footer">
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalResiduo(false)}>Cancelar</button>
                  <button type="submit" className="ssoma-btn ssoma-btn-primary">Guardar Pesaje</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Monitoreo */}
        {isModalMonitoreo && (
          <div className="ssoma-modal-overlay" onClick={() => setIsModalMonitoreo(false)}>
            <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ssoma-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registrar Muestra Ambiental</h3>
                <button onClick={() => setIsModalMonitoreo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleSaveMonitoreo}>
                <div className="ssoma-modal-body">
                  <div className="ssoma-form-grid">
                    <div className="ssoma-form-group full">
                      <label className="ssoma-label">Parámetro</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ruido Ambiental, PM10, CO..."
                        className="ssoma-input"
                        value={formMonitoreo.parametro}
                        onChange={(e) => setFormMonitoreo({ ...formMonitoreo, parametro: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Valor Medido</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="ssoma-input"
                        value={formMonitoreo.valor_medido}
                        onChange={(e) => setFormMonitoreo({ ...formMonitoreo, valor_medido: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Límite Máximo Permisible</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="ssoma-input"
                        value={formMonitoreo.limite_permisible}
                        onChange={(e) => setFormMonitoreo({ ...formMonitoreo, limite_permisible: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Unidad de Medida</label>
                      <input
                        type="text"
                        required
                        className="ssoma-input"
                        placeholder="dBA, µg/m3, PPM, pH"
                        value={formMonitoreo.unidad}
                        onChange={(e) => setFormMonitoreo({ ...formMonitoreo, unidad: e.target.value })}
                      />
                    </div>
                    <div className="ssoma-form-group">
                      <label className="ssoma-label">Punto de Muestreo / Estación</label>
                      <input
                        type="text"
                        required
                        className="ssoma-input"
                        placeholder="Ej. Nave A - Prensas"
                        value={formMonitoreo.punto_muestreo}
                        onChange={(e) => setFormMonitoreo({ ...formMonitoreo, punto_muestreo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="ssoma-modal-footer">
                  <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={() => setIsModalMonitoreo(false)}>Cancelar</button>
                  <button type="submit" className="ssoma-btn ssoma-btn-primary">Guardar Medición</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
