import React from 'react';
import tanzaniaLogo from '../images/Coat_of_arms_of_Tanzania.svg';

export default function Sidebar({ currentView, setCurrentView, collapsed, setCollapsed, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: '📊', roles: ['System Administrator', 'MoEST Leadership', 'National M&E Officer', 'Regional M&E Officer', 'District Education Officer', 'School Data Entry Officer'] },
    { id: 'indicators', label: 'Indicators Performance', icon: '📈', roles: ['System Administrator', 'MoEST Leadership', 'National M&E Officer', 'Regional M&E Officer', 'District Education Officer'] },
    { id: 'data-entry', label: 'Data Submission', icon: '📝', roles: ['System Administrator', 'National M&E Officer', 'Regional M&E Officer', 'District Education Officer', 'School Data Entry Officer'] },
    { id: 'reports', label: 'Reports & Analytics', icon: '📋', roles: ['System Administrator', 'MoEST Leadership', 'National M&E Officer', 'Regional M&E Officer', 'District Education Officer'] },
    { id: 'admin', label: 'Administration & Settings', icon: '⚙️', roles: ['System Administrator', 'National M&E Officer'] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={tanzaniaLogo} alt="Tanzania Coat of Arms" />
        {!collapsed && <span>MoEST M&E</span>}
      </div>

      <ul className="sidebar-menu">
        {allowedItems.map(item => (
          <li
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
            title={item.label}
          >
            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.role || 'Guest'}
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button 
            className="btn btn-secondary" 
            style={{ 
              marginTop: '12px', 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              color: '#F0A500', 
              borderColor: '#F0A500', 
              background: 'transparent' 
            }}
            onClick={onLogout}
          >
            🚪 Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
