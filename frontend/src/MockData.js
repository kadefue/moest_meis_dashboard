// Mock Data Store simulating PostgreSQL tables in localStorage for the MoEST M&E Dashboard
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8181/api';

const INITIAL_FRAMEWORKS = [
  { framework_id: 'FW-001', name: 'Education Sector Development Plan (ESDP III)', start_year: 2024, end_year: 2029 },
  { framework_id: 'FW-002', name: 'Sustainable Development Goals (SDG 4)', start_year: 2015, end_year: 2030 },
  { framework_id: 'FW-003', name: 'National Development Vision 2050', start_year: 2025, end_year: 2050 }
];

const INITIAL_PROJECTS = [
  { project_id: 'PRJ-001', name: 'Higher Education Economic Transformation (HEET)', start_year: 2021, end_year: 2026 },
  { project_id: 'PRJ-002', name: 'Secondary Education Quality Improvement Project (SEQUIP)', start_year: 2020, end_year: 2025 }
];

const INITIAL_PROJECT_NODES = [
  // HEET Nodes
  { node_id: 'PN-101', project_id: 'PRJ-001', parent_node_id: null, level_type: 'Component', name: 'Infrastructure & Equipment' },
  { node_id: 'PN-102', project_id: 'PRJ-001', parent_node_id: null, level_type: 'Component', name: 'Academic Quality & Relevance' },
  { node_id: 'PN-103', project_id: 'PRJ-001', parent_node_id: 'PN-102', level_type: 'Sub-component', name: 'Curriculum Modernization' },
  // SEQUIP Nodes
  { node_id: 'PN-201', project_id: 'PRJ-002', parent_node_id: null, level_type: 'Key Result Area', name: 'Safe Secondary Schools' },
  { node_id: 'PN-202', project_id: 'PRJ-002', parent_node_id: null, level_type: 'Key Result Area', name: 'Teacher Development & Deployment' }
];

const INITIAL_NODES = [
  // ESDP III Nodes
  { node_id: 'N-101', framework_id: 'FW-001', parent_node_id: null, level_type: 'Sub-sector', name: 'Primary Education' },
  { node_id: 'N-102', framework_id: 'FW-001', parent_node_id: null, level_type: 'Sub-sector', name: 'Secondary Education' },
  { node_id: 'N-103', framework_id: 'FW-001', parent_node_id: null, level_type: 'Sub-sector', name: 'Teacher Education & Training' },
  { node_id: 'N-104', framework_id: 'FW-001', parent_node_id: 'N-101', level_type: 'Focus Area', name: 'Access & Equity in Primary' },
  { node_id: 'N-105', framework_id: 'FW-001', parent_node_id: 'N-101', level_type: 'Focus Area', name: 'Quality of Primary Learning' },
  // SDG 4 Nodes
  { node_id: 'N-201', framework_id: 'FW-002', parent_node_id: null, level_type: 'Target', name: 'Target 4.1: Free, equitable & quality primary/secondary' },
  { node_id: 'N-202', framework_id: 'FW-002', parent_node_id: null, level_type: 'Target', name: 'Target 4.c: Increase supply of qualified teachers' }
];

const INITIAL_ACTIVITIES = [
  { activity_id: 'ACT-001', name: 'Construction of classrooms in underserved councils', description: 'Build 1,200 classrooms in target primary and secondary schools across rural districts.', start_date: '2024-07-01', end_date: '2026-06-30', budget: 15000000.00, owner_unit: 'Primary Education Division' },
  { activity_id: 'ACT-002', name: 'In-service teacher training on new curriculum', description: 'Train 15,000 primary school teachers on the revised competency-based curriculum.', start_date: '2024-09-15', end_date: '2025-12-31', budget: 8500000.00, owner_unit: 'Teacher Education Division' },
  { activity_id: 'ACT-003', name: 'Distribution of STEM laboratory kits', description: 'Procure and distribute science lab kits to 600 secondary schools.', start_date: '2025-01-10', end_date: '2025-11-30', budget: 5200000.00, owner_unit: 'Secondary Education Division' },
  { activity_id: 'ACT-004', name: 'School QA Inspections and Audits', description: 'Conduct inspectoral visits to primary and secondary schools.', start_date: '2024-07-01', end_date: '2029-06-30', budget: 3000000.00, owner_unit: 'School Quality Assurance Division' }
];

