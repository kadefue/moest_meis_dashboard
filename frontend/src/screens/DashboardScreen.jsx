import React, { useState, useEffect } from 'react';
import { getIndicatorPerformance, getTable } from '../MockData';
import MetricCard from '../components/MetricCard';
import TanzaniaMap from '../components/TanzaniaMap';
import IndicatorChart from '../components/IndicatorChart';
import SearchableSelect from '../components/SearchableSelect';

export default function DashboardScreen({ onSelectIndicator, navigateToView }) {
  const [activeTab, setActiveTab] = useState('framework'); // framework, indicator, activity, geography, stakeholder
  
  const [selectedFramework, setSelectedFramework] = useState('FW-001');
  const [selectedPeriod, setSelectedPeriod] = useState('2024/25');
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  const [performances, setPerformances] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectNodes, setProjectNodes] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Tree state for Framework-based view
  const [expandedNodes, setExpandedNodes] = useState({ 'root': true, 'N-101': true, 'N-102': true, 'esdp': true, 'sdg': true });

  useEffect(() => {
    // Fetch data
    const fws = getTable('frameworks');
    setFrameworks(fws);

    const prjs = getTable('projects');
    setProjects(prjs);
    setProjectNodes(getTable('project_nodes'));
    setIndicators(getTable('indicators'));

    const acts = getTable('activities');
    setActivities(acts);

    const indIds = ['IND-001', 'IND-002', 'IND-003', 'IND-004'];
    const perfs = indIds.map(id => getIndicatorPerformance(id, selectedPeriod));
    setPerformances(perfs);

    const recentLogs = getTable('audit_logs').slice(0, 5);
    setLogs(recentLogs);
  }, [selectedPeriod]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const activePerformanceForMap = performances[0] || null; // Using IND-001 for region coloring overview

  // Get all stakeholder entries for rendering
  const getStakeholderEntries = () => {
    return getTable('actual_data').filter(d => d.source_category === 'Stakeholder_Contribution');
  };

  const stakeholderEntries = getStakeholderEntries();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Configuration Header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', padding: '16px 24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Reporting period</label>
            <SearchableSelect
              options={[
                { value: "2024/25", label: "FY 2024/25" },
                { value: "2025/26", label: "FY 2025/26" }
              ]}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ minWidth: '150px' }}
            />
          </div>
        </div>

        {/* 5-Perspectives Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--neutral-100)', padding: '4px', borderRadius: 'var(--radius-sm)', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { id: 'framework', label: '🏛️ Framework View' },
            { id: 'indicator', label: '📊 Indicator View' },
            { id: 'activity', label: '💼 Activity Registry' },
            { id: 'geography', label: '📍 Geographic View' },
            { id: 'stakeholder', label: '🤝 Stakeholder View' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--white)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--neutral-700)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE PERSPECTIVE */}

      {/* 1. FRAMEWORK-BASED VIEW (Hierarchical outcomes results chain) */}
      {activeTab === 'framework' && (
        <div className="grid-70-30">
          <div className="card">
            <h3>Framework-Based Results Chain</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '20px' }}>
              MSDD outcome hierarchy tree linking strategic planning nodes down to mapped operations and KPIs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* ESDP Tree */}
              <div style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div 
                  onClick={() => toggleNode('esdp')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: 'var(--secondary)', fontSize: '1rem' }}
                >
                  <span>{expandedNodes['esdp'] ? '▼' : '►'}</span>
                  <span>Education Sector Development Plan (ESDP III)</span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>FW-001</span>
                </div>

                {expandedNodes['esdp'] && (
                  <div style={{ paddingLeft: '24px', marginTop: '12px', borderLeft: '2px dashed var(--neutral-200)' }}>
                    
                    {/* Primary Ed node */}
                    <div style={{ marginBottom: '12px' }}>
                      <div onClick={() => toggleNode('N-101')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9rem' }}>
                        <span>{expandedNodes['N-101'] ? '▼' : '►'}</span>
                        <span>Primary Education (Sub-sector)</span>
                      </div>
                      
                      {expandedNodes['N-101'] && (
                        <div style={{ paddingLeft: '20px', marginTop: '8px', borderLeft: '1px dotted var(--neutral-600)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Focus Area: Access & Equity</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Mapped Project: <strong>ACT-001 Construction of classrooms</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginTop: '2px' }}>KPI Target: Net Enrollment Rate (IND-001)</div>
                          </div>
                          
                          <div style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Focus Area: Quality of Primary Learning</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Mapped Project: <strong>ACT-002 Curriculum Teacher Training</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginTop: '2px' }}>KPI Target: Pupil-Teacher Ratio (IND-002)</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Secondary Ed node */}
                    <div>
                      <div onClick={() => toggleNode('N-102')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9rem' }}>
                        <span>{expandedNodes['N-102'] ? '▼' : '►'}</span>
                        <span>Secondary Education (Sub-sector)</span>
                      </div>
                      
                      {expandedNodes['N-102'] && (
                        <div style={{ paddingLeft: '20px', marginTop: '8px', borderLeft: '1px dotted var(--neutral-600)' }}>
                          <div style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Focus Area: Secondary STEM Resources</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Mapped Project: <strong>ACT-003 STEM laboratory kits distribution</strong></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginTop: '2px' }}>KPI Target: Primary Completion Rate (IND-003)</div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* SDG 4 Tree */}
              <div style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div 
                  onClick={() => toggleNode('sdg')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: 'var(--secondary)', fontSize: '1rem' }}
                >
                  <span>{expandedNodes['sdg'] ? '▼' : '►'}</span>
                  <span>Sustainable Development Goals (SDG 4)</span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>FW-002</span>
                </div>

                {expandedNodes['sdg'] && (
                  <div style={{ paddingLeft: '24px', marginTop: '12px', borderLeft: '2px dashed var(--neutral-200)' }}>
                    <div style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Target 4.1: Free, equitable & quality primary/secondary</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Mapped Project: <strong>ACT-001 Classroom construction</strong></div>
                    </div>
                    <div style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Target 4.c: Increase supply of qualified teachers</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Mapped Project: <strong>ACT-002 Teacher curriculum training</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic Projects trees */}
              {projects.map(prj => {
                const rootNodes = projectNodes.filter(n => n.project_id === prj.project_id && n.parent_node_id === null);
                return (
                  <div key={prj.project_id} style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '16px' }}>
                    <div 
                      onClick={() => toggleNode(prj.project_id)} 
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}
                    >
                      <span>{expandedNodes[prj.project_id] ? '▼' : '►'}</span>
                      <span>Project: {prj.name}</span>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>{prj.project_id}</span>
                    </div>

                    {expandedNodes[prj.project_id] && (
                      <div style={{ paddingLeft: '24px', marginTop: '12px', borderLeft: '2px dashed var(--neutral-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {rootNodes.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontStyle: 'italic' }}>No project nodes defined.</div>
                        ) : (
                          rootNodes.map(rn => {
                            const subNodes = projectNodes.filter(n => n.parent_node_id === rn.node_id);
                            const linkedIndicators = indicators.filter(ind => ind.associated_project_node_id === rn.node_id);
                            return (
                              <div key={rn.node_id} style={{ marginBottom: '12px' }}>
                                <div onClick={() => toggleNode(rn.node_id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9rem' }}>
                                  <span>{subNodes.length > 0 ? (expandedNodes[rn.node_id] ? '▼' : '►') : '•'}</span>
                                  <span>{rn.name} ({rn.level_type})</span>
                                </div>

                                {linkedIndicators.map(ind => (
                                  <div key={ind.indicator_id} style={{ marginLeft: '16px', marginTop: '6px', background: 'var(--neutral-50)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>🔗 Linked KPI: {ind.indicator_id}</span>
                                    <div style={{ fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>{ind.name}</div>
                                  </div>
                                ))}

                                {expandedNodes[rn.node_id] && subNodes.length > 0 && (
                                  <div style={{ paddingLeft: '20px', marginTop: '8px', borderLeft: '1px dotted var(--neutral-600)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {subNodes.map(sn => {
                                      const subLinkedIndicators = indicators.filter(ind => ind.associated_project_node_id === sn.node_id);
                                      return (
                                        <div key={sn.node_id} style={{ background: 'var(--neutral-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)' }}>
                                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>{sn.level_type}: {sn.name}</div>
                                          {subLinkedIndicators.map(ind => (
                                            <div key={ind.indicator_id} style={{ marginTop: '4px', fontSize: '0.8rem', borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
                                              <strong>KPI: {ind.indicator_id}</strong> - {ind.name}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <h3>Outcomes Alignment</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', marginTop: '8px' }}>
                By mapping projects using generic self-referencing tree nodes, the system handles multiple planning overlays simultaneously without duplicate data entry.
              </p>
            </div>
            
            <div className="card">
              <h3>Directives Registry</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', marginTop: '12px' }}>
                <div style={{ borderBottom: '1px solid var(--neutral-200)', paddingBottom: '6px' }}>
                  <strong>FW-004:</strong> Presidential Dormitories Directive (2026)
                </div>
                <div style={{ borderBottom: '1px solid var(--neutral-200)', paddingBottom: '6px' }}>
                  <strong>FW-005:</strong> Minister's Budget Commitments (FY 2026/27)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INDICATOR-BASED VIEW (Standard KPIs performance cards) */}
      {activeTab === 'indicator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid-4">
            {performances.map(perf => (
              <MetricCard 
                key={perf.indicator_id} 
                performance={perf} 
                onClick={() => onSelectIndicator(perf.indicator_id)}
              />
            ))}
          </div>
          <div className="card">
            <h3>KPI Attainment Details</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>Select any card above to open full disaggregated regional drills.</p>
          </div>
        </div>
      )}

      {/* 3. ACTIVITY-BASED VIEW (Master Activity Registry & 1-to-N Indicator mapping) */}
      {activeTab === 'activity' && (
        <div className="card">
          <h3>Master Activity Registry</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '20px' }}>
            All physical operations happen once in the real world. Under the MSDD, a single master activity can map to multiple concurrent indicators.
          </p>

          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Activity / Project Name</th>
                  <th>Owner Unit</th>
                  <th>Budget (TZS)</th>
                  <th>Linked KPIs (1-to-Many Mappings)</th>
                  <th>Term Schedules</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(act => {
                  // Find indicators mapped to this activity
                  const mappedInds = performances.filter(p => p.indicator_id === 'IND-001' && act.activity_id === 'ACT-001' || p.indicator_id === 'IND-002' && act.activity_id === 'ACT-002' || p.indicator_id === 'IND-003' && act.activity_id === 'ACT-003' || p.indicator_id === 'IND-004' && act.activity_id === 'ACT-004');
                  
                  return (
                    <tr key={act.activity_id}>
                      <td style={{ fontWeight: 700 }}>{act.activity_id}</td>
                      <td style={{ fontWeight: 600 }}>{act.name}</td>
                      <td>{act.owner_unit}</td>
                      <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{act.budget.toLocaleString()} TZS</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {act.activity_id === 'ACT-001' && (
                            <>
                              <span className="badge badge-info">IND-001 (NER)</span>
                              <span className="badge badge-warning">SDG-4.1</span>
                            </>
                          )}
                          {act.activity_id === 'ACT-002' && (
                            <>
                              <span className="badge badge-info">IND-002 (PTR)</span>
                              <span className="badge badge-success">SDG-4.c</span>
                            </>
                          )}
                          {act.activity_id === 'ACT-003' && <span className="badge badge-info">IND-003 (Completion)</span>}
                          {act.activity_id === 'ACT-004' && <span className="badge badge-info">IND-004 (Inspections)</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                        {act.start_date} to {act.end_date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GEOGRAPHY-BASED VIEW (Interactive Map & regional metrics) */}
      {activeTab === 'geography' && (
        <div className="grid-70-30">
          <div className="card">
            <h3>Geospatial Performance Map</h3>
            <TanzaniaMap 
              selectedRegion={selectedRegion} 
              setSelectedRegion={setSelectedRegion} 
              indicatorPerformance={activePerformanceForMap}
            />
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>Regional Drill-Down</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
              Click on any region on the map to filter.
            </p>
            {selectedRegion ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>📍 Selected Region</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{selectedRegion}</div>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <div>Primary Enrollment (NER): <strong>95.8%</strong></div>
                  <div>Pupil-Teacher Ratio (PTR): <strong>43 pupils/teacher</strong></div>
                  <div>Schools Inspected: <strong>70%</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--neutral-600)', border: '1px dashed var(--neutral-200)', borderRadius: 'var(--radius-sm)' }}>
                ℹ️ Hover or click map regions to load local parameters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. STAKEHOLDER CONTRIBUTION VIEW (NGO submissions isolated) */}
      {activeTab === 'stakeholder' && (
        <div className="grid-70-30">
          <div className="card">
            <h3>Stakeholder Contributions Ledger</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '20px' }}>
              MSDD Stage 4 rule: NGO and private submissions are isolated from general official datasets to prevent double-counting.
            </p>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Submitter</th>
                    <th>KPI Indicator</th>
                    <th>Subdivision scope</th>
                    <th>Addressed value</th>
                    <th>Date logged</th>
                    <th>Workflow Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stakeholderEntries.map(entry => (
                    <tr key={entry.data_id}>
                      <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{entry.submitted_by}</td>
                      <td><span className="badge badge-info">{entry.indicator_id}</span></td>
                      <td>{entry.region} Region, {entry.district || '—'}</td>
                      <td style={{ fontWeight: 700 }}>+ {entry.actual_value}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>{new Date(entry.date_submitted).toLocaleDateString()}</td>
                      <td><span className="badge badge-success">{entry.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--accent)', background: 'var(--white)' }}>
              <h3>Dual-Track Pipeline Summary</h3>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>NGO Total Additions</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    + 5.50 %
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>Unique Submitting NGOs</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                    3 Partners
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>Double-Counting Safety</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-600)' }}>
                NGO metrics are stored under a separate `source_category` to ensure official MoEST planning reports only evaluate verified government-funded datasets, while preserving visibility of stakeholder aid.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log / Recent Events at bottom */}
      <div className="card">
        <h3>Recent M&E Activity Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {logs.map(log => (
            <div key={log.log_id} style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '8px', alignItems: 'center' }}>
              <span className="badge badge-info" style={{ borderRadius: '4px', fontSize: '0.65rem' }}>{log.action}</span>
              <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{log.username}</span>
              <span style={{ color: 'var(--neutral-700)' }}>{log.details}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--neutral-600)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
