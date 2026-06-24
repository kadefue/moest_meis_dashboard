import React, { useState, useEffect } from 'react';
import { getTable, saveTable, logAction } from '../MockData';
import AuditLogViewer from '../components/AuditLogViewer';
import SearchableSelect from '../components/SearchableSelect';

export default function AdminScreen({ user }) {
  const [activeTab, setActiveTab] = useState('users');
  
  const isAuthorized = ['System Administrator', 'National M&E Officer'].includes(user?.role);

  // States
  const [users, setUsers] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState('');
  
  // Projects States
  const [projects, setProjects] = useState([]);
  const [projectNodes, setProjectNodes] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Framework Form State
  const [newFwId, setNewFwId] = useState('');
  const [newFwName, setNewFwName] = useState('');
  const [newFwStartYear, setNewFwStartYear] = useState('2026');
  const [newFwEndYear, setNewFwEndYear] = useState('2031');

  // Node Form State
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeFwId, setNewNodeFwId] = useState('');
  const [newNodeParentId, setNewNodeParentId] = useState('');
  const [newNodeLevelType, setNewNodeLevelType] = useState('Focus Area');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeIndicatorId, setNewNodeIndicatorId] = useState('');
  const [levelTypes, setLevelTypes] = useState(['Sub-sector', 'Focus Area', 'Strategy', 'Target / Objective']);

  // Project Form State
  const [newPrjId, setNewPrjId] = useState('');
  const [newPrjName, setNewPrjName] = useState('');
  const [newPrjStartYear, setNewPrjStartYear] = useState('2026');
  const [newPrjEndYear, setNewPrjEndYear] = useState('2031');

  // Project Node Form State
  const [newPrjNodeId, setNewPrjNodeId] = useState('');
  const [newPrjNodeProjectId, setNewPrjNodeProjectId] = useState('');
  const [newPrjNodeParentId, setNewPrjNodeParentId] = useState('');
  const [newPrjNodeLevelType, setNewPrjNodeLevelType] = useState('Component');
  const [newPrjNodeName, setNewPrjNodeName] = useState('');
  const [newPrjNodeIndicatorId, setNewPrjNodeIndicatorId] = useState('');
  const [prjLevelTypes, setPrjLevelTypes] = useState(['Component', 'Sub-component', 'Key Result Area', 'Activity Group']);

  const [integrations, setIntegrations] = useState([
    { system: 'SAS (School Registry API)', status: 'Active', lastSync: '2026-06-23T13:45:00Z', recordsSynced: 1240, errors: 0 },
    { system: 'ESMIS (HR/Personnel API)', status: 'Active', lastSync: '2026-06-23T11:20:00Z', recordsSynced: 3400, errors: 0 },
    { system: 'SQAS (Quality Assurance Inspection API)', status: 'Error', lastSync: '2026-06-23T14:10:00Z', recordsSynced: 400, errors: 3 }
  ]);

  // Loading
  useEffect(() => {
    setUsers(getTable('users'));
    setIndicators(getTable('indicators'));
    const fws = getTable('frameworks');
    setFrameworks(fws);
    setNodes(getTable('nodes'));
    if (fws.length > 0) {
      setSelectedFrameworkId(fws[0].framework_id);
      setNewNodeFwId(fws[0].framework_id);
    }
    
    // Load projects
    const prjs = getTable('projects');
    setProjects(prjs);
    setProjectNodes(getTable('project_nodes'));
    if (prjs.length > 0) {
      setSelectedProjectId(prjs[0].project_id);
      setNewPrjNodeProjectId(prjs[0].project_id);
    }
    
    const savedTypes = localStorage.getItem('me_level_types');
    if (savedTypes) {
      setLevelTypes(JSON.parse(savedTypes));
    } else {
      localStorage.setItem('me_level_types', JSON.stringify(['Sub-sector', 'Focus Area', 'Strategy', 'Target / Objective']));
    }

    const savedPrjTypes = localStorage.getItem('me_prj_level_types');
    if (savedPrjTypes) {
      setPrjLevelTypes(JSON.parse(savedPrjTypes));
    } else {
      localStorage.setItem('me_prj_level_types', JSON.stringify(['Component', 'Sub-component', 'Key Result Area', 'Activity Group']));
    }
  }, []);

  const handleCreateFramework = (e) => {
    e.preventDefault();
    if (!newFwId || !newFwName || !newFwStartYear || !newFwEndYear) {
      alert('Please fill all fields');
      return;
    }

    const currentFws = getTable('frameworks');
    if (currentFws.some(f => f.framework_id.toLowerCase() === newFwId.toLowerCase())) {
      alert('Framework ID already exists!');
      return;
    }

    const newFw = {
      framework_id: newFwId.toUpperCase(),
      name: newFwName,
      start_year: parseInt(newFwStartYear),
      end_year: parseInt(newFwEndYear)
    };

    const updated = [...currentFws, newFw];
    saveTable('frameworks', updated);
    setFrameworks(updated);

    logAction(user.username, 'CREATE', 'Framework', `Defined new strategic framework: ${newFw.name} (${newFw.framework_id})`);

    // Reset Form
    setNewFwId('');
    setNewFwName('');
    alert('Strategic Framework defined successfully in portal registry.');
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newNodeId || !newNodeFwId || !newNodeLevelType || !newNodeName) {
      alert('Please fill all fields');
      return;
    }

    const currentNodes = getTable('nodes');
    if (currentNodes.some(n => n.node_id.toLowerCase() === newNodeId.toLowerCase())) {
      alert('Node ID already exists!');
      return;
    }

    const newNode = {
      node_id: newNodeId.toUpperCase(),
      framework_id: newNodeFwId,
      parent_node_id: newNodeParentId || null,
      level_type: newNodeLevelType,
      name: newNodeName
    };

    const updated = [...currentNodes, newNode];
    saveTable('nodes', updated);
    setNodes(updated);

    // Update indicator link if specified
    if (newNodeIndicatorId) {
      const currentIndicators = getTable('indicators');
      const updatedInds = currentIndicators.map(ind => {
        if (ind.indicator_id === newNodeIndicatorId) {
          return { ...ind, associated_node_id: newNode.node_id };
        }
        return ind;
      });
      saveTable('indicators', updatedInds);
      setIndicators(updatedInds);
      logAction(user.username, 'UPDATE', 'Indicator Link', `Linked KPI indicator ${newNodeIndicatorId} to framework node ${newNode.node_id}`);
    }

    logAction(user.username, 'CREATE', 'Framework Node', `Added node ${newNode.node_id} (${newNode.name}) under framework ${newNode.framework_id}`);

    // Reset Form
    setNewNodeId('');
    setNewNodeName('');
    setNewNodeParentId('');
    setNewNodeIndicatorId('');
    alert('Framework Node successfully attached to results chain.');
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newPrjId || !newPrjName || !newPrjStartYear || !newPrjEndYear) {
      alert('Please fill all fields');
      return;
    }

    const currentPrjs = getTable('projects');
    if (currentPrjs.some(p => p.project_id.toLowerCase() === newPrjId.toLowerCase())) {
      alert('Project ID already exists!');
      return;
    }

    const newPrj = {
      project_id: newPrjId.toUpperCase(),
      name: newPrjName,
      start_year: parseInt(newPrjStartYear),
      end_year: parseInt(newPrjEndYear)
    };

    const updated = [...currentPrjs, newPrj];
    saveTable('projects', updated);
    setProjects(updated);

    logAction(user.username, 'CREATE', 'Project', `Defined new project: ${newPrj.name} (${newPrj.project_id})`);

    // Reset Form
    setNewPrjId('');
    setNewPrjName('');
    alert('Project defined successfully in portal registry.');
  };

  const handleCreateProjectNode = (e) => {
    e.preventDefault();
    if (!newPrjNodeId || !newPrjNodeProjectId || !newPrjNodeLevelType || !newPrjNodeName) {
      alert('Please fill all fields');
      return;
    }

    const currentNodes = getTable('project_nodes');
    if (currentNodes.some(n => n.node_id.toLowerCase() === newPrjNodeId.toLowerCase())) {
      alert('Node ID already exists!');
      return;
    }

    const newNode = {
      node_id: newPrjNodeId.toUpperCase(),
      project_id: newPrjNodeProjectId,
      parent_node_id: newPrjNodeParentId || null,
      level_type: newPrjNodeLevelType,
      name: newPrjNodeName
    };

    const updated = [...currentNodes, newNode];
    saveTable('project_nodes', updated);
    setProjectNodes(updated);

    // Update indicator link if specified
    if (newPrjNodeIndicatorId) {
      const currentIndicators = getTable('indicators');
      const updatedInds = currentIndicators.map(ind => {
        if (ind.indicator_id === newPrjNodeIndicatorId) {
          return { ...ind, associated_project_node_id: newNode.node_id };
        }
        return ind;
      });
      saveTable('indicators', updatedInds);
      setIndicators(updatedInds);
      logAction(user.username, 'UPDATE', 'Indicator Link', `Linked KPI indicator ${newPrjNodeIndicatorId} to project node ${newNode.node_id}`);
    }

    logAction(user.username, 'CREATE', 'Project Node', `Added node ${newNode.node_id} (${newNode.name}) under project ${newNode.project_id}`);

    // Reset Form
    setNewPrjNodeId('');
    setNewPrjNodeName('');
    setNewPrjNodeParentId('');
    setNewPrjNodeIndicatorId('');
    alert('Project Node successfully attached to results chain.');
  };

  const handleDeleteFramework = (fwId) => {
    if (!isAuthorized) {
      alert("Permission Error: You are not authorized to modify settings.");
      return;
    }
    if (!confirm(`Are you sure you want to delete strategic framework ${fwId}? All associated nodes and targets will be affected.`)) return;
    
    const currentFws = getTable('frameworks');
    const updated = currentFws.filter(f => f.framework_id !== fwId);
    saveTable('frameworks', updated);
    setFrameworks(updated);

    // Also remove associated nodes
    const currentNodes = getTable('nodes');
    const nodesToKeep = currentNodes.filter(n => n.framework_id !== fwId);
    saveTable('nodes', nodesToKeep);
    setNodes(nodesToKeep);

    logAction(user.username, 'DELETE', 'Framework', `Deleted strategic framework: ${fwId}`);
    alert(`Framework ${fwId} and its associated nodes deleted successfully.`);
  };

  const handleDeleteNode = (nodeId) => {
    if (!isAuthorized) {
      alert("Permission Error: You are not authorized to modify settings.");
      return;
    }
    const currentNodes = getTable('nodes');
    const hasChildren = currentNodes.some(n => n.parent_node_id === nodeId);
    if (hasChildren) {
      alert("Validation Error: Cannot delete a parent node that has children. Please delete all children nodes first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete node ${nodeId}?`)) return;

    const updated = currentNodes.filter(n => n.node_id !== nodeId);
    saveTable('nodes', updated);
    setNodes(updated);

    // Unlink indicator if any
    const currentIndicators = getTable('indicators');
    const updatedInds = currentIndicators.map(ind => {
      if (ind.associated_node_id === nodeId) {
        return { ...ind, associated_node_id: null };
      }
      return ind;
    });
    saveTable('indicators', updatedInds);
    setIndicators(updatedInds);

    logAction(user.username, 'DELETE', 'Framework Node', `Deleted framework node: ${nodeId}`);
    alert(`Node ${nodeId} deleted successfully.`);
  };

  const handleDeleteProject = (prjId) => {
    if (!isAuthorized) {
      alert("Permission Error: You are not authorized to modify settings.");
      return;
    }
    if (!confirm(`Are you sure you want to delete project ${prjId}? All associated nodes will be affected.`)) return;

    const currentPrjs = getTable('projects');
    const updated = currentPrjs.filter(p => p.project_id !== prjId);
    saveTable('projects', updated);
    setProjects(updated);

    // Also remove associated project nodes
    const currentPrjNodes = getTable('project_nodes');
    const nodesToKeep = currentPrjNodes.filter(n => n.project_id !== prjId);
    saveTable('project_nodes', nodesToKeep);
    setProjectNodes(nodesToKeep);

    logAction(user.username, 'DELETE', 'Project', `Deleted project: ${prjId}`);
    alert(`Project ${prjId} and its associated nodes deleted successfully.`);
  };

  const handleDeleteProjectNode = (nodeId) => {
    if (!isAuthorized) {
      alert("Permission Error: You are not authorized to modify settings.");
      return;
    }
    const currentPrjNodes = getTable('project_nodes');
    const hasChildren = currentPrjNodes.some(n => n.parent_node_id === nodeId);
    if (hasChildren) {
      alert("Validation Error: Cannot delete a parent node that has children. Please delete all children nodes first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete project node ${nodeId}?`)) return;

    const updated = currentPrjNodes.filter(n => n.node_id !== nodeId);
    saveTable('project_nodes', updated);
    setProjectNodes(updated);

    // Unlink indicator if any
    const currentIndicators = getTable('indicators');
    const updatedInds = currentIndicators.map(ind => {
      if (ind.associated_project_node_id === nodeId) {
        return { ...ind, associated_project_node_id: null };
      }
      return ind;
    });
    saveTable('indicators', updatedInds);
    setIndicators(updatedInds);

    logAction(user.username, 'DELETE', 'Project Node', `Deleted project node: ${nodeId}`);
    alert(`Project node ${nodeId} deleted successfully.`);
  };

  const handleDeleteIndicator = (indId) => {
    if (!isAuthorized) {
      alert("Permission Error: You are not authorized to modify settings.");
      return;
    }
    if (!confirm(`Are you sure you want to delete indicator ${indId}? This will remove the indicator from all mappings and dashboards.`)) return;

    const currentInds = getTable('indicators');
    const updated = currentInds.filter(i => i.indicator_id !== indId);
    saveTable('indicators', updated);
    setIndicators(updated);

    // Also remove targets/metadata
    const currentTgts = getTable('targets');
    saveTable('targets', currentTgts.filter(t => t.indicator_id !== indId));

    const currentMeta = getTable('metadata');
    saveTable('metadata', currentMeta.filter(m => m.indicator_id !== indId));

    logAction(user.username, 'DELETE', 'Indicator', `Deleted KPI indicator: ${indId}`);
    alert(`Indicator ${indId} deleted successfully.`);
  };

  const triggerSync = (systemIndex) => {
    const updated = [...integrations];
    const system = updated[systemIndex];
    system.status = 'Syncing...';
    setIntegrations(updated);

    setTimeout(() => {
      const finished = [...integrations];
      finished[systemIndex] = {
        ...finished[systemIndex],
        status: 'Active',
        lastSync: new Date().toISOString(),
        recordsSynced: finished[systemIndex].recordsSynced + Math.floor(Math.random() * 20) + 1,
        errors: 0
      };
      setIntegrations(finished);
      logAction(user.username, 'SYNC', 'System Integration', `Triggered manual data synchronization with ${finished[systemIndex].system}`);
      alert(`${finished[systemIndex].system} synchronized successfully!`);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tabs Row */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--neutral-200)', gap: '8px' }}>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('users')}
        >
          👤 User Scopes
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'indicators' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'indicators' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('indicators')}
        >
          📈 Indicator Registry
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'integrations' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'integrations' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('integrations')}
        >
          🔄 External Integrations
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'frameworks' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'frameworks' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('frameworks')}
        >
          🏛️ Framework Setup
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'projects' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'projects' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('projects')}
        >
          📂 Project Setup
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'audit' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'audit' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('audit')}
        >
          🛡️ e-GA Audit Log
        </button>
      </div>

      {/* Tab Contents */}
      
      {/* 1. USERS */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>System Users and Scopes</h3>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => alert('New user registration matches MoEST LDAP Active Directory.')}>
              + Add User
            </button>
          </div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Username</th>
                  <th>Assigned Role</th>
                  <th>Division / Scope</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.username}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.username}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td>{u.dept}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => alert('Editing user authorizations')}>
                        Edit Scope
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. INDICATORS */}
      {activeTab === 'indicators' && (
        <div className="card">
          {!isAuthorized && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>⚠️</span>
              <div>
                <strong>Read-Only View:</strong> You are not authorized to modify strategic planning structures or administrative configurations.
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Indicator Setup</h3>
            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }} 
              onClick={() => isAuthorized ? alert('Configure new indicators under ESDP III') : null}
              disabled={!isAuthorized}
            >
              + Add Indicator
            </button>
          </div>
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Indicator Name</th>
                  <th>KPI Type</th>
                  <th>Derived Formulas</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map(ind => (
                  <tr key={ind.indicator_id}>
                    <td style={{ fontWeight: 700 }}>{ind.indicator_id}</td>
                    <td style={{ fontWeight: 500 }}>{ind.name}</td>
                    <td>{ind.type}</td>
                    <td>
                      {ind.is_derived ? (
                        <code style={{ background: 'var(--neutral-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{ind.formula}</code>
                      ) : (
                        <span style={{ color: 'var(--neutral-600)', fontSize: '0.8rem' }}>Direct Entry</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }} 
                          onClick={() => isAuthorized ? alert('Modifying indicator rules') : null}
                          disabled={!isAuthorized}
                        >
                          Configure
                        </button>
                        {isAuthorized && (
                          <button 
                            className="btn" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                            onClick={() => handleDeleteIndicator(ind.indicator_id)}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="card">
          <h3>Government Integration Syncs</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
            Visual dashboard monitors RESTful endpoint integrations. Interoperability conforms to e-GA specifications.
          </p>
          
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>API Endpoint System</th>
                  <th>Sync Status</th>
                  <th>Last Sync Time</th>
                  <th>Records Processed</th>
                  <th>Errors Caught</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((sys, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{sys.system}</td>
                    <td>
                      <span className={`badge ${
                        sys.status === 'Active' ? 'badge-success' : sys.status === 'Error' ? 'badge-error' : 'badge-warning'
                      }`}>{sys.status}</span>
                    </td>
                    <td>{new Date(sys.lastSync).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{sys.recordsSynced}</td>
                    <td style={{ color: sys.errors > 0 ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>{sys.errors}</td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }} 
                        onClick={() => triggerSync(idx)}
                        disabled={sys.status === 'Syncing...'}
                      >
                        🔄 Sync Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. AUDIT */}
      {activeTab === 'audit' && (
        <div className="card">
          <h3>e-GA Immutable Security Audit trail</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
            Under Personal Data Protection Act (2022) rules, all CRUD and authentication actions are audit logged.
          </p>
          <AuditLogViewer />
        </div>
      )}

      {/* 5. FRAMEWORKS & NODES SETUP */}
      {activeTab === 'frameworks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {!isAuthorized && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span>⚠️</span>
              <div>
                <strong>Read-Only View:</strong> You are not authorized to modify strategic planning structures or administrative configurations.
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Left Panel: View current frameworks & node tree */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3>Registered Strategic Frameworks</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                  Active plans and policy directives coordinating target metrics.
                </p>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Framework Name</th>
                        <th>Years</th>
                        {isAuthorized && <th style={{ textAlign: 'right' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {frameworks.map(fw => (
                        <tr 
                          key={fw.framework_id}
                          onClick={() => {
                            setSelectedFrameworkId(fw.framework_id);
                            setNewNodeFwId(fw.framework_id);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            background: selectedFrameworkId === fw.framework_id ? 'var(--neutral-100)' : 'transparent',
                            borderLeft: selectedFrameworkId === fw.framework_id ? '4px solid var(--primary)' : '4px solid transparent'
                          }}
                        >
                          <td style={{ fontWeight: 700 }}>{fw.framework_id}</td>
                          <td style={{ fontWeight: 600 }}>{fw.name}</td>
                          <td>{fw.start_year} - {fw.end_year}</td>
                          {isAuthorized && (
                            <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                              <button 
                                className="btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                                onClick={() => handleDeleteFramework(fw.framework_id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3>Results Chain Hierarchy Nodes</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                  Nodes defined under <strong>{selectedFrameworkId}</strong>:
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)', maxHeight: '350px', overflowY: 'auto' }}>
                  {nodes.filter(n => n.framework_id === selectedFrameworkId).length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--neutral-500)' }}>
                      No nodes defined for this framework yet.
                    </div>
                  ) : (
                    nodes.filter(n => n.framework_id === selectedFrameworkId).map(node => (
                      <div 
                        key={node.node_id} 
                        style={{ 
                          padding: '10px 12px', 
                          background: 'var(--white)', 
                          borderRadius: '4px', 
                          borderLeft: '3px solid var(--secondary)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginLeft: node.parent_node_id ? '20px' : '0px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{node.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--neutral-600)', marginTop: '2px' }}>
                            <span style={{ fontWeight: 700 }}>{node.node_id}</span> | Level: {node.level_type} 
                            {node.parent_node_id && ` | Parent: ${node.parent_node_id}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{node.level_type}</span>
                          {isAuthorized && (
                            <button
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                              onClick={() => handleDeleteNode(node.node_id)}
                              title="Delete Node"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          {/* Right Panel: Creation Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Form 1: Define New Framework */}
            <div className="card" style={{ opacity: isAuthorized ? 1 : 0.75 }}>
              <h3>Define Strategic Framework</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Register a new high-level framework (e.g. Five-Year Development Plan).
              </p>
              
              <form onSubmit={isAuthorized ? handleCreateFramework : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Framework ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. FW-004" 
                      value={newFwId}
                      onChange={e => setNewFwId(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Start Year</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2026" 
                      value={newFwStartYear}
                      onChange={e => setNewFwStartYear(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>End Year</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2031" 
                      value={newFwEndYear}
                      onChange={e => setNewFwEndYear(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Framework Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Higher Education Economic Transformation (HEET)" 
                    value={newFwName}
                    onChange={e => setNewFwName(e.target.value)}
                    required 
                    disabled={!isAuthorized}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ marginTop: '8px', padding: '10px', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                  disabled={!isAuthorized}
                >
                  💾 Save Strategic Framework
                </button>
              </form>
            </div>

            {/* Form 2: Define New Framework Node */}
            <div className="card" style={{ opacity: isAuthorized ? 1 : 0.75 }}>
              <h3>Define Results Chain Node</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Add strategic components (sub-sectors, objectives, focus areas) to the selected framework.
              </p>
              
              <form onSubmit={isAuthorized ? handleCreateNode : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Node ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. N-106" 
                      value={newNodeId}
                      onChange={e => setNewNodeId(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Level Type</span>
                      {isAuthorized && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newType = prompt("Enter new Level Type (e.g. Sub-Programme, Key Result Area):");
                            if (newType && newType.trim()) {
                              const trimmed = newType.trim();
                              if (levelTypes.includes(trimmed)) {
                                alert("Level Type already exists!");
                              } else {
                                const updated = [...levelTypes, trimmed];
                                setLevelTypes(updated);
                                localStorage.setItem('me_level_types', JSON.stringify(updated));
                                setNewNodeLevelType(trimmed);
                              }
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                        >
                          + Add Custom
                        </button>
                      )}
                    </label>
                    <SearchableSelect
                      options={levelTypes.map(type => ({ value: type, label: type }))}
                      value={newNodeLevelType}
                      onChange={setNewNodeLevelType}
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Framework</label>
                    <SearchableSelect
                      options={frameworks.map(f => ({ value: f.framework_id, label: `${f.framework_id} - ${f.name.substring(0, 35)}...` }))}
                      value={newNodeFwId}
                      onChange={val => {
                        setNewNodeFwId(val);
                        setNewNodeParentId('');
                      }}
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Parent Node (Optional)</label>
                    <SearchableSelect
                      options={[
                        { value: "", label: "None (Root Node)" },
                        ...nodes.filter(n => n.framework_id === newNodeFwId).map(n => ({ value: n.node_id, label: `${n.node_id} - ${n.name.substring(0, 30)}` }))
                      ]}
                      value={newNodeParentId}
                      onChange={setNewNodeParentId}
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Linked KPI / Indicator (Optional)</label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None - Select KPI to Link" },
                      ...indicators.map(ind => ({ value: ind.indicator_id, label: `${ind.indicator_id}: ${ind.name}` }))
                    ]}
                    value={newNodeIndicatorId}
                    onChange={setNewNodeIndicatorId}
                    disabled={!isAuthorized}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Node Name / Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Higher Education Infrastructure Development" 
                    value={newNodeName}
                    onChange={e => setNewNodeName(e.target.value)}
                    required 
                    disabled={!isAuthorized}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ marginTop: '8px', padding: '10px', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                  disabled={!isAuthorized}
                >
                  🌿 Attach to Results Chain
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
      )}

      {/* 6. PROJECTS & NODES SETUP */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {!isAuthorized && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span>⚠️</span>
              <div>
                <strong>Read-Only View:</strong> You are not authorized to modify strategic planning structures or administrative configurations.
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Left Panel: View current projects & node tree */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3>Registered Strategic Projects</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                  Active investment projects and donor-funded sector operations.
                </p>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Project Name</th>
                        <th>Years</th>
                        {isAuthorized && <th style={{ textAlign: 'right' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(prj => (
                        <tr 
                          key={prj.project_id}
                          onClick={() => {
                            setSelectedProjectId(prj.project_id);
                            setNewPrjNodeProjectId(prj.project_id);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            background: selectedProjectId === prj.project_id ? 'var(--neutral-100)' : 'transparent',
                            borderLeft: selectedProjectId === prj.project_id ? '4px solid var(--primary)' : '4px solid transparent'
                          }}
                        >
                          <td style={{ fontWeight: 700 }}>{prj.project_id}</td>
                          <td style={{ fontWeight: 600 }}>{prj.name}</td>
                          <td>{prj.start_year} - {prj.end_year}</td>
                          {isAuthorized && (
                            <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                              <button 
                                className="btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                                onClick={() => handleDeleteProject(prj.project_id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3>Project Results Chain Hierarchy Nodes</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                  Nodes defined under <strong>{selectedProjectId}</strong>:
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-200)', maxHeight: '350px', overflowY: 'auto' }}>
                  {projectNodes.filter(n => n.project_id === selectedProjectId).length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--neutral-500)' }}>
                      No nodes defined for this project yet.
                    </div>
                  ) : (
                    projectNodes.filter(n => n.project_id === selectedProjectId).map(node => {
                      const linkedInds = indicators.filter(ind => ind.associated_project_node_id === node.node_id);
                      return (
                        <div 
                          key={node.node_id} 
                          style={{ 
                            padding: '10px 12px', 
                            background: 'var(--white)', 
                            borderRadius: '4px', 
                            borderLeft: '3px solid var(--accent)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginLeft: node.parent_node_id ? '20px' : '0px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{node.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--neutral-600)', marginTop: '2px' }}>
                              <span style={{ fontWeight: 700 }}>{node.node_id}</span> | Level: {node.level_type} 
                              {node.parent_node_id && ` | Parent: ${node.parent_node_id}`}
                              {linkedInds.length > 0 && (
                                <div style={{ marginTop: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                                  🔗 KPI: {linkedInds.map(i => i.indicator_id).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{node.level_type}</span>
                            {isAuthorized && (
                              <button
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                                onClick={() => handleDeleteProjectNode(node.node_id)}
                                title="Delete Node"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          {/* Right Panel: Creation Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Form 1: Define New Project */}
            <div className="card" style={{ opacity: isAuthorized ? 1 : 0.75 }}>
              <h3>Define Strategic Project</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Register a new high-level project (e.g. World Bank HEET, SEQUIP).
              </p>
              
              <form onSubmit={isAuthorized ? handleCreateProject : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Project ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. PRJ-003" 
                      value={newPrjId}
                      onChange={e => setNewPrjId(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Start Year</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2026" 
                      value={newPrjStartYear}
                      onChange={e => setNewPrjStartYear(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>End Year</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2031" 
                      value={newPrjEndYear}
                      onChange={e => setNewPrjEndYear(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Project Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Secondary Education Quality Improvement Project" 
                    value={newPrjName}
                    onChange={e => setNewPrjName(e.target.value)}
                    required 
                    disabled={!isAuthorized}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ marginTop: '8px', padding: '10px', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                  disabled={!isAuthorized}
                >
                  💾 Save Strategic Project
                </button>
              </form>
            </div>

            {/* Form 2: Define New Project Node */}
            <div className="card" style={{ opacity: isAuthorized ? 1 : 0.75 }}>
              <h3>Define Project Node</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Add project components, components, or results areas to the selected project.
              </p>
              
              <form onSubmit={isAuthorized ? handleCreateProjectNode : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Node ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. PN-104" 
                      value={newPrjNodeId}
                      onChange={e => setNewPrjNodeId(e.target.value)}
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Level Type</span>
                      {isAuthorized && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newType = prompt("Enter new Level Type (e.g. Sub-Component, Activity Group):");
                            if (newType && newType.trim()) {
                              const trimmed = newType.trim();
                              if (prjLevelTypes.includes(trimmed)) {
                                alert("Level Type already exists!");
                              } else {
                                const updated = [...prjLevelTypes, trimmed];
                                setPrjLevelTypes(updated);
                                localStorage.setItem('me_prj_level_types', JSON.stringify(updated));
                                setNewPrjNodeLevelType(trimmed);
                              }
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                        >
                          + Add Custom
                        </button>
                      )}
                    </label>
                    <SearchableSelect
                      options={prjLevelTypes.map(type => ({ value: type, label: type }))}
                      value={newPrjNodeLevelType}
                      onChange={setNewPrjNodeLevelType}
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Project</label>
                    <SearchableSelect
                      options={projects.map(p => ({ value: p.project_id, label: `${p.project_id} - ${p.name.substring(0, 35)}...` }))}
                      value={newPrjNodeProjectId}
                      onChange={val => {
                        setNewPrjNodeProjectId(val);
                        setNewPrjNodeParentId('');
                      }}
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Parent Node (Optional)</label>
                    <SearchableSelect
                      options={[
                        { value: "", label: "None (Root Node)" },
                        ...projectNodes.filter(n => n.project_id === newPrjNodeProjectId).map(n => ({ value: n.node_id, label: `${n.node_id} - ${n.name.substring(0, 30)}` }))
                      ]}
                      value={newPrjNodeParentId}
                      onChange={setNewPrjNodeParentId}
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Linked KPI / Indicator (Optional)</label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None - Select KPI to Link" },
                      ...indicators.map(ind => ({ value: ind.indicator_id, label: `${ind.indicator_id}: ${ind.name}` }))
                    ]}
                    value={newPrjNodeIndicatorId}
                    onChange={setNewPrjNodeIndicatorId}
                    disabled={!isAuthorized}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Node Name / Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Infrastructure Modernization and Lab Kits" 
                    value={newPrjNodeName}
                    onChange={e => setNewPrjNodeName(e.target.value)}
                    required 
                    disabled={!isAuthorized}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ marginTop: '8px', padding: '10px', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                  disabled={!isAuthorized}
                >
                  🌿 Attach to Project Chain
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
      )}

    </div>
  );
}