const INITIAL_ACTIVITY_MAPPINGS = [
  { mapping_id: 'MAP-001', activity_id: 'ACT-001', node_id: 'N-104' },
  { mapping_id: 'MAP-002', activity_id: 'ACT-002', node_id: 'N-105' },
  { mapping_id: 'MAP-003', activity_id: 'ACT-003', node_id: 'N-102' },
  { mapping_id: 'MAP-004', activity_id: 'ACT-004', node_id: 'N-105' }
];

const INITIAL_INDICATORS = [
  { indicator_id: 'IND-001', name: 'Net Enrollment Rate (NER) - Primary', type: 'Outcome', is_derived: false, formula: null, associated_node_id: 'N-104', associated_project_node_id: 'PN-101', associated_activity_id: 'ACT-001' },
  { indicator_id: 'IND-002', name: 'Pupil-Teacher Ratio (PTR) - Primary', type: 'Output', is_derived: false, formula: null, associated_node_id: 'N-105', associated_project_node_id: 'PN-202', associated_activity_id: 'ACT-002' },
  { indicator_id: 'IND-003', name: 'Primary Education Completion Rate', type: 'Outcome', is_derived: true, formula: '{"calc": "graduates / total_final_year_enrollment * 100"}', associated_node_id: 'N-101', associated_project_node_id: null, associated_activity_id: null },
  { indicator_id: 'IND-004', name: 'Percentage of Schools Inspected Annually', type: 'Output', is_derived: false, formula: null, associated_node_id: 'N-105', associated_project_node_id: null, associated_activity_id: 'ACT-004' }
];

const INITIAL_INDICATOR_METADATA = [
  { indicator_id: 'IND-001', unit: 'Percentage (%)', frequency: 'Annually', data_source: 'ESMIS / School Registry', verification_means: 'Annual Census Report', responsible_unit: 'Primary Education Division' },
  { indicator_id: 'IND-002', unit: 'Ratio (Pupils per Teacher)', frequency: 'Quarterly', data_source: 'SAS Teacher Registry', verification_means: 'HR Personnel Records', responsible_unit: 'Teacher Education Division' },
  { indicator_id: 'IND-003', unit: 'Percentage (%)', frequency: 'Annually', data_source: 'NECTA Exam Registry', verification_means: 'NECTA Graduation Release Booklet', responsible_unit: 'Secondary Education Division' },
  { indicator_id: 'IND-004', unit: 'Percentage (%)', frequency: 'Quarterly', data_source: 'SQAS Inspection Portal', verification_means: 'SQA Inspector Reports', responsible_unit: 'School Quality Assurance Division' }
];

