import React, { useState, useEffect } from 'react';
import SalesReportGrid from './SalesReport/SalesReportGrid';
import GroupbyAggregationPage from './SalesReport/GroupbyAggregationPage';
import useLogout from './SalesReport/hooks/useLogout';
import LaunchSummary from './SalesReport/LaunchSummary';

import {
  Bars3Icon,
  ChartBarSquareIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';

const GroupByTab = () => <GroupbyAggregationPage />;

const TabContainer = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('launch');
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const { logout } = useLogout();

  // Load user data on component mount and set up listener for localStorage changes
  useEffect(() => {
    const loadUser = () => {
      try {
        const userString = localStorage.getItem('user');
        console.log('Raw user string from localStorage:', userString);
        
        if (userString) {
          const userData = JSON.parse(userString);
          console.log('Parsed user data:', userData);
          console.log('Available keys in user object:', Object.keys(userData));
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUser(null);
      }
    };

    loadUser();

    // Optional: Listen for storage changes if user data might be updated elsewhere
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (!result.error) {
        console.log('Logout successful');
        onLogout();
      } else {
        console.error('Logout error:', result.error);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to get display name with fallback logic
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Check different possible username fields
    return user.username || 
           user.userName || 
           user.name || 
           user.displayName || 
           user.email?.split('@')[0] || 
           'User';
  };

  // Function to get avatar initial
  const getAvatarInitial = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Determine if sidebar should be shown as expanded
  const shouldShowExpanded = !collapsed || isHovered;

  return (
    <div style={styles.container}>
      <aside 
        style={{
          ...styles.sidebar,
          ...(collapsed && !isHovered ? styles.sidebarCollapsed : {}),
          ...(collapsed && isHovered ? styles.sidebarHovered : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.sidebarHeader}>
          {shouldShowExpanded && (
            <h2 style={styles.logo}>Dashboard</h2>
          )}
          <button
            style={styles.toggleButton}
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Sidebar"
          >
            <Bars3Icon style={{ width: 20, height: 20, color: '#5A5751' }} />
          </button>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'sales' ? styles.activeTab : {}),
              ...(!shouldShowExpanded ? styles.collapsedButton : {})
            }}
            onClick={() => setActiveTab('sales')}
            title={!shouldShowExpanded ? "Sales Report" : ""}
          >
            <div style={activeTab === 'sales' ? styles.activeIconContainer : styles.iconContainer}>
              <ChartBarSquareIcon style={{
                ...styles.icon,
                color: activeTab === 'sales' ? '#FFFFFF' : '#6B6B6B'
              }} />
            </div>
            {shouldShowExpanded && <span style={styles.tabText}>Sales Report</span>}
          </button>

          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'group' ? styles.activeTab : {}),
              ...(!shouldShowExpanded ? styles.collapsedButton : {})
            }}
            onClick={() => setActiveTab('group')}
            title={!shouldShowExpanded ? "Automated Group By" : ""}
          >
            <div style={activeTab === 'group' ? styles.activeIconContainer : styles.iconContainer}>
              <Squares2X2Icon style={{
                ...styles.icon,
                color: activeTab === 'group' ? '#FFFFFF' : '#6B6B6B'
              }} />
            </div>
            {shouldShowExpanded && <span style={styles.tabText}>Automated Group By</span>}
          </button>

          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'launch' ? styles.activeTab : {}),
              ...(!shouldShowExpanded ? styles.collapsedButton : {})
            }}
            onClick={() => setActiveTab('launch')}
            title={!shouldShowExpanded ? "Launch Summary" : ""}
          >
            <div style={activeTab === 'launch' ? styles.activeIconContainer : styles.iconContainer}>
              <RocketLaunchIcon style={{
                ...styles.icon,
                color: activeTab === 'launch' ? '#FFFFFF' : '#6B6B6B'
              }} />
            </div>
            {shouldShowExpanded && <span style={styles.tabText}>Launch Summary</span>}
          </button>
        </nav>

        <div style={styles.userSection}>
          {user && shouldShowExpanded && (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {getAvatarInitial()}
              </div>
              <div style={styles.userDetails}>
                <span style={styles.userName}>
                  {getDisplayName()}
                </span>
                <span style={styles.userRole}>Administrator</span>
              </div>
            </div>
          )}
          
          <button
            style={{
              ...styles.logoutButton,
              ...(!shouldShowExpanded ? styles.collapsedLogoutButton : {})
            }}
            onClick={handleLogout}
            title="Logout"
          >
            <div style={styles.logoutIconContainer}>
              <ArrowRightOnRectangleIcon style={{
                ...styles.icon,
                color: '#DC2626'
              }} />
            </div>
            {shouldShowExpanded && <span style={styles.logoutText}>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.mainContent,
        marginLeft: collapsed ? '80px' : '280px'
      }}>
        <div style={{ display: activeTab === 'launch' ? 'block' : 'none', height: '100%' }}>
          <LaunchSummary />
        </div>
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
    backgroundColor: '#f8fafc',
    position: 'relative'
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '280px',
    background: 'linear-gradient(180deg, #FAFAF8 0%, #F5F5F2 100%)',
    color: '#4E4B4B',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
    borderRight: '1px solid #E8E6E0',
    zIndex: 1000
  },
  sidebarCollapsed: {
    width: '80px'
  },
  sidebarHovered: {
    width: '280px',
    boxShadow: '4px 0 30px rgba(0, 0, 0, 0.15)'
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 20px',
    borderBottom: '1px solid #E8E6E0',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F5 100%)'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '24px',
    background: 'transparent',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'transparent'
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#4E4B4B',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  toggleButton: {
    backgroundColor: '#f8fafc',
    color: '#5A5751',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    border: 'none'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    gap: '8px',
    flex: 1
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '0',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
    border: 'none'
  },
  collapsedButton: {
    justifyContent: 'center',
    gap: 0
  },
  activeTab: {
    backgroundColor: '#343434',
    color: '#FFFFFF',
    fontWeight: '600'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '35px',
    borderRadius: '10px',
    background: '#f8fafc',
    transition: 'all 0.2s ease'
  },
  activeIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '35px',
    borderRadius: '10px',
    background: '#343434',
    backdropFilter: 'blur(10px)'
  },
  icon: {
    width: 20,
    height: 20,
    flexShrink: 0
  },
  tabText: {
    flex: 1,
    fontSize: '15px',
    fontWeight: 'inherit',
    color: 'inherit'
  },
  userSection: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #E8E6E0',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F5 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'linear-gradient(135deg, #F8F8F5 0%, #F0F0ED 100%)',
    borderRadius: '12px',
    border: '1px solid #E8E6E0'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D2A26',
    lineHeight: '1.2'
  },
  userRole: {
    fontSize: '12px',
    color: '#6B6B6B',
    lineHeight: '1.2'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '0',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  collapsedLogoutButton: {
    justifyContent: 'center',
    gap: 0
  },
  logoutIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '35px',
    borderRadius: '10px',
    background: 'transparent',
    transition: 'all 0.2s ease'
  },
  logoutText: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#DC2626'
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#FAFBFC',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginLeft: '80px' // Default collapsed state
  }
};

export default TabContainer;