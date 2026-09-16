import React, { useState } from 'react';

export default function SplineAreaChart({ data, title = "Evolución Anual SSOMA & Horas Seguras", mainStat = "$59,540 / 12,450 HH" }) {
  const [selectedPeriod, setSelectedPeriod] = useState('Último Año');
  
  // Puntos mensuales para la curva suave
  const months = data || [
    { mes: 'Jan', val: 1.8, date: '15 Jan 2026', stat: '2,100 HH' },
    { mes: 'Feb', val: 3.8, date: '18 Feb 2026', stat: '3,450 HH' },
    { mes: 'Mar', val: 2.2, date: '22 Mar 2026', stat: '2,800 HH' },
    { mes: 'Apr', val: 4.1, date: '12 Apr 2026', stat: '4,100 HH' },
    { mes: 'May', val: 2.9, date: '19 May 2026', stat: '3,200 HH' },
    { mes: 'Jun', val: 3.989, date: '20 June 2026', stat: '$3,989' },
    { mes: 'Jul', val: 2.1, date: '25 Jul 2026', stat: '2,300 HH' },
    { mes: 'Aug', val: 4.6, date: '14 Aug 2026', stat: '4,600 HH' },
    { mes: 'Sep', val: 3.4, date: '08 Sep 2026', stat: '3,500 HH' },
    { mes: 'Oct', val: 5.3, date: '19 Oct 2026', stat: '5,200 HH' },
    { mes: 'Nov', val: 3.7, date: '10 Nov 2026', stat: '3,800 HH' },
    { mes: 'Dec', val: 4.9, date: '28 Dec 2026', stat: '4,900 HH' }
  ];

  const [activePoint, setActivePoint] = useState(months[5]); // Jun por defecto como en el mockup

  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingBottom = 30;
  const paddingTop = 20;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = 6.0;

  const points = months.map((m, i) => {
    const x = paddingX + (i / (months.length - 1)) * chartW;
    const y = height - paddingBottom - (m.val / maxVal) * chartH;
    return { x, y, ...m };
  });

  // Generar curva Bezier cúbica Catmull-Rom para aspecto suave
  const createSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  const activeCoord = points.find(p => p.mes === activePoint.mes) || points[5];

  return (
    <div className="ssoma-chart-card">
      <div className="ssoma-chart-header">
        <div className="ssoma-chart-title-box">
          <span className="ssoma-chart-subheading">Monitoreo y Desempeño SSOMA</span>
          <span className="ssoma-chart-main-value">{mainStat}</span>
        </div>

        <div className="ssoma-period-selector" onClick={() => setSelectedPeriod(selectedPeriod === 'Último Año' ? 'Último Mes' : 'Último Año')}>
          <span>📅 {selectedPeriod} ▾</span>
        </div>
      </div>

      <div className="ssoma-spline-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="ssoma-spline-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Líneas de cuadrícula horizontales con etiquetas Y: 6k, 4k, 2k, 0k */}
          {[6, 4, 2, 0].map((val) => {
            const y = height - paddingBottom - (val / maxVal) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {val === 0 ? '0k' : `${val}k`}
                </text>
              </g>
            );
          })}

          {/* Área sombreada bajo la curva */}
          <path d={areaPath} fill="url(#splineAreaGrad)" />

          {/* Curva suave principal color índigo/violeta */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Puntos interactivos invisibles para captar el cursor */}
          {points.map((pt) => (
            <circle
              key={pt.mes}
              cx={pt.x}
              cy={pt.y}
              r="12"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setActivePoint(pt)}
            />
          ))}

          {/* Punto activo resaltado con anillo exterior */}
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="8"
            fill="#f43f5e"
            stroke="#ffffff"
            strokeWidth="3"
            filter="url(#glow)"
          />
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="16"
            fill="none"
            stroke="rgba(244, 63, 94, 0.3)"
            strokeWidth="2"
          />

          {/* Etiquetas del eje X (meses) */}
          {points.map((pt) => (
            <text
              key={pt.mes}
              x={pt.x}
              y={height - 8}
              fill={pt.mes === activePoint.mes ? '#0f172a' : '#94a3b8'}
              fontSize="11"
              fontWeight={pt.mes === activePoint.mes ? '800' : '600'}
              textAnchor="middle"
              style={{ cursor: 'pointer' }}
              onClick={() => setActivePoint(pt)}
            >
              {pt.mes}
            </text>
          ))}
        </svg>

        {/* Tooltip flotante con diseño del mockup */}
        <div
          className="ssoma-chart-tooltip"
          style={{
            left: `${(activeCoord.x / width) * 100}%`,
            top: `${(activeCoord.y / height) * 100}%`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span>
            <span>{activePoint.stat || `$3,989`}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
            {activePoint.date || '20 June 2026'}
          </div>
        </div>
      </div>
    </div>
  );
}
