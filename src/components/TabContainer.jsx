import React, { useState } from 'react';
import SalesReportGrid from './SalesReport/SalesReportGrid';
import GroupbyAggregationPage from './SalesReport/GroupbyAggregationPage';
import useLogout from './SalesReport/hooks/useLogout';

import {
  Bars3Icon,
  ChartBarSquareIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/solid';

const GroupByTab = () => <GroupbyAggregationPage />;
const user = JSON.parse(localStorage.getItem('user'));

const TabContainer = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [collapsed, setCollapsed] = useState(true);
  const { logout } = useLogout();

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (!result.error) {
        console.log('Logout successful');
        // Call the onLogout prop to update App's authentication state
        onLogout();
      } else {
        console.error('Logout error:', result.error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={styles.container}>
      <aside style={{ ...styles.sidebar, ...(collapsed ? styles.sidebarCollapsed : {}) }}>
        <div style={styles.sidebarHeader}>
          {!collapsed && <h2 style={styles.logo}>Dashboard</h2>}
          <button
            style={styles.toggleButton}
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Sidebar"
          >
            <Bars3Icon style={{ width: 24, height: 24, color: '#4E4B4B' }} />
          </button>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'sales' ? styles.activeTab : {}),
              ...(collapsed ? styles.collapsedButton : {})
            }}
            onClick={() => setActiveTab('sales')}
            title={collapsed ? "Sales Report" : ""}
          >
            <ChartBarSquareIcon style={styles.icon} />
            {!collapsed && "Sales Report"}
          </button>

          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'group' ? styles.activeTab : {}),
              ...(collapsed ? styles.collapsedButton : {})
            }}
            onClick={() => setActiveTab('group')}
            title={collapsed ? "Automated Group By" : ""}
          >
            <Squares2X2Icon style={styles.icon} />
            {!collapsed && "Automated Group By"}
          </button>
        </nav>

        {/* User info and logout section */}
        <div style={styles.userSection}>
          {user && !collapsed && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                {user.username || user.name || 'User'}
              </span>
            </div>
          )}
          
          <button
            style={{
              ...styles.logoutButton,
              ...(collapsed ? styles.collapsedLogoutButton : {})
            }}
            onClick={handleLogout}
            title={collapsed ? "Logout" : "Logout"}
          >
            <ArrowRightOnRectangleIcon style={styles.icon} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <div style={{ display: activeTab === 'sales' ? 'block' : 'none', height: '100%' }}>
          <SalesReportGrid />
        </div>
        <div style={{ display: activeTab === 'group' ? 'block' : 'none', height: '100%' }}>
          <GroupByTab />
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f8fafc'
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#F8F8F5', // Soft stone white
    color: '#4E4B4B', // Deep taupe
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    transition: 'width 0.3s ease',
    boxShadow: '2px 0 6px rgba(0, 0, 0, 0.06)'
  },
  sidebarCollapsed: {
    width: '80px'
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px 20px 20px',
    borderBottom: '1px solid #D1D1CD'
  },
  logo: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#4E4B4B',
    margin: 0
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#4E4B4B',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '5px',
    gap: '1px',
    padding: '0 0px',
    flex: 1
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#4E4B4B', // Normal text color
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: '#f0eee9',
    textAlign: 'left'
  },
  collapsedButton: {
    justifyContent: 'center',
    padding: '16px 12px',
    gap: 0,
    minHeight: '52px'
  },
  activeTab: {
    backgroundColor: '#DDDAD2', // Subtle warm grey
    color: '#1F1F1F', // Dark text for contrast
    fontWeight: 600
  },
  icon: {
    width: 24,
    height: 24,
    color: '#4E4B4B', // Matching icon color
    flexShrink: 0
  },
  userSection: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #D1D1CD',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  userInfo: {
    padding: '8px 0'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4E4B4B'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#DC2626', // Red color for logout
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    textAlign: 'left'
  },
  collapsedLogoutButton: {
    justifyContent: 'center',
    padding: '16px 12px',
    gap: 0,
    minHeight: '52px'
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f4f4f2' // Very light grey for content
  }
};

export default TabContainer;