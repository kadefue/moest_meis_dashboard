import React, { useState } from 'react';

export default function IndicatorChart({ type = 'line', performance, dataPoints }) {
  const [activePoint, setActivePoint] = useState(null);

  if (type === 'gauge') {
    const pct = Math.min(100, performance?.attainment_percentage || 0);
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const strokeDashoffset = circ - (pct / 100) * circ;

    const getGaugeColor = () => {
      if (performance?.status === 'On Track') return '#2e7d32'; // green
      if (performance?.status === 'At Risk') return '#f59e0b'; // orange
      return '#ef4444'; // red
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '16px' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={getGaugeColor()}
              strokeWidth="8"
              strokeDasharray={circ}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700
          }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--neutral-900)' }}>{pct}%</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--neutral-600)', textTransform: 'uppercase' }}>Target Met</span>
          </div>
        </div>
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--neutral-700)' }}>
          <div>Baseline: <strong>{performance?.baseline_value}</strong></div>
          <div>Actual: <strong style={{ color: getGaugeColor() }}>{performance?.national_actual ?? 'N/A'}</strong> / Target: <strong>{performance?.national_target}</strong></div>
        </div>
      </div>
    );
  }

  // Default: Line Chart
  // Standard data series: Target vs Actual over 6 financial years
  const defaultYears = ['2020/21', '2021/22', '2022/23', '2023/24', '2024/25', '2025/26 (Proj)'];
  
  const getLineData = () => {
    const indicatorId = performance?.indicator_id;
    if (indicatorId === 'IND-001') {
      return {
        actuals: [90.5, 91.2, 92.8, 94.2, performance.national_actual || 95.8, 96.2],
        targets: [92.0, 93.0, 94.0, 95.0, 96.5, 97.0]
      };
    }
    if (indicatorId === 'IND-002') {
      return {
        actuals: [52.1, 50.4, 48.0, 46.2, performance.national_actual || 44.7, 42.0],
        targets: [50.0, 48.0, 46.0, 44.0, 42.0, 41.0]
      };
    }
    if (indicatorId === 'IND-003') {
      return {
        actuals: [78.2, 79.5, 81.1, 82.5, performance.national_actual || 83.9, 86.0],
        targets: [80.0, 81.0, 82.0, 83.0, 84.0, 85.0]
      };
    }
    return {
      actuals: [55.0, 58.0, 60.0, 62.0, performance?.national_actual || 64.0, 68.0],
      targets: [60.0, 62.0, 64.0, 66.0, 70.0, 72.0]
    };
  };

  const { actuals, targets } = getLineData();
  const maxVal = Math.max(...actuals, ...targets, 10) * 1.1;
  const minVal = Math.min(...actuals, ...targets, 0) * 0.9;
  const valRange = maxVal - minVal;

  // Grid coordinates mapping
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const getCoords = (index, value) => {
    const x = paddingX + (index / (defaultYears.length - 1)) * graphWidth;
    const y = paddingY + graphHeight - ((value - minVal) / valRange) * graphHeight;
    return { x, y };
  };

  // Generate paths
  const actualPoints = actuals.map((val, idx) => getCoords(idx, val));
  const targetPoints = targets.map((val, idx) => getCoords(idx, val));

  const actualPath = actualPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const targetPath = targetPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area path for actuals gradient
  const areaPath = actualPoints.length > 0 
    ? `${actualPath} L ${actualPoints[actualPoints.length - 1].x} ${height - paddingY} L ${actualPoints[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '3px', background: 'var(--primary)', display: 'inline-block' }}></span> Actual Performance
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '3px', strokeDasharray: '3,3', borderTop: '2px dashed var(--secondary)', display: 'inline-block' }}></span> Target
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = paddingY + graphHeight * r;
          const val = maxVal - (r * valRange);
          return (
            <g key={i}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" fontSize="7" fill="var(--neutral-600)">{val.toFixed(0)}</text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {defaultYears.map((year, idx) => {
          const x = paddingX + (idx / (defaultYears.length - 1)) * graphWidth;
          return (
            <text key={idx} x={x} y={height - 8} textAnchor="middle" fontSize="7" fill="var(--neutral-600)">{year}</text>
          );
        })}

        {/* Area fill for actual values */}
        {areaPath && <path d={areaPath} fill="url(#actualGradient)" />}

        {/* Target Line (Dashed) */}
        <path d={targetPath} fill="none" stroke="var(--secondary)" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Actual Line (Solid) */}
        <path d={actualPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />

        {/* Data points for Actuals */}
        {actualPoints.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--white)"
            stroke="var(--primary)"
            strokeWidth="2"
            style={{ cursor: 'pointer', transition: 'r 0.1s' }}
            onMouseEnter={() => setActivePoint({ index: idx, x: p.x, y: p.y, value: actuals[idx], target: targets[idx], period: defaultYears[idx] })}
            onMouseLeave={() => setActivePoint(null)}
          />
        ))}
      </svg>

      {/* Floating details tooltip */}
      {activePoint && (
        <div style={{
          position: 'absolute',
          top: `${activePoint.y - 50}px`,
          left: `${activePoint.x - 30}px`,
          transform: 'translateX(-20%)',
          background: 'rgba(30, 58, 95, 0.95)',
          color: '#ffffff',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.7rem',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'none',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px', marginBottom: '2px' }}>{activePoint.period}</div>
          <div>Actual: <strong style={{ color: '#4ade80' }}>{activePoint.value}</strong></div>
          <div>Target: <strong>{activePoint.target}</strong></div>
        </div>
      )}
    </div>
  );
}
