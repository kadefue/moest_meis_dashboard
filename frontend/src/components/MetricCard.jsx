import React from 'react';

export default function MetricCard({ performance, onClick }) {
  const { indicator_id, name, type, national_actual, national_target, attainment_percentage, status } = performance;

  const getStatusClass = () => {
    switch (status) {
      case 'On Track': return 'on-track';
      case 'At Risk': return 'at-risk';
      case 'Below Target': return 'below-target';
      default: return '';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'On Track': return <span className="badge badge-success">On Track</span>;
      case 'At Risk': return <span className="badge badge-warning">At Risk</span>;
      case 'Below Target': return <span className="badge badge-error">Below Target</span>;
      default: return <span className="badge badge-info">Pending</span>;
    }
  };

  // SVG Sparkline based on indicator id
  const getSparklineData = () => {
    switch (indicator_id) {
      case 'IND-001': return 'M 5 25 L 20 22 L 40 24 L 60 18 L 80 15 L 95 10';
      case 'IND-002': return 'M 5 10 L 20 18 L 40 22 L 60 25 L 80 20 L 95 15'; // downward is good (PTR improving)
      case 'IND-003': return 'M 5 28 L 20 25 L 40 22 L 60 19 L 80 18 L 95 15';
      case 'IND-004': return 'M 5 28 L 20 24 L 40 25 L 60 20 L 80 17 L 95 14';
      default: return 'M 5 20 L 95 20';
    }
  };

  const getUnit = () => {
    if (indicator_id === 'IND-002') return ' pupils/teacher';
    return '%';
  };

  return (
    <div className={`card kpi-card ${getStatusClass()}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="kpi-header">
        <span className="kpi-title">{name}</span>
        <div className="kpi-icon-container">
          {indicator_id === 'IND-001' ? '🏫' : indicator_id === 'IND-002' ? '👨‍🏫' : indicator_id === 'IND-003' ? '🎓' : '🔍'}
        </div>
      </div>

      <div className="kpi-value">
        {national_actual !== null ? `${national_actual}${getUnit()}` : 'No Data'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>
          Target: {national_target}{getUnit()}
        </span>
        {getStatusBadge()}
      </div>

      {/* Sparkline Visualization */}
      <div style={{ height: '30px', marginTop: 'auto', borderTop: '1px solid var(--neutral-100)', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-600)' }}>Trend (6 periods)</span>
        <svg width="80" height="24" viewBox="0 0 100 30" fill="none">
          <path
            d={getSparklineData()}
            stroke={status === 'On Track' ? 'var(--success)' : status === 'At Risk' ? 'var(--accent)' : 'var(--error)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
