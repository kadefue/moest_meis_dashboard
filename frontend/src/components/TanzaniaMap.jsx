import React, { useState } from 'react';

export default function TanzaniaMap({ selectedRegion, setSelectedRegion, indicatorPerformance }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // We define a stylized layout of Tanzania's regions as polygons and circles
  const regions = [
    {
      id: 'mwanza',
      name: 'Mwanza',
      path: 'M 35 15 L 50 15 L 55 25 L 45 35 L 30 30 Z',
      labelX: 43,
      labelY: 23,
    },
    {
      id: 'arusha',
      name: 'Arusha',
      path: 'M 50 15 L 75 22 L 70 38 L 52 35 L 48 24 Z',
      labelX: 62,
      labelY: 26,
    },
    {
      id: 'kigoma',
      name: 'Kigoma',
      path: 'M 10 32 L 30 30 L 25 55 L 12 50 Z',
      labelX: 18,
      labelY: 42,
    },
    {
      id: 'dodoma',
      name: 'Dodoma',
      path: 'M 45 35 L 55 35 L 60 52 L 40 55 Z',
      labelX: 50,
      labelY: 45,
    },
    {
      id: 'dar_es_salaam',
      name: 'Dar es Salaam',
      path: 'M 72 48 L 84 52 L 80 62 L 68 58 Z',
      labelX: 77,
      labelY: 55,
    },
    {
      id: 'mbeya',
      name: 'Mbeya',
      path: 'M 25 55 L 40 55 L 45 78 L 28 75 Z',
      labelX: 34,
      labelY: 66,
    },
    {
      id: 'ruvuma',
      name: 'Ruvuma',
      path: 'M 45 78 L 65 80 L 60 95 L 42 92 Z',
      labelX: 52,
      labelY: 86,
    },
    {
      id: 'coastal_other',
      name: 'Lindi / Mtwara',
      path: 'M 65 60 L 80 62 L 75 88 L 60 80 Z',
      labelX: 70,
      labelY: 72,
    }
  ];

  // Helper to resolve performance for a region
  const getRegionPerformance = (regionName) => {
    if (!indicatorPerformance?.regional_entries) return { actual: null, target: null, status: 'No Data' };
    const entry = indicatorPerformance.regional_entries.find(
      e => e.region.toLowerCase() === regionName.toLowerCase()
    );
    if (!entry) return { actual: null, target: null, status: 'No Data' };

    // Threshold logic
    const isLowerBetter = indicatorPerformance.indicator_id === 'IND-002';
    const actual = entry.actual_value;
    const target = entry.target_value;
    
    let status = 'On Track';
    if (isLowerBetter) {
      if (actual <= target) status = 'On Track';
      else if (actual <= target * 1.1) status = 'At Risk';
      else status = 'Below Target';
    } else {
      const attainment = target > 0 ? (actual / target) * 100 : 0;
      if (attainment >= 100) status = 'On Track';
      else if (attainment >= 90) status = 'At Risk';
      else status = 'Below Target';
    }

    return { actual, target, status };
  };

  const getRegionColor = (status) => {
    switch (status) {
      case 'On Track': return '#2e7d32'; // Success Green
      case 'At Risk': return '#f59e0b'; // Warning Amber
      case 'Below Target': return '#ef4444'; // Error Red
      default: return '#cbd5e1'; // Neutral Slate
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--neutral-600)' }}>Geospatial Performance Map</h4>
        {selectedRegion && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
            onClick={() => setSelectedRegion(null)}
          >
            Clear Filter (Tanzania)
          </button>
        )}
      </div>

      <svg 
        viewBox="0 0 100 100" 
        width="100%" 
        height="280px" 
        style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}
      >
        {/* Background grid representation */}
        <path d="M 0 50 H 100 M 50 0 V 100" stroke="#f1f5f9" strokeWidth="0.5" />
        
        {/* Lake Victoria Stylized */}
        <ellipse cx="40" cy="5" rx="10" ry="6" fill="#bfdbfe" opacity="0.6" stroke="#93c5fd" strokeWidth="0.5" />
        
        {/* Indian Ocean Stylized */}
        <path d="M 85 0 C 85 40, 88 60, 95 100 L 100 100 L 100 0 Z" fill="#bfdbfe" opacity="0.4" />

        {/* Draw Regions */}
        {regions.map(r => {
          const perf = getRegionPerformance(r.name);
          const color = getRegionColor(perf.status);
          const isSelected = selectedRegion?.toLowerCase() === r.name.toLowerCase();

          return (
            <g key={r.id}>
              <path
                d={r.path}
                fill={color}
                fillOpacity={isSelected ? 0.9 : 0.65}
                stroke={isSelected ? '#1e3a5f' : '#ffffff'}
                strokeWidth={isSelected ? 2 : 1}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => setSelectedRegion(selectedRegion === r.name ? null : r.name)}
                onMouseEnter={() => setHoveredRegion({ name: r.name, ...perf })}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text 
                x={r.labelX} 
                y={r.labelY} 
                fill="#1e3a5f" 
                fontSize="3" 
                fontWeight="700" 
                textAnchor="middle"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {r.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredRegion && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'rgba(30, 58, 95, 0.95)',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'none',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px' }}>
            🇹🇿 {hoveredRegion.name}
          </div>
          {hoveredRegion.actual !== null ? (
            <>
              <div>Actual Value: <span style={{ fontWeight: 700, color: '#F0A500' }}>{hoveredRegion.actual}</span></div>
              <div>Target Value: <span style={{ fontWeight: 600 }}>{hoveredRegion.target}</span></div>
              <div>Status: <span style={{ 
                fontWeight: 700, 
                color: hoveredRegion.status === 'On Track' ? '#4ade80' : hoveredRegion.status === 'At Risk' ? '#fbbf24' : '#f87171' 
              }}>{hoveredRegion.status}</span></div>
            </>
          ) : (
            <div style={{ color: '#cbd5e1' }}>No reports submitted</div>
          )}
        </div>
      )}

      {/* Map Legend */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2e7d32', display: 'inline-block' }}></span> On Track (≥ Target)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b', display: 'inline-block' }}></span> At Risk (within 10%)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }}></span> Below Target (&lt; 10%)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#cbd5e1', display: 'inline-block' }}></span> No Data
        </div>
      </div>
    </div>
  );
}
