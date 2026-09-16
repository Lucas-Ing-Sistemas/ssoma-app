import React from 'react';

export default function DonutChart({ items, centerLabel = "SSOMA", centerSub = "Status" }) {
  const data = items || [
    { label: 'Active', value: 48, color: '#4F46E5' },
    { label: 'Complete', value: 35, color: '#10B981' },
    { label: 'On Hold', value: 17, color: '#F59E0B' }
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="ssoma-donut-card">
      <div className="ssoma-donut-title">Sale Status / Nivel de Riesgo</div>
      
      <div className="ssoma-donut-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = - (accumulatedPercent / total) * circumference;
            accumulatedPercent += item.value;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: 'all 0.5s ease'
                }}
              />
            );
          })}
        </svg>

        <div className="ssoma-donut-center-text">
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            94%
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Cumplimiento
          </div>
        </div>
      </div>

      <div className="ssoma-donut-legend">
        {data.map((item, index) => (
          <div key={index} className="ssoma-legend-item">
            <span className="ssoma-legend-dot" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
