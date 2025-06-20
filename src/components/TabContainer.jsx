import React, { useState, useEffect } from 'react';
import SalesReportGrid from './SalesReport/SalesReportGrid';
import GroupbyAggregationPage from './SalesReport/GroupbyAggregationPage';
import useLogout from './SalesReport/hooks/useLogout';
import LaunchSummary from './SalesReport/LaunchSummary';
import useColumnsAndFields from './SalesReport/hooks/useColumnsAndFields';
import './TabContainer.css';

import {
  Bars3Icon,
  ChartBarSquareIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  RocketLaunchIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';

const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham",
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const GroupByTab = ({ selectedBusiness }) => <GroupbyAggregationPage selectedBusiness={selectedBusiness} />;

const TabContainer = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
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
          
          // Set default business if available
          if (userData.permissions?.reportrix && userData.permissions.reportrix.length > 0) {
            // Check if there's a previously selected business in localStorage
            const savedBusiness = localStorage.getItem('selectedBusiness');
            if (savedBusiness && userData.permissions.reportrix.includes(savedBusiness)) {
              setSelectedBusiness(savedBusiness);
            } else {
              // Set first business as default
              setSelectedBusiness(userData.permissions.reportrix[0]);
              localStorage.setItem('selectedBusiness', userData.permissions.reportrix[0]);
            }
          }
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

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (collapsed && !isHovered) {
      setShowBusinessDropdown(false);
    }
  }, [collapsed, isHovered]);

  // Handle business selection
  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    localStorage.setItem('selectedBusiness', business);
    setShowBusinessDropdown(false);
    console.log('Selected business:', business);
  };

  // Get available businesses from user permissions
  const getAvailableBusinesses = () => {
    return user?.permissions?.reportrix || [];
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (!result.error) {
        console.log('Logout successful');
        // Clear selected business on logout
        localStorage.removeItem('selectedBusiness');
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

  // Function to get business initial
  const getBusinessInitial = (business) => {
    return business ? business.charAt(0).toUpperCase() : 'B';
  };

  // Determine if sidebar should be shown as expanded
  const shouldShowExpanded = !collapsed || isHovered;

  // Capitalize business name for display
  const formatBusinessName = (business) => {
    return business.charAt(0).toUpperCase() + business.slice(1);
  };

  // Find the business code for the selected business name
  const selectedBusinessCode = Object.keys(BUSINESS_CODE_MAP).find(
    code => BUSINESS_CODE_MAP[code] === selectedBusiness
  );

  // Use the hook with the business code
  const {
    fieldNames,
    fetchColumnsAndFields,
    loading: fieldsLoading,
    error: fieldsError
  } = useColumnsAndFields(selectedBusinessCode);

  // Fetch and store fields when business changes
  useEffect(() => {
    if (selectedBusinessCode) {
      fetchColumnsAndFields().then((data) => {
        if (data && data.fieldNames) {
          localStorage.setItem(`${selectedBusiness}`, JSON.stringify(data));
        }
      });
    }
  }, [selectedBusinessCode, selectedBusiness, fetchColumnsAndFields]);

  return (
    <div className="tab-container">
      <aside 
        className={`sidebar ${collapsed && !isHovered ? 'sidebar-collapsed' : ''} ${collapsed && isHovered ? 'sidebar-hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header">
          {shouldShowExpanded && (
            <h2 className="logo">Dashboard</h2>
          )}
          <button
            className="toggle-button"
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Sidebar"
          >
            <Bars3Icon style={{ width: 20, height: 20, color: '#5A5751' }} />
          </button>
        </div>

        {/* Business Selector */}
        {getAvailableBusinesses().length > 0 && (
          <div className="business-selector">
            {shouldShowExpanded ? (
              <div className="business-dropdown-container">
                <label className="business-label">Select Business</label>
                <div className="dropdown-wrapper">
                  <button
                    className="business-dropdown-button"
                    onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                  >
                    <div className="business-dropdown-content">
                      <span className="business-text">
                        {formatBusinessName(selectedBusiness)}
                      </span>
                    </div>
                    <ChevronDownIcon 
                      className={`chevron-icon ${showBusinessDropdown ? 'chevron-rotated' : ''}`}
                    />
                  </button>
                  
                  {showBusinessDropdown && (
                    <div className="business-dropdown-menu">
                      {getAvailableBusinesses().map((business) => (
                        <button
                          key={business}
                          className={`business-dropdown-item ${business === selectedBusiness ? 'selected-business-item' : ''}`}
                          onClick={() => handleBusinessSelect(business)}
                        >
                          <span>{formatBusinessName(business)}</span>
                          {business === selectedBusiness && (
                            <div className="selected-indicator">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="collapsed-business-selector">
                <button
                  className="collapsed-business-button"
                  onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                  title={`Selected: ${formatBusinessName(selectedBusiness)}`}
                >
                  <span className="business-initial-text">
                    {getBusinessInitial(selectedBusiness)}
                  </span>
                </button>
                
                {showBusinessDropdown && (
                  <div className="collapsed-business-dropdown">
                    {getAvailableBusinesses().map((business) => (
                      <button
                        key={business}
                        className={`collapsed-business-item ${business === selectedBusiness ? 'selected-collapsed-item' : ''}`}
                        onClick={() => handleBusinessSelect(business)}
                        title={formatBusinessName(business)}
                      >
                        <span className="business-initial-icon">
                          {getBusinessInitial(business)}
                        </span>
                        <span className="collapsed-business-text">
                          {formatBusinessName(business)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <nav className="nav">
          <button
            className={`tab-button ${activeTab === 'sales' ? 'active-tab' : ''} ${!shouldShowExpanded ? 'collapsed-button' : ''}`}
            onClick={() => setActiveTab('sales')}
            title={!shouldShowExpanded ? "Sales Report" : ""}
          >
            <div className={activeTab === 'sales' ? 'active-icon-container' : 'icon-container'}>
              <ChartBarSquareIcon className="icon" style={{ color: '#6B6B6B' }} />
            </div>
            {shouldShowExpanded && <span className="tab-text">Sales Report</span>}
          </button>

          <button
            className={`tab-button ${activeTab === 'group' ? 'active-tab' : ''} ${!shouldShowExpanded ? 'collapsed-button' : ''}`}
            onClick={() => setActiveTab('group')}
            title={!shouldShowExpanded ? "Automated Group By" : ""}
          >
            <div className={activeTab === 'group' ? 'active-icon-container' : 'icon-container'}>
              <Squares2X2Icon className="icon" style={{ color: '#6B6B6B' }} />
            </div>
            {shouldShowExpanded && <span className="tab-text">Automated Group By</span>}
          </button>

          <button
            className={`tab-button ${activeTab === 'launch' ? 'active-tab' : ''} ${!shouldShowExpanded ? 'collapsed-button' : ''}`}
            onClick={() => setActiveTab('launch')}
            title={!shouldShowExpanded ? "Launch Summary" : ""}
          >
            <div className={activeTab === 'launch' ? 'active-icon-container' : 'icon-container'}>
              <RocketLaunchIcon className="icon" style={{ color: '#6B6B6B' }} />
            </div>
            {shouldShowExpanded && <span className="tab-text">Launch Summary</span>}
          </button>
        </nav>

        <div className="user-section">
          {user && shouldShowExpanded && (
            <div className="user-info">
              <div className="user-avatar">
                {getAvatarInitial()}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {getDisplayName()}
                </span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          )}
          
          <button
            className={`logout-button ${!shouldShowExpanded ? 'collapsed-logout-button' : ''}`}
            onClick={handleLogout}
            title="Logout"
          >
            <div className="logout-icon-container">
              <ArrowRightOnRectangleIcon className="icon" style={{ color: '#DC2626' }} />
            </div>
            {shouldShowExpanded && <span className="logout-text">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`main-content ${!collapsed ? 'main-content-expanded' : ''}`}>
        <div className={activeTab === 'launch' ? 'content-visible' : 'content-hidden'}>
          <LaunchSummary selectedBusiness={selectedBusiness} />
        </div>
        <div className={activeTab === 'sales' ? 'content-visible' : 'content-hidden'}>
          <SalesReportGrid selectedBusiness={selectedBusiness} />
        </div>
        <div className={activeTab === 'group' ? 'content-visible' : 'content-hidden'}>
          <GroupByTab selectedBusiness={selectedBusiness} />
        </div>
      </main>
    </div>
  );
};

export default TabContainer;