import React, { useState, useEffect } from 'react';
import { getTable, getIndicatorPerformance } from '../MockData';
import { useToast } from '../components/ToastProvider';
import SearchableSelect from '../components/SearchableSelect';

export default function ReportsScreen({ user }) {
  const [reportType, setReportType] = useState('performance');
  const [scopeType, setScopeType] = useState('framework');
  const [selectedFramework, setSelectedFramework] = useState('FW-001');
  const [selectedProject, setSelectedProject] = useState('PRJ-001');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('2024/25');
  const [format, setFormat] = useState('csv');

  const [frameworks, setFrameworks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectNodes, setProjectNodes] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const { addToast } = useToast();
  
  useEffect(() => {
    setFrameworks(getTable('frameworks'));
    setProjects(getTable('projects'));
    setProjectNodes(getTable('project_nodes'));
    setIndicators(getTable('indicators'));
  }, []);

  // Update preview table data based on configuration
  useEffect(() => {
    let activeIndicators = indicators;

    if (scopeType === 'framework') {
      const fwNodes = getTable('nodes').filter(n => n.framework_id === selectedFramework).map(n => n.node_id);
      activeIndicators = indicators.filter(i => i.associated_node_id && fwNodes.includes(i.associated_node_id));
    } else {
      const prjNodes = projectNodes.filter(n => n.project_id === selectedProject).map(n => n.node_id);
      activeIndicators = indicators.filter(i => i.associated_project_node_id && prjNodes.includes(i.associated_project_node_id));
    }

    const data = activeIndicators.map(ind => {
      const perf = getIndicatorPerformance(ind.indicator_id, selectedPeriod);
      // Filter regional entries if a specific region is requested
      let actual = perf.national_actual;
      let target = perf.national_target;
      let status = perf.status;

      if (selectedRegion !== 'All') {
        const entry = perf.regional_entries.find(e => e.region.toLowerCase() === selectedRegion.toLowerCase());
        actual = entry ? entry.actual_value : null;
        target = entry ? entry.target_value : target;
        
        // Recalculate status for region
        if (actual !== null) {
          const isLowerBetter = ind.indicator_id === 'IND-002';
          if (isLowerBetter) {
            status = actual <= target ? 'On Track' : (actual <= target * 1.1 ? 'At Risk' : 'Below Target');
          } else {
            const attainment = (actual / target) * 100;
            status = attainment >= 100 ? 'On Track' : (attainment >= 90 ? 'At Risk' : 'Below Target');
          }
        } else {
          status = 'No Data';
        }
      }

      return {
        id: ind.indicator_id,
        name: ind.name,
        type: ind.type,
        actual: actual,
        target: target,
        status: status
      };
    });

    setPreviewData(data);
  }, [scopeType, selectedFramework, selectedProject, selectedRegion, selectedPeriod, indicators, projectNodes]);

  const handleExport = () => {
    if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Indicator ID,Indicator Name,Type,Reporting Period,Region,Actual Value,Target Value,Attainment Status\n';
      
      previewData.forEach(row => {
        const nameEscaped = `"${row.name.replace(/"/g, '""')}"`;
        csvContent += `${row.id},${nameEscaped},${row.type},${selectedPeriod},${selectedRegion},${row.actual ?? 'N/A'},${row.target},${row.status}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `moest_me_report_${selectedPeriod.replace('/', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      addToast({ message: `Report compilation started. Format: ${format.toUpperCase()}`, type: 'info' });
      // PDF or DOCX mock exports - simulate with toast
    }
  };

  const getStatusTextStyles = (status) => {
    switch (status) {
      case 'On Track': return { color: 'var(--success)', fontWeight: 'bold' };
      case 'At Risk': return { color: 'var(--accent)', fontWeight: 'bold' };
      case 'Below Target': return { color: 'var(--error)', fontWeight: 'bold' };
      default: return { color: 'var(--neutral-600)' };
    }
  };

  return (
    <div className="grid-70-30" style={{ direction: 'rtl' /* Just swap visually to put config on left in standard rendering. Or keep normal. Standard CSS grid order solves this: */ }}>
      
      {/* Right panel: Print Preview */}
      <div className="card" style={{ order: 1, direction: 'ltr', background: '#FFFFFF', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Letterhead */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--secondary)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" fill="#14b8a6" />
              <path d="M50 15 L80 35 V65 L50 85 L20 65 V35 Z" fill="#1e3a5f" stroke="#F0A500" strokeWidth="4" />
            </svg>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>THE UNITED REPUBLIC OF TANZANIA</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-900)' }}>MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--neutral-600)' }}>National M&E Sector Registry</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--neutral-600)' }}>
            <div>Document: Standard M&E Report</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Operator: {user?.name}</div>
          </div>
        </div>

        {/* Report Cover / Metadata */}
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            {reportType === 'performance' ? 'Performance Summary Report' : 'Raw Data Ledger Extract'}
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500 }}>
            Reporting Scope: {selectedRegion === 'All' ? 'National (All Regions)' : `${selectedRegion} Region`} | Period: {selectedPeriod}
          </div>
          <div style={{ width: '40px', height: '3px', background: 'var(--primary)', margin: '12px auto' }}></div>
        </div>

        {/* Dynamic Table Preview */}
        <div className="table-container" style={{ flexGrow: 1, boxShadow: 'none', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)' }}>
          <table className="custom-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-100)' }}>
                <th>Code</th>
                <th>Indicator Name</th>
                <th>Type</th>
                <th>Target</th>
                <th>Actual Value</th>
                <th>Attainment Status</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700 }}>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.type}</td>
                  <td>{row.target}</td>
                  <td style={{ fontWeight: 700 }}>{row.actual !== null ? row.actual : 'N/A'}</td>
                  <td style={getStatusTextStyles(row.status)}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnotes / Verification */}
        <div style={{ borderTop: '1px solid var(--neutral-200)', marginTop: '32px', paddingTop: '16px', fontSize: '0.7rem', color: 'var(--neutral-600)' }}>
          <div><strong>Verification Note:</strong> Calculations aggregated dynamically via MoEST results-based performance engines. Disaggregated figures validated by regional coordinators.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontStyle: 'italic' }}>
            <span>Digital Signature: e-GA/APPROVED/SEC-KEY-{selectedFramework}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>

      </div>

      {/* Left panel: Config Panel */}
      <div className="card" style={{ order: 0, direction: 'ltr', position: 'relative', zIndex: 100 }}>
        <h3>Report Configurator</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '20px' }}>
          Configure document parameters, filter dimensions, and target outputs.
        </p>

        <div className="form-group">
          <label className="form-label">Report Type</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="reportType" checked={reportType === 'performance'} onChange={() => setReportType('performance')} />
              Performance Summary Report
            </label>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="reportType" checked={reportType === 'extract'} onChange={() => setReportType('extract')} />
              Raw Data Ledger Extract
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Report Scope</label>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="scopeType" checked={scopeType === 'framework'} onChange={() => setScopeType('framework')} />
              Strategic Framework
            </label>
            <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="scopeType" checked={scopeType === 'project'} onChange={() => setScopeType('project')} />
              Strategic Project
            </label>
          </div>

          {scopeType === 'framework' ? (
            <SearchableSelect
              options={frameworks.map(f => ({ value: f.framework_id, label: f.name }))}
              value={selectedFramework}
              onChange={setSelectedFramework}
            />
          ) : (
            <SearchableSelect
              options={projects.map(p => ({ value: p.project_id, label: p.name }))}
              value={selectedProject}
              onChange={setSelectedProject}
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Geographic Region</label>
          <SearchableSelect
            options={[
              { value: "All", label: "All Regions (National)" },
              { value: "Dar es Salaam", label: "Dar es Salaam" },
              { value: "Dodoma", label: "Dodoma" },
              { value: "Mwanza", label: "Mwanza" },
              { value: "Arusha", label: "Arusha" },
              { value: "Mbeya", label: "Mbeya" }
            ]}
            value={selectedRegion}
            onChange={setSelectedRegion}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reporting Period</label>
          <SearchableSelect
            options={[
              { value: "2024/25", label: "FY 2024/25 (1 Jul 2024 - 30 Jun 2025)" },
              { value: "2025/26", label: "FY 2025/26 (1 Jul 2025 - 30 Jun 2026)" }
            ]}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>

        <div className="form-group">
          <label className="form-label">File Export Format</label>
          <SearchableSelect
            options={[
              { value: "csv", label: "CSV (Spreadsheet Data)" },
              { value: "pdf", label: "PDF (Printable Report)" },
              { value: "docx", label: "Word Document (.docx)" }
            ]}
            value={format}
            onChange={setFormat}
          />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={handleExport}>
          📥 Compile and Download
        </button>
      </div>

    </div>
  );
}
