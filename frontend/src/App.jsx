import React, { useEffect, useState } from 'react';
import { getTable, initializeStorage, preloadFromBackend } from './MockData';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import IndicatorScreen from './screens/IndicatorScreen';
import DataEntryScreen from './screens/DataEntryScreen';
import ReportsScreen from './screens/ReportsScreen';
import AdminScreen from './screens/AdminScreen';

// Core layout components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ToastProvider';
import { ConfirmProvider } from './components/ConfirmProvider';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState('IND-001');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Populate storage with initial data structures if not present
    initializeStorage();

    // Check session
    const sessionUser = localStorage.getItem('me_current_user');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }

    // Try preloading actual data from backend
    preloadFromBackend().finally(() => {
      setAllUsers(getTable('users'));
    });
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('me_current_user');
    setCurrentUser(null);
  };

  const handleSelectIndicator = (indicatorId) => {
    setSelectedIndicatorId(indicatorId);
    setCurrentView('indicators');
  };

  // Render main screen component based on active navigation item
  const renderActiveScreen = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardScreen 
            onSelectIndicator={handleSelectIndicator} 
            navigateToView={setCurrentView}
          />
        );
      case 'indicators':
        return (
          <IndicatorScreen 
            initialIndicatorId={selectedIndicatorId} 
            user={currentUser}
          />
        );
      case 'data-entry':
        return <DataEntryScreen user={currentUser} />;
      case 'reports':
        return <ReportsScreen user={currentUser} />;
      case 'admin':
        return <AdminScreen user={currentUser} />;
      default:
        return <DashboardScreen onSelectIndicator={handleSelectIndicator} navigateToView={setCurrentView} />;
    }
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        {!currentUser ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Navigation Sidebar */}
            <Sidebar 
              currentView={currentView} 
              setCurrentView={setCurrentView} 
              collapsed={sidebarCollapsed} 
              setCollapsed={setSidebarCollapsed}
              user={currentUser}
              onLogout={handleLogout}
            />

            {/* Main Content Area Wrapper */}
            <div className="main-wrapper">
              <Navbar 
                currentView={currentView}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                user={currentUser}
                setUser={setCurrentUser}
                allUsers={allUsers}
              />
              
              <main className="content-area">
                {renderActiveScreen()}
              </main>
            </div>
          </div>
        )}
      </ConfirmProvider>
    </ToastProvider>
  );
}
