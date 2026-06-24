import React, { useState, useEffect } from 'react';
import { getTable, saveTable, logAction } from '../MockData';
import AuditLogViewer from '../components/AuditLogViewer';
import SearchableSelect from '../components/SearchableSelect';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmProvider';

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

  // Geography States
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [newRegId, setNewRegId] = useState('');
  const [newRegName, setNewRegName] = useState('');
  const [newDistId, setNewDistId] = useState('');
  const [newDistRegId, setNewDistRegId] = useState('');
  const [newDistName, setNewDistName] = useState('');

  // Organization States
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [newInstId, setNewInstId] = useState('');
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState('Ministry');
  const [newInstRegId, setNewInstRegId] = useState('');
  const [newInstDistId, setNewInstDistId] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [newDeptInstId, setNewDeptInstId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newSecId, setNewSecId] = useState('');
  const [newSecDeptId, setNewSecDeptId] = useState('');
  const [newSecName, setNewSecName] = useState('');

  // User Management Form States
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormDept, setUserFormDept] = useState('');
  const [userFormScopeType, setUserFormScopeType] = useState('super');
  const [userFormRegion, setUserFormRegion] = useState('');
  const [userFormProject, setUserFormProject] = useState('');
  const [userFormInst, setUserFormInst] = useState('');
  const [userFormSection, setUserFormSection] = useState('');
  const [userFormRole, setUserFormRole] = useState('School Data Entry Officer');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormPermissions, setUserFormPermissions] = useState(['view_dashboard', 'submit_data']);

  // Role Setup Form States
  const [roles, setRoles] = useState([]);
  const [subTab, setSubTab] = useState('users');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormDesc, setRoleFormDesc] = useState('');
  const [roleFormPermissions, setRoleFormPermissions] = useState(['view_dashboard']);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Indicator Form State
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [isEditingIndicator, setIsEditingIndicator] = useState(false);
  const [indFormId, setIndFormId] = useState('');
  const [indFormName, setIndFormName] = useState('');
  const [indFormType, setIndFormType] = useState('Output');
  const [indFormIsDerived, setIndFormIsDerived] = useState(false);
  const [indFormFormula, setIndFormFormula] = useState('');
  
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

  // Modal for adding custom level types (framework or project)
  const [showLevelTypeModal, setShowLevelTypeModal] = useState(false);
  const [levelTypeModalTarget, setLevelTypeModalTarget] = useState('framework');
  const [levelTypeInput, setLevelTypeInput] = useState('');

  const [integrations, setIntegrations] = useState([
    { system: 'SAS (School Registry API)', status: 'Active', lastSync: '2026-06-23T13:45:00Z', recordsSynced: 1240, errors: 0 },
    { system: 'ESMIS (HR/Personnel API)', status: 'Active', lastSync: '2026-06-23T11:20:00Z', recordsSynced: 3400, errors: 0 },
    { system: 'SQAS (Quality Assurance Inspection API)', status: 'Error', lastSync: '2026-06-23T14:10:00Z', recordsSynced: 400, errors: 3 }
  ]);

  // Loading
  useEffect(() => {
    setUsers(getTable('users'));
    setIndicators(getTable('indicators'));
    setRegions(getTable('regions'));
    setDistricts(getTable('districts'));
    setInstitutions(getTable('institutions'));
    setDepartments(getTable('departments'));
    setSections(getTable('sections'));
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

    setRoles(getTable('roles'));
  }, []);

  const { addToast } = useToast();
  const { showConfirm } = useConfirm();

  const openAddLevelTypeModal = (target) => {
    setLevelTypeModalTarget(target);
    setLevelTypeInput('');
    setShowLevelTypeModal(true);
  };

  const handleSaveLevelType = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = (levelTypeInput || '').trim();
    if (!trimmed) {
      addToast({ message: 'Please enter a level type name.', type: 'warning' });
      return;
    }
    if (levelTypeModalTarget === 'framework') {
      if (levelTypes.includes(trimmed)) {
        addToast({ message: 'Level Type already exists!', type: 'warning' });
        return;
      }
      const updated = [...levelTypes, trimmed];
      setLevelTypes(updated);
      localStorage.setItem('me_level_types', JSON.stringify(updated));
      setNewNodeLevelType(trimmed);
    } else {
      if (prjLevelTypes.includes(trimmed)) {
        addToast({ message: 'Level Type already exists!', type: 'warning' });
        return;
      }
      const updated = [...prjLevelTypes, trimmed];
      setPrjLevelTypes(updated);
      localStorage.setItem('me_prj_level_types', JSON.stringify(updated));
      setNewPrjNodeLevelType(trimmed);
    }
    addToast({ message: 'Level Type added.', type: 'success' });
    setShowLevelTypeModal(false);
  };

  const handleToggleRolePermission = (perm) => {
    setRoleFormPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSelectRoleForEdit = (targetRole) => {
    setIsEditingRole(true);
    setRoleFormName(targetRole.name);
    setRoleFormDesc(targetRole.description || '');
    setRoleFormPermissions(targetRole.default_permissions || []);
  };

  const handleCancelEditRole = () => {
    setIsEditingRole(false);
    setRoleFormName('');
    setRoleFormDesc('');
    setRoleFormPermissions(['view_dashboard']);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleFormName) {
      addToast({ message: 'Role Name is required.', type: 'warning' });
      return;
    }

    const currentRoles = getTable('roles');

    if (isEditingRole) {
      const updated = currentRoles.map(r => {
        if (r.name.toLowerCase() === roleFormName.toLowerCase()) {
          return {
            ...r,
            description: roleFormDesc,
            default_permissions: roleFormPermissions
          };
        }
        return r;
      });

      saveTable('roles', updated);
      setRoles(updated);
      logAction(user.username, 'UPDATE', 'Role Configuration', `Updated default permissions for role ${roleFormName}`);
      addToast({ message: 'Role configuration updated successfully.', type: 'success' });
      handleCancelEditRole();
    } else {
      if (currentRoles.some(r => r.name.toLowerCase() === roleFormName.toLowerCase())) {
        addToast({ message: 'A role with this name already exists.', type: 'warning' });
        return;
      }

      const newRole = {
        name: roleFormName,
        description: roleFormDesc,
        default_permissions: roleFormPermissions
      };

      const updated = [...currentRoles, newRole];
      saveTable('roles', updated);
      setRoles(updated);
      logAction(user.username, 'CREATE', 'Role Configuration', `Defined new system role: ${roleFormName}`);
      addToast({ message: 'New role defined successfully.', type: 'success' });
      handleCancelEditRole();
    }
  };

  const handleDeleteRole = (roleNameToDelete) => {
    if (roleNameToDelete === 'System Administrator') {
      addToast({ message: 'The System Administrator role is a core configuration and cannot be deleted!', type: 'warning' });
      return;
    }

    (async () => {
      const ok = await showConfirm({ title: 'Delete Role', message: `Are you sure you want to delete the role "${roleNameToDelete}"?` });
      if (!ok) return;
      const currentRoles = getTable('roles');
      const updated = currentRoles.filter(r => r.name.toLowerCase() !== roleNameToDelete.toLowerCase());

      saveTable('roles', updated);
      setRoles(updated);
      logAction(user.username, 'DELETE', 'Role Configuration', `Deleted role: ${roleNameToDelete}`);
      addToast({ message: 'Role configuration deleted successfully.', type: 'success' });
    })();
  };

  const handleTogglePermission = (perm) => {
    setUserFormPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleRoleChangeInForm = (role) => {
    setUserFormRole(role);
    switch (role) {
      case 'System Administrator':
        setUserFormPermissions(['view_dashboard', 'submit_data', 'verify_data', 'approve_data', 'manage_settings']);
        break;
      case 'MoEST Leadership':
        setUserFormPermissions(['view_dashboard', 'approve_data']);
        break;
      case 'National M&E Officer':
        setUserFormPermissions(['view_dashboard', 'submit_data', 'verify_data', 'manage_settings']);
        break;
      case 'Regional M&E Officer':
        setUserFormPermissions(['view_dashboard', 'submit_data', 'verify_data']);
        break;
      case 'District Education Officer':
      case 'School Data Entry Officer':
      default:
        setUserFormPermissions(['view_dashboard', 'submit_data']);
        break;
    }
  };

  const handleSelectUserForEdit = (targetUser) => {
    setIsEditingUser(true);
    setUserFormName(targetUser.name);
    setUserFormEmail(targetUser.username);
    setUserFormDept(targetUser.dept_id || '');
    setUserFormRole(targetUser.role);
    setUserFormPermissions(targetUser.permissions || []);
    setUserFormPassword('');
    
    if (targetUser.is_super_user) {
      setUserFormScopeType('super');
    } else if (targetUser.region_id) {
      setUserFormScopeType('regional');
      setUserFormRegion(targetUser.region_id);
    } else if (targetUser.project_id) {
      setUserFormScopeType('project');
      setUserFormProject(targetUser.project_id);
    } else {
      setUserFormScopeType('organizational');
      setUserFormInst(targetUser.inst_id || '');
      setUserFormSection(targetUser.section_id || '');
    }

    setShowUserModal(true);
  };

  const handleCancelEditUser = () => {
    setIsEditingUser(false);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormDept('');
    setUserFormRole('School Data Entry Officer');
    setUserFormPermissions(['view_dashboard', 'submit_data']);
    setUserFormPassword('');
    
    setUserFormScopeType('super');
    setUserFormRegion('');
    setUserFormProject('');
    setUserFormInst('');
    setUserFormSection('');

    setShowUserModal(false);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userFormName || !userFormEmail || !userFormRole) {
      addToast({ message: 'Please fill out all required fields.', type: 'warning' });
      return;
    }

    const currentUsers = getTable('users');
    
    const baseUser = {
      name: userFormName,
      role: userFormRole,
      permissions: userFormPermissions,
      is_super_user: userFormScopeType === 'super',
      region_id: userFormScopeType === 'regional' ? userFormRegion : null,
      project_id: userFormScopeType === 'project' ? userFormProject : null,
      inst_id: userFormScopeType === 'organizational' ? userFormInst : null,
      dept_id: userFormScopeType === 'organizational' ? userFormDept : null,
      section_id: userFormScopeType === 'organizational' ? userFormSection : null,
      dept: '' // Legacy fallback
    };

    if (isEditingUser) {
      const updated = currentUsers.map(u => {
        if (u.username.toLowerCase() === userFormEmail.toLowerCase()) {
          const updatedUser = {
            ...u,
            ...baseUser
          };
          if (userFormPassword) {
            updatedUser.password = userFormPassword;
          }
          return updatedUser;
        }
        return u;
      });

      saveTable('users', updated);
      setUsers(updated);
      logAction(user.username, 'UPDATE', 'User Scopes', `Updated role/permissions for user ${userFormEmail}`);
      addToast({ message: 'User settings updated successfully.', type: 'success' });
      handleCancelEditUser();
    } else {
      if (currentUsers.some(u => u.username.toLowerCase() === userFormEmail.toLowerCase())) {
        addToast({ message: 'A user with this email/username already exists.', type: 'warning' });
        return;
      }

      const newUser = {
        ...baseUser,
        username: userFormEmail,
        password: userFormPassword || 'password123'
      };

      const updated = [...currentUsers, newUser];
      saveTable('users', updated);
      setUsers(updated);
      logAction(user.username, 'CREATE', 'User registration', `Registered new user: ${userFormEmail} as ${userFormRole}`);
      addToast({ message: 'User registered successfully.', type: 'success' });
      handleCancelEditUser();
    }
  };

  const handleDeleteUser = (usernameToDelete) => {
    if (usernameToDelete.toLowerCase() === user.username.toLowerCase()) {
      addToast({ message: 'You cannot delete your own account while logged in!', type: 'warning' });
      return;
    }

    (async () => {
      const ok = await showConfirm({ title: 'Delete User', message: `Are you sure you want to delete user ${usernameToDelete}?` });
      if (!ok) return;

      const currentUsers = getTable('users');
      const updated = currentUsers.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());

      saveTable('users', updated);
      setUsers(updated.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role,
        dept: u.dept,
        permissions: u.permissions
      })));
      logAction(user.username, 'DELETE', 'User management', `Deleted user account: ${usernameToDelete}`);
      addToast({ message: 'User account deleted successfully.', type: 'success' });
    })();
  };

  const handleCreateRegion = (e) => {
    e.preventDefault();
    if (!newRegId || !newRegName) return addToast({ message: 'Please fill all fields', type: 'warning' });
    const current = getTable('regions');
    if (current.some(r => r.region_id.toLowerCase() === newRegId.toLowerCase())) return addToast({ message: 'Region ID exists', type: 'warning' });
    const newEntry = { region_id: newRegId.toUpperCase(), name: newRegName };
    const updated = [...current, newEntry];
    saveTable('regions', updated);
    setRegions(updated);
    logAction(user.username, 'CREATE', 'Geography', `Added region: ${newRegName}`);
    setNewRegId(''); setNewRegName('');
    addToast({ message: 'Region created', type: 'success' });
  };

  const handleDeleteRegion = (id) => {
    if (!isAuthorized) return addToast({ message: 'Permission Error', type: 'warning' });
    if (districts.some(d => d.region_id === id)) return addToast({ message: 'Cannot delete region with districts', type: 'warning' });
    (async () => {
      const ok = await showConfirm({ title: 'Delete Region', message: 'Are you sure you want to delete this region?' });
      if (!ok) return;
      const updated = regions.filter(r => r.region_id !== id);
      saveTable('regions', updated);
      setRegions(updated);
      logAction(user.username, 'DELETE', 'Geography', `Deleted region: ${id}`);
      addToast({ message: 'Region deleted', type: 'success' });
    })();
  };

  const handleCreateDistrict = (e) => {
    e.preventDefault();
    if (!newDistId || !newDistRegId || !newDistName) return addToast({ message: 'Please fill all fields', type: 'warning' });
    const current = getTable('districts');
    if (current.some(d => d.district_id.toLowerCase() === newDistId.toLowerCase())) return addToast({ message: 'District ID exists', type: 'warning' });
    const newEntry = { district_id: newDistId.toUpperCase(), region_id: newDistRegId, name: newDistName };
    const updated = [...current, newEntry];
    saveTable('districts', updated);
    setDistricts(updated);
    logAction(user.username, 'CREATE', 'Geography', `Added district: ${newDistName}`);
    setNewDistId(''); setNewDistName(''); setNewDistRegId('');
    addToast({ message: 'District created', type: 'success' });
  };

  const handleDeleteDistrict = (id) => {
    if (!isAuthorized) return addToast({ message: 'Permission Error', type: 'warning' });
    (async () => {
      const ok = await showConfirm({ title: 'Delete District', message: 'Are you sure you want to delete this district?' });
      if (!ok) return;
      const updated = districts.filter(d => d.district_id !== id);
      saveTable('districts', updated);
      setDistricts(updated);
      logAction(user.username, 'DELETE', 'Geography', `Deleted district: ${id}`);
      addToast({ message: 'District deleted', type: 'success' });
    })();
  };

  const handleCreateInstitution = (e) => {
    e.preventDefault();
    if (!newInstId || !newInstName || !newInstType) return addToast({ message: 'Please fill all required fields', type: 'warning' });
    const current = getTable('institutions');
    if (current.some(i => i.inst_id.toLowerCase() === newInstId.toLowerCase())) return addToast({ message: 'Institution ID exists', type: 'warning' });
    const newEntry = { 
      inst_id: newInstId.toUpperCase(), 
      name: newInstName, 
      type: newInstType, 
      region_id: newInstRegId || null, 
      district_id: newInstDistId || null 
    };
    const updated = [...current, newEntry];
    saveTable('institutions', updated);
    setInstitutions(updated);
    logAction(user.username, 'CREATE', 'Organization', `Added institution: ${newInstName}`);
    setNewInstId(''); setNewInstName(''); setNewInstRegId(''); setNewInstDistId('');
    addToast({ message: 'Institution created', type: 'success' });
  };

  const handleDeleteInstitution = (id) => {
    if (!isAuthorized) return addToast({ message: 'Permission Error', type: 'warning' });
    if (departments.some(d => d.inst_id === id)) return addToast({ message: 'Cannot delete institution with departments', type: 'warning' });
    (async () => {
      const ok = await showConfirm({ title: 'Delete Institution', message: 'Are you sure you want to delete this institution?' });
      if (!ok) return;
      const updated = institutions.filter(i => i.inst_id !== id);
      saveTable('institutions', updated);
      setInstitutions(updated);
      logAction(user.username, 'DELETE', 'Organization', `Deleted institution: ${id}`);
      addToast({ message: 'Institution deleted', type: 'success' });
    })();
  };

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!newDeptId || !newDeptInstId || !newDeptName) return addToast({ message: 'Please fill all fields', type: 'warning' });
    const current = getTable('departments');
    if (current.some(d => d.dept_id.toLowerCase() === newDeptId.toLowerCase())) return addToast({ message: 'Department ID exists', type: 'warning' });
    const newEntry = { dept_id: newDeptId.toUpperCase(), inst_id: newDeptInstId, name: newDeptName };
    const updated = [...current, newEntry];
    saveTable('departments', updated);
    setDepartments(updated);
    logAction(user.username, 'CREATE', 'Organization', `Added department: ${newDeptName}`);
    setNewDeptId(''); setNewDeptName(''); setNewDeptInstId('');
    addToast({ message: 'Department created', type: 'success' });
  };

  const handleDeleteDepartment = (id) => {
    if (!isAuthorized) return addToast({ message: 'Permission Error', type: 'warning' });
    if (sections.some(s => s.dept_id === id)) return addToast({ message: 'Cannot delete department with sections', type: 'warning' });
    (async () => {
      const ok = await showConfirm({ title: 'Delete Department', message: 'Are you sure you want to delete this department?' });
      if (!ok) return;
      const updated = departments.filter(d => d.dept_id !== id);
      saveTable('departments', updated);
      setDepartments(updated);
      logAction(user.username, 'DELETE', 'Organization', `Deleted department: ${id}`);
      addToast({ message: 'Department deleted', type: 'success' });
    })();
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSecId || !newSecDeptId || !newSecName) return addToast({ message: 'Please fill all fields', type: 'warning' });
    const current = getTable('sections');
    if (current.some(s => s.section_id.toLowerCase() === newSecId.toLowerCase())) return addToast({ message: 'Section ID exists', type: 'warning' });
    const newEntry = { section_id: newSecId.toUpperCase(), dept_id: newSecDeptId, name: newSecName };
    const updated = [...current, newEntry];
    saveTable('sections', updated);
    setSections(updated);
    logAction(user.username, 'CREATE', 'Organization', `Added section: ${newSecName}`);
    setNewSecId(''); setNewSecName(''); setNewSecDeptId('');
    addToast({ message: 'Section created', type: 'success' });
  };

  const handleDeleteSection = (id) => {
    if (!isAuthorized) return addToast({ message: 'Permission Error', type: 'warning' });
    (async () => {
      const ok = await showConfirm({ title: 'Delete Section', message: 'Are you sure you want to delete this section?' });
      if (!ok) return;
      const updated = sections.filter(s => s.section_id !== id);
      saveTable('sections', updated);
      setSections(updated);
      logAction(user.username, 'DELETE', 'Organization', `Deleted section: ${id}`);
      addToast({ message: 'Section deleted', type: 'success' });
    })();
  };

  const handleCreateFramework = (e) => {
    e.preventDefault();
    if (!newFwId || !newFwName || !newFwStartYear || !newFwEndYear) {
      addToast({ message: 'Please fill all fields', type: 'warning' });
      return;
    }

    const currentFws = getTable('frameworks');
    if (currentFws.some(f => f.framework_id.toLowerCase() === newFwId.toLowerCase())) {
      addToast({ message: 'Framework ID already exists!', type: 'warning' });
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
    addToast({ message: 'Strategic Framework defined successfully in portal registry.', type: 'success' });
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newNodeId || !newNodeFwId || !newNodeLevelType || !newNodeName) {
      addToast({ message: 'Please fill all fields', type: 'warning' });
      return;
    }

    const currentNodes = getTable('nodes');
    if (currentNodes.some(n => n.node_id.toLowerCase() === newNodeId.toLowerCase())) {
      addToast({ message: 'Node ID already exists!', type: 'warning' });
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
    addToast({ message: 'Framework Node successfully attached to results chain.', type: 'success' });
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newPrjId || !newPrjName || !newPrjStartYear || !newPrjEndYear) {
      addToast({ message: 'Please fill all fields', type: 'warning' });
      return;
    }

    const currentPrjs = getTable('projects');
    if (currentPrjs.some(p => p.project_id.toLowerCase() === newPrjId.toLowerCase())) {
      addToast({ message: 'Project ID already exists!', type: 'warning' });
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
    addToast({ message: 'Project defined successfully in portal registry.', type: 'success' });
  };

  const handleCreateProjectNode = (e) => {
    e.preventDefault();
    if (!newPrjNodeId || !newPrjNodeProjectId || !newPrjNodeLevelType || !newPrjNodeName) {
      addToast({ message: 'Please fill all fields', type: 'warning' });
      return;
    }

    const currentNodes = getTable('project_nodes');
    if (currentNodes.some(n => n.node_id.toLowerCase() === newPrjNodeId.toLowerCase())) {
      addToast({ message: 'Node ID already exists!', type: 'warning' });
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
    addToast({ message: 'Project Node successfully attached to results chain.', type: 'success' });
  };

  const handleDeleteFramework = (fwId) => {
    if (!isAuthorized) {
      addToast({ message: 'Permission Error: You are not authorized to modify settings.', type: 'warning' });
      return;
    }
    (async () => {
      const ok = await showConfirm({ title: 'Delete Framework', message: `Are you sure you want to delete strategic framework ${fwId}? All associated nodes and targets will be affected.` });
      if (!ok) return;

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
      addToast({ message: `Framework ${fwId} and its associated nodes deleted successfully.`, type: 'success' });
    })();
  };

  const handleDeleteNode = (nodeId) => {
    if (!isAuthorized) {
      addToast({ message: 'Permission Error: You are not authorized to modify settings.', type: 'warning' });
      return;
    }
    const currentNodes = getTable('nodes');
    const hasChildren = currentNodes.some(n => n.parent_node_id === nodeId);
    if (hasChildren) {
      addToast({ message: 'Validation Error: Cannot delete a parent node that has children. Please delete all children nodes first.', type: 'warning' });
      return;
    }
    (async () => {
      const ok = await showConfirm({ title: 'Delete Node', message: `Are you sure you want to delete node ${nodeId}?` });
      if (!ok) return;

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
      addToast({ message: `Node ${nodeId} deleted successfully.`, type: 'success' });
    })();
  };

  const handleDeleteProject = (prjId) => {
    if (!isAuthorized) {
      addToast({ message: 'Permission Error: You are not authorized to modify settings.', type: 'warning' });
      return;
    }
    (async () => {
      const ok = await showConfirm({ title: 'Delete Project', message: `Are you sure you want to delete project ${prjId}? All associated nodes will be affected.` });
      if (!ok) return;

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
      addToast({ message: `Project ${prjId} and its associated nodes deleted successfully.`, type: 'success' });
    })();
  };

  const handleDeleteProjectNode = (nodeId) => {
    if (!isAuthorized) {
      addToast({ message: 'Permission Error: You are not authorized to modify settings.', type: 'warning' });
      return;
    }
    const currentPrjNodes = getTable('project_nodes');
    const hasChildren = currentPrjNodes.some(n => n.parent_node_id === nodeId);
    if (hasChildren) {
      addToast({ message: 'Validation Error: Cannot delete a parent node that has children. Please delete all children nodes first.', type: 'warning' });
      return;
    }
    (async () => {
      const ok = await showConfirm({ title: 'Delete Project Node', message: `Are you sure you want to delete project node ${nodeId}?` });
      if (!ok) return;

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
      addToast({ message: `Project node ${nodeId} deleted successfully.`, type: 'success' });
    })();
  };

  const handleDeleteIndicator = (indId) => {
    if (!isAuthorized) {
      addToast({ message: 'Permission Error: You are not authorized to modify settings.', type: 'warning' });
      return;
    }
    (async () => {
      const ok = await showConfirm({ title: 'Delete Indicator', message: `Are you sure you want to delete indicator ${indId}? This will remove the indicator from all mappings and dashboards.` });
      if (!ok) return;

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
      addToast({ message: `Indicator ${indId} deleted successfully.`, type: 'success' });
    })();
  };

  const handleSelectIndicatorForEdit = (ind) => {
    setIsEditingIndicator(true);
    setIndFormId(ind.indicator_id);
    setIndFormName(ind.name);
    setIndFormType(ind.type);
    setIndFormIsDerived(!!ind.is_derived);
    setIndFormFormula(ind.formula || '');
    setShowIndicatorModal(true);
  };

  const handleAddIndicatorClick = () => {
    setIsEditingIndicator(false);
    setIndFormId(`IND-${String(indicators.length + 1).padStart(3, '0')}`);
    setIndFormName('');
    setIndFormType('Output');
    setIndFormIsDerived(false);
    setIndFormFormula('');
    setShowIndicatorModal(true);
  };

  const handleSaveIndicator = (e) => {
    e.preventDefault();
    if (!indFormId || !indFormName) {
      addToast({ message: 'ID and Name are required', type: 'warning' });
      return;
    }
    if (indFormIsDerived && !indFormFormula) {
      addToast({ message: 'Formula is required for Secondary KPIs', type: 'warning' });
      return;
    }
    
    const currentInds = getTable('indicators');
    if (isEditingIndicator) {
      const updated = currentInds.map(i => {
        if (i.indicator_id === indFormId) {
          return {
            ...i,
            name: indFormName,
            type: indFormType,
            is_derived: indFormIsDerived,
            formula: indFormIsDerived ? indFormFormula : null
          };
        }
        return i;
      });
      saveTable('indicators', updated);
      setIndicators(updated);
      logAction(user.username, 'UPDATE', 'Indicator', `Updated indicator ${indFormId}`);
      addToast({ message: 'Indicator updated successfully', type: 'success' });
    } else {
      if (currentInds.some(i => i.indicator_id === indFormId)) {
        addToast({ message: 'Indicator ID already exists!', type: 'warning' });
        return;
      }
      const newInd = {
        indicator_id: indFormId,
        name: indFormName,
        type: indFormType,
        is_derived: indFormIsDerived,
        formula: indFormIsDerived ? indFormFormula : null,
        associated_node_id: null,
        associated_project_node_id: null,
        associated_activity_id: null
      };
      const updated = [...currentInds, newInd];
      saveTable('indicators', updated);
      setIndicators(updated);
      logAction(user.username, 'CREATE', 'Indicator', `Created new indicator ${indFormId}`);
      addToast({ message: 'Indicator created successfully', type: 'success' });
    }
    setShowIndicatorModal(false);
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
      addToast({ message: `${finished[systemIndex].system} synchronized successfully!`, type: 'success' });
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
            color: activeTab === 'geography' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'geography' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('geography')}
        >
          🌍 Geography
        </button>
        <button 
          className="btn" 
          style={{ 
            borderRadius: '0', 
            background: 'transparent', 
            color: activeTab === 'organization' ? 'var(--primary)' : 'var(--neutral-600)',
            borderBottom: activeTab === 'organization' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: 600,
            padding: '12px 20px'
          }} 
          onClick={() => setActiveTab('organization')}
        >
          🏢 Organization
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Sub-Tabs Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-300)', gap: '12px', paddingBottom: '10px', marginBottom: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ 
                background: subTab === 'users' ? 'var(--primary)' : 'transparent',
                color: subTab === 'users' ? 'white' : 'var(--neutral-700)',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
              onClick={() => setSubTab('users')}
            >
              👤 Users Management
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ 
                background: subTab === 'roles' ? 'var(--primary)' : 'transparent',
                color: subTab === 'roles' ? 'white' : 'var(--neutral-700)',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
              onClick={() => setSubTab('roles')}
            >
              🔑 Role Registry Setup
            </button>
          </div>

          {subTab === 'users' && (
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'start' }}>
              
              {!isAuthorized && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  color: '#b45309',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  gridColumn: '1 / span 2',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>⚠️</span>
                  <div>
                    <strong>Read-Only View:</strong> You are not authorized to modify user accounts or assign system permissions.
                  </div>
                </div>
              )}

          {/* Left Panel: Users List */}
          <div className="card">
            <h3>System Users and Scopes</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
              List of registered actors, roles, and assigned granular system permissions.
            </p>
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email / Username</th>
                    <th>Role</th>
                    <th>Scope / Entity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.username}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.username}</td>
                      <td><span className="badge badge-info">{u.role}</span></td>
                      <td>
                        {u.is_super_user && <span style={{ color: 'var(--success)', fontWeight: 600 }}>🌍 Super User</span>}
                        {!u.is_super_user && u.region_id && <span>📍 Regional ({regions.find(r => r.region_id === u.region_id)?.name || u.region_id})</span>}
                        {!u.is_super_user && u.project_id && <span>📁 Project ({projects.find(p => p.project_id === u.project_id)?.name || u.project_id})</span>}
                        {!u.is_super_user && !u.region_id && !u.project_id && u.inst_id && (
                          <span>🏢 {institutions.find(i => i.inst_id === u.inst_id)?.name || u.inst_id}</span>
                        )}
                        {!u.is_super_user && !u.region_id && !u.project_id && !u.inst_id && <span>{u.dept || 'Unassigned'}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                            onClick={() => isAuthorized ? handleSelectUserForEdit(u) : null}
                            disabled={!isAuthorized}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', opacity: isAuthorized ? 1 : 0.5, cursor: isAuthorized ? 'pointer' : 'not-allowed' }}
                            onClick={() => isAuthorized ? handleDeleteUser(u.username) : null}
                            disabled={!isAuthorized}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Add or Edit User Form */}
          <div className="card" style={{ opacity: isAuthorized ? 1 : 0.75 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{isEditingUser ? 'Edit User Permissions' : 'Register New User'}</h3>
              <button type="button" className="btn btn-primary" onClick={() => { handleCancelEditUser(); setShowUserModal(true); }} disabled={!isAuthorized}>
                + New User
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
              {isEditingUser ? 'Modify user details, role, and custom scopes.' : 'Create a new user account with role and granular permissions.'}
            </p>

            <form onSubmit={isAuthorized ? handleSaveUser : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. John Doe"
                  value={userFormName}
                  onChange={e => setUserFormName(e.target.value)}
                  required 
                  disabled={!isAuthorized}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email / Username</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. jdoe@moe.go.tz"
                  value={userFormEmail}
                  onChange={e => setUserFormEmail(e.target.value)}
                  required 
                  disabled={!isAuthorized || isEditingUser}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Department / Division</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Primary Education Division"
                  value={userFormDept}
                  onChange={e => setUserFormDept(e.target.value)}
                  disabled={!isAuthorized}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assigned Role</label>
                <select 
                  className="form-control"
                  value={userFormRole}
                  onChange={e => handleRoleChangeInForm(e.target.value)}
                  required
                  disabled={!isAuthorized || user?.role !== 'System Administrator'}
                  title={user?.role !== 'System Administrator' ? "Only System Administrators can assign roles to users" : ""}
                >
                  {roles.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Password {isEditingUser && <span style={{ color: 'var(--neutral-500)', fontWeight: 400 }}>(leave blank to keep current)</span>}
                </label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder={isEditingUser ? "••••••••" : "Password (min 6 chars)"}
                  value={userFormPassword}
                  onChange={e => setUserFormPassword(e.target.value)}
                  required={!isEditingUser}
                  disabled={!isAuthorized}
                />
              </div>

              {/* Permissions Checkbox Grid */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>System Permissions</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={userFormPermissions.includes('view_dashboard')}
                      onChange={() => handleTogglePermission('view_dashboard')}
                      disabled={!isAuthorized}
                    />
                    <span>📊 View Dashboard & Performance KPIs</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={userFormPermissions.includes('submit_data')}
                      onChange={() => handleTogglePermission('submit_data')}
                      disabled={!isAuthorized}
                    />
                    <span>📝 Submit/Edit Actual Data Entries</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={userFormPermissions.includes('verify_data')}
                      onChange={() => handleTogglePermission('verify_data')}
                      disabled={!isAuthorized}
                    />
                    <span>🔍 Verify Submissions (Workflow Step 1)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={userFormPermissions.includes('approve_data')}
                      onChange={() => handleTogglePermission('approve_data')}
                      disabled={!isAuthorized}
                    />
                    <span>✅ Approve Submissions (Workflow Step 2)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={userFormPermissions.includes('manage_settings')}
                      onChange={() => handleTogglePermission('manage_settings')}
                      disabled={!isAuthorized}
                    />
                    <span>⚙️ Manage Settings & Structures</span>
                  </label>

                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!isAuthorized}>
                  {isEditingUser ? 'Update User' : 'Register User'}
                </button>
                {isEditingUser && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCancelEditUser}
                    disabled={!isAuthorized}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          {showUserModal && (
            <Modal title={isEditingUser ? 'Edit User' : 'Register New User'} onClose={() => { setShowUserModal(false); handleCancelEditUser(); }} footer={null}>
              <form onSubmit={isAuthorized ? handleSaveUser : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
                  <input type="text" className="form-control" placeholder="e.g. John Doe" value={userFormName} onChange={e => setUserFormName(e.target.value)} required disabled={!isAuthorized} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email / Username</label>
                  <input type="email" className="form-control" placeholder="e.g. jdoe@moe.go.tz" value={userFormEmail} onChange={e => setUserFormEmail(e.target.value)} required disabled={!isAuthorized || isEditingUser} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>User Scope</label>
                  <select className="form-control" value={userFormScopeType} onChange={e => setUserFormScopeType(e.target.value)} disabled={!isAuthorized}>
                    <option value="super">Super User (View All)</option>
                    <option value="regional">Regional User</option>
                    <option value="organizational">Institutional/Organizational User</option>
                    <option value="project">Project User</option>
                  </select>
                </div>
                
                {userFormScopeType === 'regional' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Region</label>
                    <select className="form-control" value={userFormRegion} onChange={e => setUserFormRegion(e.target.value)} required disabled={!isAuthorized}>
                      <option value="">-- Select Region --</option>
                      {regions.map(r => <option key={r.region_id} value={r.region_id}>{r.name}</option>)}
                    </select>
                  </div>
                )}
                
                {userFormScopeType === 'project' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Project</label>
                    <select className="form-control" value={userFormProject} onChange={e => setUserFormProject(e.target.value)} required disabled={!isAuthorized}>
                      <option value="">-- Select Project --</option>
                      {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                
                {userFormScopeType === 'organizational' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Institution</label>
                      <select className="form-control" value={userFormInst} onChange={e => setUserFormInst(e.target.value)} required disabled={!isAuthorized}>
                        <option value="">-- Select Institution --</option>
                        {institutions.map(i => <option key={i.inst_id} value={i.inst_id}>{i.name}</option>)}
                      </select>
                    </div>
                    {userFormInst && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Department (Optional)</label>
                        <select className="form-control" value={userFormDept} onChange={e => setUserFormDept(e.target.value)} disabled={!isAuthorized}>
                          <option value="">-- All Departments --</option>
                          {departments.filter(d => d.inst_id === userFormInst).map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                        </select>
                      </div>
                    )}
                    {userFormDept && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Section (Optional)</label>
                        <select className="form-control" value={userFormSection} onChange={e => setUserFormSection(e.target.value)} disabled={!isAuthorized}>
                          <option value="">-- All Sections --</option>
                          {sections.filter(s => s.dept_id === userFormDept).map(s => <option key={s.section_id} value={s.section_id}>{s.name}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assigned Role</label>
                  <select className="form-control" value={userFormRole} onChange={e => handleRoleChangeInForm(e.target.value)} required disabled={!isAuthorized || user?.role !== 'System Administrator'} title={user?.role !== 'System Administrator' ? "Only System Administrators can assign roles to users" : ""}>
                    {roles.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password {isEditingUser && <span style={{ color: 'var(--neutral-500)', fontWeight: 400 }}>(leave blank to keep current)</span>}</label>
                  <input type="password" className="form-control" placeholder={isEditingUser ? "••••••••" : "Password (min 6 chars)"} value={userFormPassword} onChange={e => setUserFormPassword(e.target.value)} required={!isEditingUser} disabled={!isAuthorized} />
                </div>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>System Permissions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)' }}>
                    {/* Permissions checkboxes (same as inline form) */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                      <input type="checkbox" checked={userFormPermissions.includes('view_dashboard')} onChange={() => handleTogglePermission('view_dashboard')} disabled={!isAuthorized} />
                      <span>📊 View Dashboard & Performance KPIs</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                      <input type="checkbox" checked={userFormPermissions.includes('submit_data')} onChange={() => handleTogglePermission('submit_data')} disabled={!isAuthorized} />
                      <span>📝 Submit/Edit Actual Data Entries</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                      <input type="checkbox" checked={userFormPermissions.includes('verify_data')} onChange={() => handleTogglePermission('verify_data')} disabled={!isAuthorized} />
                      <span>🔍 Verify Submissions (Workflow Step 1)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                      <input type="checkbox" checked={userFormPermissions.includes('approve_data')} onChange={() => handleTogglePermission('approve_data')} disabled={!isAuthorized} />
                      <span>✅ Approve Submissions (Workflow Step 2)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: isAuthorized ? 'pointer' : 'not-allowed' }}>
                      <input type="checkbox" checked={userFormPermissions.includes('manage_settings')} onChange={() => handleTogglePermission('manage_settings')} disabled={!isAuthorized} />
                      <span>⚙️ Manage Settings & Structures</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!isAuthorized}>{isEditingUser ? 'Update User' : 'Register User'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowUserModal(false); handleCancelEditUser(); }} disabled={!isAuthorized}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}
          {showLevelTypeModal && (
            <Modal title="Add Level Type" onClose={() => setShowLevelTypeModal(false)} footer={null}>
              <form onSubmit={handleSaveLevelType} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Level Type Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Sub-Programme" value={levelTypeInput} onChange={e => setLevelTypeInput(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLevelTypeModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {subTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'start' }}>
          
          {user?.role !== 'System Administrator' && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              gridColumn: '1 / span 2',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>⚠️</span>
              <div>
                <strong>Read-Only View:</strong> Only System Administrators can configure system roles and default permissions.
              </div>
            </div>
          )}

          {/* Left Panel: Roles List */}
          <div className="card">
            <h3>Role Registry Setup</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
              Manage system roles and configure their default system permission scopes.
            </p>
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Default Permissions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.name}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '200px', wordBreak: 'break-word' }}>{r.description}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {r.default_permissions?.map(p => (
                            <span key={p} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                              {p.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', opacity: user?.role === 'System Administrator' ? 1 : 0.5, cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}
                            onClick={() => user?.role === 'System Administrator' ? handleSelectRoleForEdit(r) : null}
                            disabled={user?.role !== 'System Administrator'}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', opacity: user?.role === 'System Administrator' && r.name !== 'System Administrator' ? 1 : 0.5, cursor: user?.role === 'System Administrator' && r.name !== 'System Administrator' ? 'pointer' : 'not-allowed' }}
                            onClick={() => user?.role === 'System Administrator' ? handleDeleteRole(r.name) : null}
                            disabled={user?.role !== 'System Administrator' || r.name === 'System Administrator'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Add/Edit Role Form */}
          <div className="card" style={{ opacity: user?.role === 'System Administrator' ? 1 : 0.75 }}>
            <h3>{isEditingRole ? 'Edit Role Structure' : 'Define New System Role'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
              {isEditingRole ? 'Modify description and default permissions for this role.' : 'Register a new role and establish its starting permission set.'}
            </p>

            <form onSubmit={user?.role === 'System Administrator' ? handleSaveRole : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Role Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Monitoring Specialist"
                  value={roleFormName}
                  onChange={e => setRoleFormName(e.target.value)}
                  required 
                  disabled={user?.role !== 'System Administrator' || isEditingRole}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Brief scope summary..."
                  value={roleFormDesc}
                  onChange={e => setRoleFormDesc(e.target.value)}
                  disabled={user?.role !== 'System Administrator'}
                />
              </div>

              {/* Default Permissions Checkbox Grid */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Default Permissions</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={roleFormPermissions.includes('view_dashboard')}
                      onChange={() => handleToggleRolePermission('view_dashboard')}
                      disabled={user?.role !== 'System Administrator'}
                    />
                    <span>📊 View Dashboard & Performance KPIs</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={roleFormPermissions.includes('submit_data')}
                      onChange={() => handleToggleRolePermission('submit_data')}
                      disabled={user?.role !== 'System Administrator'}
                    />
                    <span>📝 Submit/Edit Actual Data Entries</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={roleFormPermissions.includes('verify_data')}
                      onChange={() => handleToggleRolePermission('verify_data')}
                      disabled={user?.role !== 'System Administrator'}
                    />
                    <span>🔍 Verify Submissions (Workflow Step 1)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={roleFormPermissions.includes('approve_data')}
                      onChange={() => handleToggleRolePermission('approve_data')}
                      disabled={user?.role !== 'System Administrator'}
                    />
                    <span>✅ Approve Submissions (Workflow Step 2)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: user?.role === 'System Administrator' ? 'pointer' : 'not-allowed' }}>
                    <input 
                      type="checkbox"
                      checked={roleFormPermissions.includes('manage_settings')}
                      onChange={() => handleToggleRolePermission('manage_settings')}
                      disabled={user?.role !== 'System Administrator'}
                    />
                    <span>⚙️ Manage Settings & Structures</span>
                  </label>

                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={user?.role !== 'System Administrator'}>
                  {isEditingRole ? 'Update Role' : 'Register Role'}
                </button>
                {isEditingRole && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCancelEditRole}
                    disabled={user?.role !== 'System Administrator'}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
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
              onClick={() => isAuthorized ? handleAddIndicatorClick() : null}
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
                          onClick={() => isAuthorized ? handleSelectIndicatorForEdit(ind) : null}
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
          {showIndicatorModal && (
            <Modal title={isEditingIndicator ? 'Edit KPI Indicator' : 'Register New KPI'} onClose={() => setShowIndicatorModal(false)} footer={null}>
              <form onSubmit={handleSaveIndicator} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Indicator ID</label>
                  <input type="text" className="form-control" value={indFormId} onChange={e => setIndFormId(e.target.value)} required disabled={isEditingIndicator} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Indicator Name</label>
                  <input type="text" className="form-control" value={indFormName} onChange={e => setIndFormName(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>KPI Type</label>
                  <select className="form-control" value={indFormType} onChange={e => setIndFormType(e.target.value)}>
                    <option value="Input">Input</option>
                    <option value="Output">Output</option>
                    <option value="Outcome">Outcome</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input type="checkbox" id="isDerivedToggle" checked={indFormIsDerived} onChange={e => {
                    setIndFormIsDerived(e.target.checked);
                    if (!e.target.checked) setIndFormFormula('');
                  }} />
                  <label htmlFor="isDerivedToggle" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Is Secondary KPI (Calculated from Formula)?</label>
                </div>

                {indFormIsDerived && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Formula Builder</label>
                    <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--neutral-600)' }}>Use standard math operators (+, -, *, /, ()). Select primary KPIs below to insert their IDs into the formula.</p>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="form-control" 
                        style={{ flex: 1, fontSize: '0.8rem' }}
                        onChange={e => {
                          if(e.target.value) {
                            setIndFormFormula(prev => prev + e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">-- Insert Primary KPI --</option>
                        {indicators.filter(i => !i.is_derived).map(i => (
                          <option key={i.indicator_id} value={i.indicator_id}>{i.indicator_id} - {i.name}</option>
                        ))}
                      </select>
                    </div>

                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="e.g., (IND-001 / IND-002) * 100" 
                      value={indFormFormula}
                      onChange={e => setIndFormFormula(e.target.value)}
                      required={indFormIsDerived}
                      style={{ fontFamily: 'monospace' }}
                    ></textarea>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingIndicator ? 'Update KPI' : 'Save KPI'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowIndicatorModal(false)}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}
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

      {/* GEOGRAPHY SETUP */}
      {activeTab === 'geography' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {!isAuthorized && (
            <div style={{ padding: '16px', background: 'var(--warning)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              Viewing Mode: You do not have permission to manage geographic settings.
            </div>
          )}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="card" style={{ flex: 1 }}>
              <h3>Regions</h3>
              {isAuthorized && (
                <form onSubmit={handleCreateRegion} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input className="form-control" placeholder="Region ID (e.g. REG-001)" value={newRegId} onChange={e => setNewRegId(e.target.value)} required />
                  <input className="form-control" placeholder="Region Name" value={newRegName} onChange={e => setNewRegName(e.target.value)} required />
                  <button type="submit" className="btn btn-primary">Add Region</button>
                </form>
              )}
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Region Name</th>{isAuthorized && <th>Action</th>}</tr>
                  </thead>
                  <tbody>
                    {regions.map(r => (
                      <tr key={r.region_id}>
                        <td>{r.region_id}</td>
                        <td>{r.name}</td>
                        {isAuthorized && (
                          <td>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDeleteRegion(r.region_id)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {regions.length === 0 && <tr><td colSpan={isAuthorized ? 3 : 2} style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>No regions found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <h3>Districts</h3>
              {isAuthorized && (
                <form onSubmit={handleCreateDistrict} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <input className="form-control" style={{ flex: '1 1 45%' }} placeholder="District ID (e.g. DIST-001)" value={newDistId} onChange={e => setNewDistId(e.target.value)} required />
                  <select className="form-control" style={{ flex: '1 1 45%' }} value={newDistRegId} onChange={e => setNewDistRegId(e.target.value)} required>
                    <option value="">Select Region...</option>
                    {regions.map(r => <option key={r.region_id} value={r.region_id}>{r.name}</option>)}
                  </select>
                  <input className="form-control" style={{ flex: '1 1 100%' }} placeholder="District Name" value={newDistName} onChange={e => setNewDistName(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add District</button>
                </form>
              )}
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>ID</th><th>District Name</th><th>Region</th>{isAuthorized && <th>Action</th>}</tr>
                  </thead>
                  <tbody>
                    {districts.map(d => {
                      const parent = regions.find(r => r.region_id === d.region_id);
                      return (
                        <tr key={d.district_id}>
                          <td>{d.district_id}</td>
                          <td>{d.name}</td>
                          <td>{parent ? parent.name : d.region_id}</td>
                          {isAuthorized && (
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDeleteDistrict(d.district_id)}>Delete</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {districts.length === 0 && <tr><td colSpan={isAuthorized ? 4 : 3} style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>No districts found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORGANIZATION SETUP */}
      {activeTab === 'organization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {!isAuthorized && (
            <div style={{ padding: '16px', background: 'var(--warning)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              Viewing Mode: You do not have permission to manage organization settings.
            </div>
          )}
          
          <div className="card">
            <h3>Institutions</h3>
            {isAuthorized && (
              <form onSubmit={handleCreateInstitution} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input className="form-control" style={{ flex: '1 1 200px' }} placeholder="Inst ID (e.g. INST-001)" value={newInstId} onChange={e => setNewInstId(e.target.value)} required />
                <input className="form-control" style={{ flex: '1 1 200px' }} placeholder="Institution Name" value={newInstName} onChange={e => setNewInstName(e.target.value)} required />
                <select className="form-control" style={{ flex: '1 1 200px' }} value={newInstType} onChange={e => setNewInstType(e.target.value)}>
                  <option value="Ministry">Ministry</option>
                  <option value="Agency">Agency</option>
                  <option value="Department">Department</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ flex: '1 1 200px' }}>Add Institution</button>
              </form>
            )}
            <div className="table-responsive">
              <table>
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Type</th>{isAuthorized && <th>Action</th>}</tr>
                </thead>
                <tbody>
                  {institutions.map(i => (
                    <tr key={i.inst_id}>
                      <td>{i.inst_id}</td>
                      <td>{i.name}</td>
                      <td><span className="badge badge-info">{i.type}</span></td>
                      {isAuthorized && (
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDeleteInstitution(i.inst_id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {institutions.length === 0 && <tr><td colSpan={isAuthorized ? 4 : 3} style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>No institutions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="card" style={{ flex: 1 }}>
              <h3>Departments</h3>
              {isAuthorized && (
                <form onSubmit={handleCreateDepartment} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <input className="form-control" style={{ flex: '1 1 45%' }} placeholder="Dept ID (e.g. DEPT-001)" value={newDeptId} onChange={e => setNewDeptId(e.target.value)} required />
                  <select className="form-control" style={{ flex: '1 1 45%' }} value={newDeptInstId} onChange={e => setNewDeptInstId(e.target.value)} required>
                    <option value="">Select Institution...</option>
                    {institutions.map(i => <option key={i.inst_id} value={i.inst_id}>{i.name}</option>)}
                  </select>
                  <input className="form-control" style={{ flex: '1 1 100%' }} placeholder="Department Name" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Department</button>
                </form>
              )}
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Department Name</th><th>Institution</th>{isAuthorized && <th>Action</th>}</tr>
                  </thead>
                  <tbody>
                    {departments.map(d => {
                      const parent = institutions.find(i => i.inst_id === d.inst_id);
                      return (
                        <tr key={d.dept_id}>
                          <td>{d.dept_id}</td>
                          <td>{d.name}</td>
                          <td>{parent ? parent.name : d.inst_id}</td>
                          {isAuthorized && (
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDeleteDepartment(d.dept_id)}>Delete</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {departments.length === 0 && <tr><td colSpan={isAuthorized ? 4 : 3} style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>No departments found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <h3>Sections</h3>
              {isAuthorized && (
                <form onSubmit={handleCreateSection} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <input className="form-control" style={{ flex: '1 1 45%' }} placeholder="Sec ID (e.g. SEC-001)" value={newSecId} onChange={e => setNewSecId(e.target.value)} required />
                  <select className="form-control" style={{ flex: '1 1 45%' }} value={newSecDeptId} onChange={e => setNewSecDeptId(e.target.value)} required>
                    <option value="">Select Department...</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                  </select>
                  <input className="form-control" style={{ flex: '1 1 100%' }} placeholder="Section Name" value={newSecName} onChange={e => setNewSecName(e.target.value)} required />
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Section</button>
                </form>
              )}
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Section Name</th><th>Department</th>{isAuthorized && <th>Action</th>}</tr>
                  </thead>
                  <tbody>
                    {sections.map(s => {
                      const parent = departments.find(d => d.dept_id === s.dept_id);
                      return (
                        <tr key={s.section_id}>
                          <td>{s.section_id}</td>
                          <td>{s.name}</td>
                          <td>{parent ? parent.name : s.dept_id}</td>
                          {isAuthorized && (
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDeleteSection(s.section_id)}>Delete</button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {sections.length === 0 && <tr><td colSpan={isAuthorized ? 4 : 3} style={{ textAlign: 'center', color: 'var(--neutral-500)' }}>No sections found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
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
                          onClick={() => openAddLevelTypeModal('framework')}
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
                          onClick={() => openAddLevelTypeModal('project')}
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