// Target mapping for regions
const INITIAL_TARGETS = [
  // IND-001 Targets
  { target_id: 'TGT-001', indicator_id: 'IND-001', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dar es Salaam', district: null, ward: null, baseline_year: '2023', baseline_value: 94.20, target_value: 96.50 },
  { target_id: 'TGT-002', indicator_id: 'IND-001', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dodoma', district: null, ward: null, baseline_year: '2023', baseline_value: 88.50, target_value: 92.00 },
  { target_id: 'TGT-003', indicator_id: 'IND-001', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mwanza', district: null, ward: null, baseline_year: '2023', baseline_value: 91.00, target_value: 94.00 },
  { target_id: 'TGT-004', indicator_id: 'IND-001', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Arusha', district: null, ward: null, baseline_year: '2023', baseline_value: 89.80, target_value: 93.00 },
  { target_id: 'TGT-005', indicator_id: 'IND-001', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mbeya', district: null, ward: null, baseline_year: '2023', baseline_value: 92.30, target_value: 95.00 },
  
  // IND-002 Targets
  { target_id: 'TGT-006', indicator_id: 'IND-002', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dar es Salaam', district: null, ward: null, baseline_year: '2023', baseline_value: 48.00, target_value: 42.00 },
  { target_id: 'TGT-007', indicator_id: 'IND-002', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dodoma', district: null, ward: null, baseline_year: '2023', baseline_value: 55.00, target_value: 45.00 },
  { target_id: 'TGT-008', indicator_id: 'IND-002', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mwanza', district: null, ward: null, baseline_year: '2023', baseline_value: 58.00, target_value: 48.00 },
  { target_id: 'TGT-009', indicator_id: 'IND-002', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Arusha', district: null, ward: null, baseline_year: '2023', baseline_value: 46.00, target_value: 40.00 },
  { target_id: 'TGT-010', indicator_id: 'IND-002', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mbeya', district: null, ward: null, baseline_year: '2023', baseline_value: 50.00, target_value: 43.00 },

  // IND-003 Targets
  { target_id: 'TGT-011', indicator_id: 'IND-003', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dar es Salaam', district: null, ward: null, baseline_year: '2023', baseline_value: 86.50, target_value: 90.00 },
  { target_id: 'TGT-012', indicator_id: 'IND-003', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dodoma', district: null, ward: null, baseline_year: '2023', baseline_value: 74.00, target_value: 80.00 },
  { target_id: 'TGT-013', indicator_id: 'IND-003', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mwanza', district: null, ward: null, baseline_year: '2023', baseline_value: 78.50, target_value: 84.00 },

  // IND-004 Targets
  { target_id: 'TGT-014', indicator_id: 'IND-004', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dar es Salaam', district: null, ward: null, baseline_year: '2023', baseline_value: 65.00, target_value: 80.00 },
  { target_id: 'TGT-015', indicator_id: 'IND-004', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Dodoma', district: null, ward: null, baseline_year: '2023', baseline_value: 48.00, target_value: 75.00 },
  { target_id: 'TGT-016', indicator_id: 'IND-004', framework_id: 'FW-001', financial_year: '2024/25', target_type: 'Regional', region: 'Mwanza', district: null, ward: null, baseline_year: '2023', baseline_value: 52.00, target_value: 75.00 }
];

const INITIAL_ACTUAL_DATA = [
  // IND-001 Actuals (Official Government Track)
  { data_id: 'DAT-001', indicator_id: 'IND-001', period: '2024/25', actual_value: 95.80, region: 'Dar es Salaam', district: 'Ilala', ward: 'Kisutu', submitted_by: 'deo.dar@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-05-10T09:30:00Z', status: 'Approved' },
  { data_id: 'DAT-002', indicator_id: 'IND-001', period: '2024/25', actual_value: 89.20, region: 'Dodoma', district: 'Dodoma Municipal', ward: 'Tambukareli', submitted_by: 'deo.dodoma@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-05-12T10:15:00Z', status: 'Approved' },
  { data_id: 'DAT-003', indicator_id: 'IND-001', period: '2024/25', actual_value: 91.50, region: 'Mwanza', district: 'Nyamagana', ward: 'Mirongo', submitted_by: 'deo.mwanza@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-05-14T11:00:00Z', status: 'Verified' },
  { data_id: 'DAT-004', indicator_id: 'IND-001', period: '2024/25', actual_value: 92.40, region: 'Arusha', district: 'Arusha City', ward: 'Sekei', submitted_by: 'deo.arusha@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-05-15T08:45:00Z', status: 'Approved' },
  { data_id: 'DAT-005', indicator_id: 'IND-001', period: '2024/25', actual_value: 94.60, region: 'Mbeya', district: 'Mbeya City', ward: 'Sisimba', submitted_by: 'deo.mbeya@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-05-16T14:20:00Z', status: 'Submitted' },

  // IND-002 Actuals (Official Government Track)
  { data_id: 'DAT-006', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 43.00, region: 'Dar es Salaam', district: 'Kinondoni', ward: 'Kunduchi', submitted_by: 'reo.dar@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-05T09:00:00Z', status: 'Approved' },
  { data_id: 'DAT-007', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 49.00, region: 'Dodoma', district: 'Bahi', ward: 'Bahi', submitted_by: 'reo.dodoma@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-06T10:30:00Z', status: 'Approved' },
  { data_id: 'DAT-008', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 51.00, region: 'Mwanza', district: 'Sengerema', ward: 'Sengerema', submitted_by: 'reo.mwanza@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-07T11:45:00Z', status: 'Approved' },
  { data_id: 'DAT-009', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 41.50, region: 'Arusha', district: 'Meru', ward: 'Usa River', submitted_by: 'reo.arusha@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-08T15:00:00Z', status: 'Approved' },
  { data_id: 'DAT-010', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 44.20, region: 'Mbeya', district: 'Rungwe', ward: 'Tukuyu', submitted_by: 'reo.mbeya@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-09T16:30:00Z', status: 'Approved' },

  // IND-003 Actuals (Official Government Track)
  { data_id: 'DAT-011', indicator_id: 'IND-003', period: '2024/25', actual_value: 88.20, region: 'Dar es Salaam', district: 'Ilala', ward: null, submitted_by: 'reo.dar@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-06-01T09:00:00Z', status: 'Approved' },
  { data_id: 'DAT-012', indicator_id: 'IND-003', period: '2024/25', actual_value: 76.50, region: 'Dodoma', district: 'Dodoma', ward: null, submitted_by: 'reo.dodoma@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-06-02T10:00:00Z', status: 'Approved' },
  { data_id: 'DAT-013', indicator_id: 'IND-003', period: '2024/25', actual_value: 81.00, region: 'Mwanza', district: 'Nyamagana', ward: null, submitted_by: 'reo.mwanza@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-06-03T11:00:00Z', status: 'Verified' },

  // IND-004 Actuals (Official Government Track)
  { data_id: 'DAT-014', indicator_id: 'IND-004', period: '2024/25 Q3', actual_value: 70.00, region: 'Dar es Salaam', district: null, ward: null, submitted_by: 'sqa.dar@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-10T11:00:00Z', status: 'Approved' },
  { data_id: 'DAT-015', indicator_id: 'IND-004', period: '2024/25 Q3', actual_value: 58.00, region: 'Dodoma', district: null, ward: null, submitted_by: 'sqa.dodoma@moe.go.tz', source_category: 'Official_Gov', date_submitted: '2025-04-11T12:00:00Z', status: 'Approved' },

  // Stakeholder Contributions Track (NGOs / Development Partners) - Isolated from General calculations
  { data_id: 'DAT-101', indicator_id: 'IND-001', period: '2024/25', actual_value: 2.10, region: 'Dodoma', district: 'Bahi', ward: 'Bahi Ward', submitted_by: 'ngo.worldvision@charity.org', source_category: 'Stakeholder_Contribution', date_submitted: '2025-05-18T10:00:00Z', status: 'Approved' },
  { data_id: 'DAT-102', indicator_id: 'IND-001', period: '2024/25', actual_value: 3.40, region: 'Dar es Salaam', district: 'Kinondoni', ward: 'Kunduchi', submitted_by: 'ngo.savechildren@charity.org', source_category: 'Stakeholder_Contribution', date_submitted: '2025-05-20T11:00:00Z', status: 'Approved' },
  { data_id: 'DAT-103', indicator_id: 'IND-002', period: '2024/25 Q3', actual_value: 12.00, region: 'Dodoma', district: 'Bahi', ward: 'Bahi Ward', submitted_by: 'ngo.actionaid@charity.org', source_category: 'Stakeholder_Contribution', date_submitted: '2025-04-15T09:30:00Z', status: 'Approved' }
];

const INITIAL_AUDIT_LOGS = [
  { log_id: 1, timestamp: '2026-06-23T10:00:00Z', username: 'admin@moe.go.tz', action: 'CREATE', entity: 'Indicator', details: 'Added new indicator IND-004 Percentage of Schools Inspected Annually' },
  { log_id: 2, timestamp: '2026-06-23T11:30:00Z', username: 'admin@moe.go.tz', action: 'UPDATE', entity: 'Framework Node', details: 'Linked N-105 Focus Area to ESDP III' },
  { log_id: 3, timestamp: '2026-06-23T12:15:00Z', username: 'evaluator.national@moe.go.tz', action: 'APPROVE', entity: 'Actual Data', details: 'Approved DAT-006 PTR for Dar es Salaam Q3' }
];

const USERS = [
  { username: 'admin@moe.go.tz', name: 'Hamis Juma', role: 'System Administrator', dept: 'ICT Unit', token: 'mock-token-admin' },
  { username: 'executive@moe.go.tz', name: 'Dr. Leonard Akwilapo', role: 'MoEST Leadership', dept: 'Permanent Secretary Office', token: 'mock-token-exec' },
  { username: 'evaluator.national@moe.go.tz', name: 'Neema Temu', role: 'National M&E Officer', dept: 'M&E Section', token: 'mock-token-national' },
  { username: 'reo.dodoma@moe.go.tz', name: 'Said Mwinyi', role: 'Regional M&E Officer', dept: 'Dodoma Regional Office', token: 'mock-token-regional' },
  { username: 'deo.dodoma@moe.go.tz', name: 'Mary Chisunga', role: 'District Education Officer', dept: 'Bahi District Council', token: 'mock-token-district' },
  { username: 'school.entry@moe.go.tz', name: 'Peter Temba', role: 'School Data Entry Officer', dept: 'Bahi Primary School', token: 'mock-token-school' }
];

export function initializeStorage() {
  const tables = {
    frameworks: INITIAL_FRAMEWORKS,
    nodes: INITIAL_NODES,
    projects: INITIAL_PROJECTS,
    project_nodes: INITIAL_PROJECT_NODES,
    activities: INITIAL_ACTIVITIES,
    mappings: INITIAL_ACTIVITY_MAPPINGS,
    indicators: INITIAL_INDICATORS,
    metadata: INITIAL_INDICATOR_METADATA,
    targets: INITIAL_TARGETS,
    actual_data: INITIAL_ACTUAL_DATA,
    audit_logs: INITIAL_AUDIT_LOGS,
    users: USERS
  };

  Object.entries(tables).forEach(([key, val]) => {
    if (!localStorage.getItem(`me_${key}`)) {
      localStorage.setItem(`me_${key}`, JSON.stringify(val));
    }
  });

  if (!localStorage.getItem('me_current_user')) {
    localStorage.setItem('me_current_user', JSON.stringify(USERS[1])); // Default to Executive
  }
}

export function getTable(name) {
  initializeStorage();
  const data = localStorage.getItem(`me_${name}`);
  return data ? JSON.parse(data) : [];
}

function getAuthHeaders() {
  const sessionUser = localStorage.getItem('me_current_user');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    return {
      'X-User-Username': user.username,
      'X-User-Role': user.role
    };
  }
  return {
    'X-User-Username': 'executive@moe.go.tz',
    'X-User-Role': 'MoEST Leadership'
  };
}

export async function preloadFromBackend() {
  try {
    const headers = getAuthHeaders();
    
    // Fetch frameworks
    const fwsRes = await axios.get(`${API_BASE}/frameworks`, { headers });
    const frameworks = fwsRes.data.data;
    localStorage.setItem('me_frameworks', JSON.stringify(frameworks));
    
    // Fetch framework nodes
    let allNodes = [];
    for (const fw of frameworks) {
      const nodesRes = await axios.get(`${API_BASE}/frameworks/${fw.framework_id}/nodes`, { headers });
      allNodes = [...allNodes, ...nodesRes.data.data];
    }
    localStorage.setItem('me_nodes', JSON.stringify(allNodes));
    
    // Fetch projects
    const prjsRes = await axios.get(`${API_BASE}/projects`, { headers });
    const projects = prjsRes.data.data;
    localStorage.setItem('me_projects', JSON.stringify(projects));
    
    // Fetch project nodes
    let allPrjNodes = [];
    for (const prj of projects) {
      const nodesRes = await axios.get(`${API_BASE}/projects/${prj.project_id}/nodes`, { headers });
      allPrjNodes = [...allPrjNodes, ...nodesRes.data.data];
    }
    localStorage.setItem('me_project_nodes', JSON.stringify(allPrjNodes));
    
    // Fetch indicators
    const indsRes = await axios.get(`${API_BASE}/indicators`, { headers });
    const indicators = indsRes.data.data;
    localStorage.setItem('me_indicators', JSON.stringify(indicators));
    
    // Extract metadata
    const metadata = indicators.map(ind => ind.metadata).filter(Boolean);
    localStorage.setItem('me_metadata', JSON.stringify(metadata));
    
    // Fetch activities
    const actsRes = await axios.get(`${API_BASE}/activities`, { headers });
    localStorage.setItem('me_activities', JSON.stringify(actsRes.data.data));

    // Fetch mappings
    const mapsRes = await axios.get(`${API_BASE}/mappings`, { headers });
    localStorage.setItem('me_mappings', JSON.stringify(mapsRes.data.data));
    
    // Fetch targets
    const tgtsRes = await axios.get(`${API_BASE}/targets`, { headers });
    localStorage.setItem('me_targets', JSON.stringify(tgtsRes.data.data));
    
    // Fetch submissions (actual data)
    const subsRes = await axios.get(`${API_BASE}/submissions`, { headers });
    localStorage.setItem('me_actual_data', JSON.stringify(subsRes.data.data));
    
    // Fetch audit logs
    const logsRes = await axios.get(`${API_BASE}/audit-logs`, { headers });
    localStorage.setItem('me_audit_logs', JSON.stringify(logsRes.data.data));
    
    console.log('Successfully preloaded all data tables from Laravel SQLite backend.');
    return true;
  } catch (error) {
    console.warn('Backend API connection failed, running in local mock database mode.', error);
    return false;
  }
}

async function syncToBackend(name, oldData, newData) {
  try {
    const headers = getAuthHeaders();
    
    const getUniqueId = (item, tableName) => {
      if (tableName === 'frameworks') return item.framework_id;
      if (tableName === 'projects') return item.project_id;
      if (tableName === 'nodes' || tableName === 'project_nodes') return item.node_id;
      if (tableName === 'indicators' || tableName === 'metadata') return item.indicator_id;
      if (tableName === 'actual_data') return item.data_id;
      if (tableName === 'activities') return item.activity_id;
      if (tableName === 'mappings') return item.mapping_id;
      return item.id;
    };

    // Case 1: Item added
    if (newData.length > oldData.length) {
      const added = newData.find(item => !oldData.some(old => getUniqueId(old, name) === getUniqueId(item, name)));
      if (!added) return;
      
      if (name === 'frameworks') {
        await axios.post(`${API_BASE}/frameworks`, added, { headers });
      } else if (name === 'projects') {
        await axios.post(`${API_BASE}/projects`, added, { headers });
      } else if (name === 'nodes') {
        await axios.post(`${API_BASE}/frameworks/${added.framework_id}/nodes`, added, { headers });
      } else if (name === 'project_nodes') {
        await axios.post(`${API_BASE}/projects/${added.project_id}/nodes`, added, { headers });
      } else if (name === 'indicators') {
        await axios.post(`${API_BASE}/indicators`, added, { headers });
      } else if (name === 'actual_data') {
        await axios.post(`${API_BASE}/submissions`, {
          indicator_id: added.indicator_id,
          period: added.period,
          actual_value: added.actual_value,
          region: added.region,
          district: added.district,
          ward: added.ward,
          submitted_by: added.submitted_by,
          source_category: added.source_category
        }, { headers });
      }
    }
    // Case 2: Item deleted
    else if (newData.length < oldData.length) {
      const deleted = oldData.find(old => !newData.some(item => getUniqueId(old, name) === getUniqueId(item, name)));
      if (!deleted) return;
      const id = getUniqueId(deleted, name);
      
      if (name === 'frameworks') {
        await axios.delete(`${API_BASE}/frameworks/${id}`, { headers });
      } else if (name === 'projects') {
        await axios.delete(`${API_BASE}/projects/${id}`, { headers });
      } else if (name === 'nodes') {
        await axios.delete(`${API_BASE}/nodes/${id}`, { headers });
      } else if (name === 'project_nodes') {
        await axios.delete(`${API_BASE}/project-nodes/${id}`, { headers });
      } else if (name === 'indicators') {
        await axios.delete(`${API_BASE}/indicators/${id}`, { headers });
      } else if (name === 'actual_data') {
        await axios.delete(`${API_BASE}/submissions/${id}`, { headers });
      }
    }
    // Case 3: Item updated
    else {
      const updated = newData.find(item => {
        const old = oldData.find(o => getUniqueId(o, name) === getUniqueId(item, name));
        return old && JSON.stringify(old) !== JSON.stringify(item);
      });
      if (!updated) return;
      const id = getUniqueId(updated, name);
      const oldVal = oldData.find(o => getUniqueId(o, name) === id);

      if (name === 'frameworks') {
        await axios.put(`${API_BASE}/frameworks/${id}`, updated, { headers });
      } else if (name === 'projects') {
        await axios.put(`${API_BASE}/projects/${id}`, updated, { headers });
      } else if (name === 'nodes') {
        await axios.put(`${API_BASE}/nodes/${id}`, updated, { headers });
      } else if (name === 'project_nodes') {
        await axios.put(`${API_BASE}/project-nodes/${id}`, updated, { headers });
      } else if (name === 'indicators') {
        await axios.put(`${API_BASE}/indicators/${id}`, updated, { headers });
      } else if (name === 'metadata') {
        await axios.put(`${API_BASE}/indicators/${id}/metadata`, updated, { headers });
      } else if (name === 'actual_data') {
        if (oldVal && oldVal.status !== updated.status) {
          if (updated.status === 'Verified') {
            await axios.post(`${API_BASE}/submissions/${id}/verify`, { verifier_username: headers['X-User-Username'] }, { headers });
          } else if (updated.status === 'Approved') {
            await axios.post(`${API_BASE}/submissions/${id}/approve`, { approver_username: headers['X-User-Username'] }, { headers });
          }
        } else {
          await axios.put(`${API_BASE}/submissions/${id}`, updated, { headers });
        }
      }
    }
  } catch (err) {
    console.error('Error syncing mutation to Laravel SQLite backend:', err);
  }
}

export function saveTable(name, data) {
  const oldData = getTable(name);
  localStorage.setItem(`me_${name}`, JSON.stringify(data));
  syncToBackend(name, oldData, data);
}

export function logAction(username, action, entity, details) {
  const logs = getTable('audit_logs');
  const newLog = {
    log_id: logs.length ? Math.max(...logs.map(l => l.log_id)) + 1 : 1,
    timestamp: new Date().toISOString(),
    username,
    action,
    entity,
    details
  };
  logs.unshift(newLog);
  saveTable('audit_logs', logs);
  return newLog;
}

export function getIndicatorPerformance(indicatorId, period = '2024/25') {
  // CRITICAL IMPROVEMENT: Filter actuals to ONLY include Official Government Track
  const allActuals = getTable('actual_data');
  const actuals = allActuals.filter(d => 
    d.indicator_id === indicatorId && 
    d.period.startsWith(period.substring(0, 7)) &&
    d.source_category === 'Official_Gov'
  );
  
  // Calculate Stakeholder Contribution separately to prevent double-counting
  const stakeholderActuals = allActuals.filter(d => 
    d.indicator_id === indicatorId && 
    d.period.startsWith(period.substring(0, 7)) &&
    d.source_category === 'Stakeholder_Contribution'
  );

  const targets = getTable('targets').filter(t => t.indicator_id === indicatorId && t.financial_year === period);
  const ind = getTable('indicators').find(i => i.indicator_id === indicatorId);

  const sumStakeholder = stakeholderActuals.reduce((acc, curr) => acc + Number(curr.actual_value), 0);

  if (actuals.length === 0) {
    return { 
      indicator_id: indicatorId, 
      name: ind ? ind.name : '', 
      type: ind ? ind.type : '', 
      national_actual: null, 
      national_target: 0, 
      status: 'No Data', 
      attainment_percentage: 0, 
      regional_entries: [],
      stakeholder_actual: sumStakeholder,
      stakeholder_entries: stakeholderActuals
    };
  }

  const isLowerBetter = indicatorId === 'IND-002';

  const sumActual = actuals.reduce((acc, curr) => acc + Number(curr.actual_value), 0);
  const avgActual = sumActual / actuals.length;

  const targetVal = targets.length > 0 ? (targets.reduce((acc, curr) => acc + Number(curr.target_value), 0) / targets.length) : 0;
  const baselineVal = targets.length > 0 ? (targets.reduce((acc, curr) => acc + Number(curr.baseline_value), 0) / targets.length) : 0;

  let attainmentPct = 0;
  if (isLowerBetter) {
    attainmentPct = avgActual <= targetVal ? 100 : Math.max(0, 100 - ((avgActual - targetVal) / targetVal * 100));
  } else {
    attainmentPct = targetVal > 0 ? (avgActual / targetVal * 100) : 0;
  }

  let status = 'On Track';
  if (isLowerBetter) {
    if (avgActual <= targetVal) status = 'On Track';
    else if (avgActual <= targetVal * 1.1) status = 'At Risk';
    else status = 'Below Target';
  } else {
    if (attainmentPct >= 100) status = 'On Track';
    else if (attainmentPct >= 90) status = 'At Risk';
    else status = 'Below Target';
  }

  const regionalData = actuals.map(act => {
    const tgt = targets.find(t => t.region.toLowerCase() === act.region.toLowerCase());
    const regionTarget = tgt ? tgt.target_value : targetVal;
    let dev = 0;
    if (regionTarget > 0) {
      dev = ((act.actual_value - regionTarget) / regionTarget) * 100;
    }
    return {
      data_id: act.data_id,
      region: act.region,
      district: act.district,
      ward: act.ward,
      actual_value: act.actual_value,
      target_value: regionTarget,
      deviation: dev,
      submitted_by: act.submitted_by,
      status: act.status,
      date_submitted: act.date_submitted
    };
  });

  return {
    indicator_id: indicatorId,
    name: ind ? ind.name : '',
    type: ind ? ind.type : '',
    national_actual: Number(avgActual.toFixed(2)),
    national_target: Number(targetVal.toFixed(2)),
    baseline_value: Number(baselineVal.toFixed(2)),
    attainment_percentage: Number(attainmentPct.toFixed(1)),
    status,
    regional_entries: regionalData,
    stakeholder_actual: Number(sumStakeholder.toFixed(2)),
    stakeholder_entries: stakeholderActuals
  };
}

export function getFrameworkSummary() {
  const indicators = getTable('indicators');
  const results = indicators.map(ind => getIndicatorPerformance(ind.indicator_id));
  
  const total = results.length;
  const onTrack = results.filter(r => r.status === 'On Track').length;
  const atRisk = results.filter(r => r.status === 'At Risk').length;
  const belowTarget = results.filter(r => r.status === 'Below Target').length;

  return {
    total_indicators: total,
    on_track: onTrack,
    at_risk: atRisk,
    below_target: belowTarget,
    results
  };
}
