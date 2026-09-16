import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function IncidentModal({ isOpen, onClose, onSave, areas, workers }) {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'Condición Insegura',
    severidad: 'Leve',
    lugar: '',
    area_id: '',
    reportado_por_id: '',
    dias_perdidos: '0',
    descripcion: '',
    causa_raiz: '',
    accion_correctiva: '',
    costo_estimado: '150'
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert('Error al guardar el incidente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssoma-modal-overlay" onClick={onClose}>
      <div className="ssoma-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ssoma-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Registrar Nuevo Evento SSOMA
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Incidente, Accidente o Alerta Ambiental
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ssoma-modal-body">
            <div className="ssoma-form-grid">
              <div className="ssoma-form-group full">
                <label className="ssoma-label">Título del Hallazgo o Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fuga menor de aceite en bahía de carga..."
                  className="ssoma-input"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Tipo de Evento</label>
                <select
                  className="ssoma-select"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="Accidente con Tiempo Perdido">Accidente con Tiempo Perdido</option>
                  <option value="Accidente Sin Tiempo Perdido">Accidente Sin Tiempo Perdido</option>
                  <option value="Cuasi-Accidente">Cuasi-Accidente</option>
                  <option value="Condición Insegura">Condición Insegura</option>
                  <option value="Acto Subestándar">Acto Subestándar</option>
                  <option value="Emergencia Ambiental">Emergencia Ambiental</option>
                </select>
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Severidad del Riesgo</label>
                <select
                  className="ssoma-select"
                  value={formData.severidad}
                  onChange={(e) => setFormData({ ...formData, severidad: e.target.value })}
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Ubicación / Lugar Exacto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nave Industrial A, Taller Mecánico..."
                  className="ssoma-input"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                />
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Área Afectada</label>
                <select
                  className="ssoma-select"
                  value={formData.area_id}
                  onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                >
                  <option value="">Seleccione Área...</option>
                  {areas && areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Reportado Por</label>
                <select
                  className="ssoma-select"
                  value={formData.reportado_por_id}
                  onChange={(e) => setFormData({ ...formData, reportado_por_id: e.target.value })}
                >
                  <option value="">Seleccione Responsable...</option>
                  {workers && workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.nombres} {w.apellidos} ({w.cargo})</option>
                  ))}
                </select>
              </div>

              <div className="ssoma-form-group">
                <label className="ssoma-label">Costo / Pérdida Estimada ($)</label>
                <input
                  type="number"
                  className="ssoma-input"
                  value={formData.costo_estimado}
                  onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value })}
                />
              </div>

              <div className="ssoma-form-group full">
                <label className="ssoma-label">Descripción Detallada del Suceso</label>
                <textarea
                  rows="3"
                  className="ssoma-textarea"
                  placeholder="Explique las circunstancias en que ocurrió..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                ></textarea>
              </div>

              <div className="ssoma-form-group full">
                <label className="ssoma-label">Acción Correctiva Inmediata</label>
                <textarea
                  rows="2"
                  className="ssoma-textarea"
                  placeholder="Medidas adoptadas de forma preventiva o correctiva..."
                  value={formData.accion_correctiva}
                  onChange={(e) => setFormData({ ...formData, accion_correctiva: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="ssoma-modal-footer">
            <button type="button" className="ssoma-btn ssoma-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="ssoma-btn ssoma-btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
