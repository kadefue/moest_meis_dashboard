import React, { useState, useEffect } from 'react';
import { getTable, saveTable, getIndicatorPerformance, logAction } from '../MockData';
import IndicatorChart from '../components/IndicatorChart';
import SearchableSelect from '../components/SearchableSelect';

export default function IndicatorScreen({ initialIndicatorId, user }) {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(initialIndicatorId || 'IND-001');
  const [selectedPeriod, setSelectedPeriod] = useState('2024/25');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const [indicators, setIndicators] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [commentary, setCommentary] = useState('');
  const [savedCommentary, setSavedCommentary] = useState('');
  
  // Load initial settings
  useEffect(() => {
    setIndicators(getTable('indicators'));
  }, []);

  // Update performance details when filters shift
  useEffect(() => {
    if (selectedIndicatorId) {
      const perf = getIndicatorPerformance(selectedIndicatorId, selectedPeriod);
      setPerformance(perf);

      // Load existing commentary from indicator record
      const key = `me_notes_${selectedIndicatorId}_${selectedPeriod}`;
      const savedNote = localStorage.getItem(key) || '';
      setCommentary(savedNote);
      setSavedCommentary(savedNote);
    }
  }, [selectedIndicatorId, selectedPeriod]);

  const handleSaveCommentary = () => {
    const key = `me_notes_${selectedIndicatorId}_${selectedPeriod}`;
    localStorage.setItem(key, commentary);
    setSavedCommentary(commentary);
    logAction(user.username, 'UPDATE', 'Commentary', `Added narrative commentary to ${selectedIndicatorId} for period ${selectedPeriod}`);
    alert('Narrative commentary saved successfully!');
  };

  // Filter indicator list by domain
  const getFilteredIndicators = () => {
    if (selectedDomain === 'All') return indicators;
    // Mock domains based on IDs
    if (selectedDomain === 'Access') return indicators.filter(i => i.indicator_id === 'IND-001' || i.indicator_id === 'IND-003');
    if (selectedDomain === 'Quality') return indicators.filter(i => i.indicator_id === 'IND-002' || i.indicator_id === 'IND-004');
    return indicators;
  };

  const filteredIndicators = getFilteredIndicators();

  // Cascade list of regions from actual entries
  const availableRegions = performance?.regional_entries 
    ? ['All', ...new Set(performance.regional_entries.map(e => e.region))]
    : ['All'];

  // Cascade list of districts based on selected region
  const availableDistricts = performance?.regional_entries
    ? ['All', ...new Set(
        performance.regional_entries
          .filter(e => selectedRegion === 'All' || e.region === selectedRegion)
          .map(e => e.district)
          .filter(Boolean)
      )]
    : ['All'];

  // Table row filter execution
  const getTableRows = () => {
    if (!performance?.regional_entries) return [];
    return performance.regional_entries.filter(e => {
      const regionMatch = selectedRegion === 'All' || e.region.toLowerCase() === selectedRegion.toLowerCase();
      const districtMatch = selectedDistrict === 'All' || (e.district && e.district.toLowerCase() === selectedDistrict.toLowerCase());
      return regionMatch && districtMatch;
    });
  };

  const tableRows = getTableRows();

  const getRowStyle = (entry) => {
    // Red / Amber / Green row levels
    const target = entry.target_value;
    const actual = entry.actual_value;
    const isLowerBetter = selectedIndicatorId === 'IND-002';
    
    if (isLowerBetter) {
      if (actual <= target) return { borderLeft: '4px solid var(--success)', backgroundColor: 'rgba(46,125,50,0.02)' };
      if (actual <= target * 1.1) return { borderLeft: '4px solid var(--accent)', backgroundColor: 'rgba(240,165,0,0.02)' };
      return { borderLeft: '4px solid var(--error)', backgroundColor: 'rgba(198,40,40,0.02)' };
    } else {
      const attainment = target > 0 ? (actual / target) * 100 : 0;
      if (attainment >= 100) return { borderLeft: '4px solid var(--success)', backgroundColor: 'rgba(46,125,50,0.02)' };
      if (attainment >= 90) return { borderLeft: '4px solid var(--accent)', backgroundColor: 'rgba(240,165,0,0.02)' };
      return { borderLeft: '4px solid var(--error)', backgroundColor: 'rgba(198,40,40,0.02)' };
    }
  };

  const meta = getTable('metadata').find(m => m.indicator_id === selectedIndicatorId) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cascade Filters card */}
      <div className="card">
        <h3>Filter & Drill-Down Control</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '12px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Domain</label>
            <SearchableSelect
              options={[
                { value: "All", label: "All Domains" },
                { value: "Access", label: "Access & Completion" },
                { value: "Quality", label: "Quality & Inspection" }
              ]}
              value={selectedDomain}
              onChange={val => { setSelectedDomain(val); setSelectedRegion('All'); setSelectedDistrict('All'); }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Specific KPI Indicator</label>
            <SearchableSelect
              options={filteredIndicators.map(ind => ({ value: ind.indicator_id, label: `${ind.indicator_id}: ${ind.name}` }))}
              value={selectedIndicatorId}
              onChange={val => { setSelectedIndicatorId(val); setSelectedRegion('All'); setSelectedDistrict('All'); }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reporting Year</label>
            <SearchableSelect
              options={[
                { value: "2024/25", label: "2024/25" },
                { value: "2025/26", label: "2025/26 (Forecast)" }
              ]}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Region scope</label>
            <SearchableSelect
              options={availableRegions.map(r => ({ value: r, label: r }))}
              value={selectedRegion}
              onChange={val => { setSelectedRegion(val); setSelectedDistrict('All'); }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">District scope</label>
            <SearchableSelect
              options={availableDistricts.map(d => ({ value: d, label: d }))}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
            />
          </div>

        </div>
      </div>

      {/* Main performance summary */}
      {performance && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '8px' }}>{performance.type} Indicator</span>
                <h2>{performance.indicator_id}: {performance.name}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--neutral-600)', flexWrap: 'wrap' }}>
                  <span>📈 Unit: <strong>{meta.unit}</strong></span>
                  <span>🔄 Frequency: <strong>{meta.frequency}</strong></span>
                  <span>🏢 Responsible Unit: <strong>{meta.responsible_unit}</strong></span>
                  <span>📂 Data Source: <strong>{meta.data_source}</strong></span>
                </div>
              </div>
              <div style={{ padding: '12px 18px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>Attainment Status</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: performance.status === 'On Track' ? 'var(--success)' : performance.status === 'At Risk' ? 'var(--accent)' : 'var(--error)' }}>
                  {performance.status === 'On Track' ? '🟢 ' : performance.status === 'At Risk' ? '🟡 ' : '🔴 '}
                  {performance.status}
                </div>
              </div>
            </div>
          </div>

          {/* Analytical Charts panel */}
          <div className="grid-70-30">
            
            <div className="card">
              <h3>Progress Curve Over Time</h3>
              <div style={{ marginTop: '24px' }}>
                <IndicatorChart type="line" performance={performance} />
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3>National Target met</h3>
              <IndicatorChart type="gauge" performance={performance} />
            </div>

          </div>

          {/* Table list and narrative split */}
          <div className="grid-70-30">
            
            {/* Table layout */}
            <div className="card">
              <h3>Disaggregated Performance Ledger</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Attainment entries submitted by District and Regional monitoring officers.
              </p>
              
              <div className="table-container" style={{ margin: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>District</th>
                      <th>Ward</th>
                      <th>Actual</th>
                      <th>Target</th>
                      <th>Deviation (%)</th>
                      <th>Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length > 0 ? (
                      tableRows.map((row, idx) => (
                        <tr key={idx} style={getRowStyle(row)}>
                          <td style={{ fontWeight: 600 }}>{row.region}</td>
                          <td>{row.district || '—'}</td>
                          <td>{row.ward || '—'}</td>
                          <td style={{ fontWeight: 700 }}>{row.actual_value}</td>
                          <td>{row.target_value}</td>
                          <td style={{ 
                            fontWeight: 600, 
                            color: row.deviation > 0 ? 'var(--success)' : row.deviation < 0 ? 'var(--error)' : 'var(--neutral-700)' 
                          }}>
                            {row.deviation > 0 ? `+${row.deviation.toFixed(1)}%` : `${row.deviation.toFixed(1)}%`}
                          </td>
                          <td>
                            <span className={`badge ${
                              row.status === 'Approved' ? 'badge-success' : row.status === 'Verified' ? 'badge-warning' : 'badge-info'
                            }`}>{row.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--neutral-600)' }}>
                          📭 No disaggregated entries matches the active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commentary panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>M&E Narrative Notes</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '12px' }}>
                Record descriptive findings, variance analysis, or recommendations.
              </p>
              <textarea
                className="form-textarea"
                style={{ flexGrow: 1, minHeight: '140px', fontSize: '0.85rem' }}
                placeholder="Log notes about performance trends, constraints, or interventions applied..."
                value={commentary}
                onChange={e => setCommentary(e.target.value)}
              />
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '12px', alignSelf: 'flex-end', fontSize: '0.85rem', padding: '8px 16px' }}
                onClick={handleSaveCommentary}
                disabled={commentary === savedCommentary}
              >
                💾 Save Observations
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
