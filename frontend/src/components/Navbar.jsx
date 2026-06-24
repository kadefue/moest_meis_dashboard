import React, { useState } from 'react';
import { getTable, saveTable } from '../MockData';

export default function Navbar({ currentView, collapsed, setCollapsed, user, setUser, allUsers }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock Notifications based on user role
  const getNotifications = () => {
    if (user?.role === 'System Administrator') {
      return [
        { id: 1, text: 'System backup completed successfully.', type: 'info' },
        { id: 2, text: 'Integration sync with SAS failed for 3 records.', type: 'warning' }
      ];
    }
    if (user?.role === 'MoEST Leadership' || user?.role === 'National M&E Officer') {
      return [
        { id: 1, text: 'New data submission from Dodoma Regional Office requires review.', type: 'info' },
        { id: 2, text: '3 indicators are currently below target thresholds.', type: 'error' }
      ];
    }
    return [
      { id: 1, text: 'M&E submission window for Q4 is now open.', type: 'info' },
      { id: 2, text: 'Please upload verification documents for class projects.', type: 'warning' }
    ];
  };

  const notifications = getNotifications();

  const handleRoleChange = (selectedUser) => {
    setUser(selectedUser);
    localStorage.setItem('me_current_user', JSON.stringify(selectedUser));
    setShowProfileMenu(false);
    // Reload page to re-initialize layout with new user context
    window.location.reload();
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Executive Dashboard';
      case 'indicators': return 'Indicators Performance';
      case 'data-entry': return 'Data Submission Wizard';
      case 'reports': return 'Reports & Analytics Builder';
      case 'admin': return 'Administration & Settings';
      default: return 'MoEST M&E System';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
          ☰
        </button>
        <span className="nav-title">{getPageTitle()}</span>
      </div>

      <div className="nav-right">
        <div className="period-indicator">
          📅 Period: FY 2024/25
        </div>

        {/* Notifications Bell */}
        <div className="notification-bell" onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}>
          🔔
          {notifications.length > 0 && <span className="bell-badge"></span>}
          
          {showNotifications && (
            <div className="card" style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '320px',
              zIndex: 110,
              cursor: 'default',
              padding: '16px',
              boxShadow: 'var(--shadow-lg)'
            }} onClick={e => e.stopPropagation()}>
              <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '8px' }}>Notifications</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map(n => (
                  <li key={n.id} style={{
                    fontSize: '0.8rem',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: n.type === 'error' ? 'var(--error-bg)' : n.type === 'warning' ? 'var(--warning-bg)' : 'var(--neutral-100)',
                    color: n.type === 'error' ? 'var(--error)' : n.type === 'warning' ? 'var(--warning)' : 'var(--neutral-700)',
                    borderLeft: `3px solid ${n.type === 'error' ? 'var(--error)' : n.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`
                  }}>
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Dropdown to Switch User (For testing the SDD role restrictions) */}
        <div className="user-profile-menu" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} style={{ position: 'relative' }}>
          <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--neutral-900)' }}>
            👤 {user?.name.split(' ')[0]}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--neutral-600)' }}>▼</span>

          {showProfileMenu && (
            <div className="card" style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '280px',
              zIndex: 110,
              cursor: 'default',
              padding: '12px',
              boxShadow: 'var(--shadow-lg)'
            }} onClick={e => e.stopPropagation()}>
              <h4 style={{ marginBottom: '8px', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '4px', fontSize: '0.85rem' }}>Switch Role (Simulation)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {allUsers.map(u => (
                  <button
                    key={u.username}
                    onClick={() => handleRoleChange(u)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: u.username === user?.username ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: u.username === user?.username ? '600' : '400',
                      color: u.username === user?.username ? 'var(--primary)' : 'var(--neutral-700)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--neutral-100)'}
                    onMouseLeave={e => e.target.style.background = u.username === user?.username ? 'var(--primary-light)' : 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--neutral-600)' }}>{u.role} ({u.dept})</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
