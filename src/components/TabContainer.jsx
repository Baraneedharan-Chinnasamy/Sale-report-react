import React, { useState } from 'react';
import SalesReportGrid from './SalesReport/SalesReportGrid';
import GroupbyAggregationPage from './SalesReport/GroupbyAggregationPage';

import {
  Bars3Icon,
  ChartBarSquareIcon,
  Squares2X2Icon  
} from '@heroicons/react/24/solid';

const GroupByTab = () => <GroupbyAggregationPage />;

const TabContainer = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [collapsed, setCollapsed] = useState(false);

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
            <Bars3Icon style={{ width: 20, height: 20, color: '#4E4B4B' }} />
          </button>
        </div>

        {!collapsed && (
          <nav style={styles.nav}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'sales' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('sales')}
            >
              <ChartBarSquareIcon style={styles.icon} />
              Sales Report
            </button>

            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === 'group' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('group')}
            >
              <Squares2X2Icon   style={styles.icon} />
              Automated Group By
            </button>
          </nav>
        )}
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
    width: '70px'
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
    marginTop: '20px',
    gap: '12px',
    padding: '0 20px'
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
    transition: 'background-color 0.2s ease, color 0.2s ease',
    textAlign: 'left'
  },
  activeTab: {
    backgroundColor: '#DDDAD2', // Subtle warm grey
    color: '#1F1F1F', // Dark text for contrast
    fontWeight: 600
  },
  icon: {
    width: 20,
    height: 20,
    color: '#4E4B4B' // Matching icon color
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#f4f4f2' // Very light grey for content
  }
};


export default TabContainer;
