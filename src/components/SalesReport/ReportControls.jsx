import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import useExportToSheet from './hooks/useExportToSheet';
import buttonStyles from './styles/ReportControls.module.css';
import formStyles from './styles/formControls.module.css';

const ReportControls = ({
  aggregation,
  setAggregation,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  compareStartDate,
  setCompareStartDate,
  compareEndDate,
  setCompareEndDate,
  business,
  setBusiness,
  fetchData,
  exportMainDataToCSV,
  rowData,
  filterOpen,
  setFilterOpen,
  appliedFilters,
  setTargetModalOpen,
  loading
}) => {
  const [startWeekYear, setStartWeekYear] = useState(new Date().getFullYear());
  const [endWeekYear, setEndWeekYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [availableBusinessCodes, setAvailableBusinessCodes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { exportToGoogleSheet, load, successMessage, error } = useExportToSheet();

  const BUSINESS_CODE_MAP = {
    "ZNG45F8J27LKMNQ": "zing",
    "PRT9X2C6YBMLV0F": "prathiksham",
    "BEE7W5ND34XQZRM": "beelittle",
    "ADBXOUERJVK038L": "adoreaboo",
    "Authentication": "task_db"
  };

  // Google Sheets mapping - same as LaunchControl
  const BRAND_SHEET_MAP = {
    "PRT9X2C6YBMLV0F": "https://docs.google.com/spreadsheets/d/1q5CAMOxVZnFAowxq9w0bbuX9bEPtwJOa9ERA3wCOReQ/edit?usp=sharing",
    "BEE7W5ND34XQZRM": "https://docs.google.com/spreadsheets/d/1fyzL0TPVWSvQ71-N14AIav9e0qCAqGRu47dhUjA2R44/edit?usp=sharing",
    "ADBXOUERJVK038L": "https://docs.google.com/spreadsheets/d/1AmFyKI_XMIrSsxyVk11fEgwa8RJMcBwYSKWuQvHh-eU/edit?usp=sharing",
    "ZNG45F8J27LKMNQ": "https://docs.google.com/spreadsheets/d/15Y79kB1STCwCTNJT6dcK-weqazbqQeptXzXcDgJykT8/edit?usp=sharing"
  };

  // Get current Google Sheets link based on selected business
  const currentGoogleSheetLink = useMemo(() => {
    return business ? BRAND_SHEET_MAP[business] : null;
  }, [business]);

  // Get current business name for display
  const currentBusinessName = useMemo(() => {
    return business ? BUSINESS_CODE_MAP[business] : '';
  }, [business]);

  // Load available business codes from localStorage on component mount
  useEffect(() => {
    const loadAvailableBusinessCodes = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const reportrixPermissions = user.permissions?.reportrix || {};
          
          // Check if user is admin
          setIsAdmin(user.permissions?.admin === true);
          
          const availableCodes = [];
          
          // Check each brand in reportrix permissions
          Object.keys(reportrixPermissions).forEach(brandName => {
            if (reportrixPermissions[brandName] === true) {
              // Find the corresponding business code for this brand
              const businessCode = Object.keys(BUSINESS_CODE_MAP).find(
                code => BUSINESS_CODE_MAP[code] === brandName
              );
              if (businessCode) {
                availableCodes.push({
                  code: businessCode,
                  brandName: brandName
                  
                });
              }
            }
          });
          
          setAvailableBusinessCodes(availableCodes);
          
          // If no business is selected and there are available codes, select the first one
          if (!business && availableCodes.length > 0) {
            setBusiness(availableCodes[0].code);
          }
        }
      } catch (error) {
        console.error('Error loading business codes from localStorage:', error);
        setAvailableBusinessCodes([]);
        setIsAdmin(false);
      }
    };

    loadAvailableBusinessCodes();
  }, [business, setBusiness]);

  // Local date formatting to avoid timezone issues
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekNumber = (date) => {
    const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
  };

  const getISOWeekStartDate = (year, week) => {
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7;
    const week1Start = new Date(jan4);
    week1Start.setDate(jan4.getDate() - jan4Day + 1);

    const targetDate = new Date(week1Start);
    targetDate.setDate(week1Start.getDate() + (week - 1) * 7);
    return targetDate;
  };

  const updateDateByWeek = (week, year, dateType, setDate) => {
    const weekStart = getISOWeekStartDate(year, week);
    if (dateType === 'start') {
      setDate(formatDate(weekStart));
    } else {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      setDate(formatDate(weekEnd));
    }
  };

  const updateMonth = (month, dateType, setDate) => {
    const monthIndex = parseInt(month);

    if (dateType === 'start') {
      setStartMonth(monthIndex);
      const date = new Date(startWeekYear, monthIndex, 1);
      setDate(formatDate(date));
    } else {
      setEndMonth(monthIndex);
      const date = new Date(endWeekYear, monthIndex + 1, 0);
      setDate(formatDate(date));
    }
  };

  const updateYear = (year, dateType, setDate) => {
    const y = parseInt(year);
    if (isNaN(y)) return;

    if (dateType === 'start') {
      setStartWeekYear(y);
      const date = new Date(y, startMonth, 1);
      setDate(formatDate(date));
    } else {
      setEndWeekYear(y);
      const date = new Date(y, endMonth + 1, 0);
      setDate(formatDate(date));
    }
  };

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const week = getWeekNumber(now);

    if (aggregation === 'weekly') {
      const start = getISOWeekStartDate(currentYear, week);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    } else if (aggregation === 'monthly') {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    } else if (aggregation === 'daily') {
      const today = formatDate(now);
      setStartDate(today);
      setEndDate(today);
    } else if (aggregation === 'custom' || aggregation === 'compare') {
      // Do not auto-change in custom or compare
    }
  }, [aggregation]);

  const renderDateInput = (dateType, value, setter) => {
    const currentWeek = getWeekNumber(new Date(value));
    const selectedYear = dateType === 'start' ? startWeekYear : endWeekYear;
    const setYear = dateType === 'start' ? setStartWeekYear : setEndWeekYear;

    switch (aggregation) {
      case 'weekly':
        return (
          <div style={styles.weekSelector}>
            <select
              value={currentWeek}
              onChange={(e) => updateDateByWeek(parseInt(e.target.value), selectedYear, dateType, setter)}
              className={formStyles.selectFlex}
            >
              {Array.from({ length: 53 }, (_, i) => i + 1).map((week) => {
                const weekStartDate = getISOWeekStartDate(selectedYear, week);
                const formattedDate = weekStartDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                });
                return (
                  <option key={week} value={week}>
                    {`Week ${week} (${formattedDate})`}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                setYear(year);
                updateDateByWeek(currentWeek, year, dateType, setter);
              }}
              className={formStyles.selectSmall}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        );
      case 'monthly':
        const selectedMonth = dateType === 'start' ? startMonth : endMonth;
        return (
          <div style={styles.monthSelector}>
            <select
              value={selectedMonth}
              onChange={(e) => updateMonth(e.target.value, dateType, setter)}
              className={formStyles.selectFlex}
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => updateYear(e.target.value, dateType, setter)}
              className={formStyles.selectSmall}
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setter(e.target.value)}
            className={formStyles.input}
          />
        );
    }
  };

  // Google Sheets SVG icon - same as LaunchControl
  const GoogleSheetsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#0F9D58"/>
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#0F9D58"/>
      <rect x="7" y="7" width="4" height="2" fill="white"/>
      <rect x="13" y="7" width="4" height="2" fill="white"/>
      <rect x="7" y="11" width="4" height="2" fill="white"/>
      <rect x="13" y="11" width="4" height="2" fill="white"/>
      <rect x="7" y="15" width="4" height="2" fill="white"/>
      <rect x="13" y="15" width="4" height="2" fill="white"/>
    </svg>
  );

  const filterCount = Object.keys(appliedFilters || {}).length;

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formContainer}>
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Aggregation</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className={formStyles.select}
            >
              <option value="">Select Aggregation</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
              <option value="compare">Compare</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Start Date</label>
            {renderDateInput('start', startDate, setStartDate)}
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>End Date</label>
            {renderDateInput('end', endDate, setEndDate)}
          </div>

          {aggregation === 'compare' && (
            <>
              <div style={styles.inputGroup}>
                <label className={formStyles.label}>Compare Start</label>
                <input
                  type="date"
                  value={compareStartDate}
                  onChange={(e) => setCompareStartDate(e.target.value)}
                  className={formStyles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label className={formStyles.label}>Compare End</label>
                <input
                  type="date"
                  value={compareEndDate}
                  onChange={(e) => setCompareEndDate(e.target.value)}
                  className={formStyles.input}
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Business</label>
            <select
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className={formStyles.select}
            >
              {availableBusinessCodes.map((businessItem) => (
                <option key={businessItem.code} value={businessItem.code}>
                  {businessItem.brandName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.buttonRow}>
          <div style={styles.leftButtons}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={buttonStyles.advancedButton}
              style={{
                backgroundColor: filterOpen ? '#374151' : '#ffffff',
                color: filterOpen ? '#ffffff' : '#374151',
              }}
            >
              <FunnelIcon className={buttonStyles.icon} />
              Advanced Filters
              {filterCount > 0 && <span className={buttonStyles.badge}>{filterCount}</span>}
            </button>

            {/* Only show Manage Targets button for admin users */}
            {isAdmin && (
              <button
                onClick={() => setTargetModalOpen(true)}
                disabled={!business}
                className={`${buttonStyles.button} ${(!business) ? buttonStyles.disabled : ''}`}
              >
                🎯 Manage Targets
              </button>
            )}
          </div>

          <div style={styles.rightButtons}>
            <button
              onClick={fetchData}
              className={`${buttonStyles.button} ${buttonStyles.primary} ${loading ? buttonStyles.disabled : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={buttonStyles.spinner} />
                  <span style={{ marginLeft: '6px' }}>Loading...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className={buttonStyles.icon} />
                  Fetch
                </>
              )}
            </button>

            <button
              onClick={exportMainDataToCSV}
              disabled={!rowData || rowData.length === 0}
              className={`${buttonStyles.button} ${(!rowData || rowData.length === 0) ? buttonStyles.disabled : ''}`}
            >
              <ArrowDownTrayIcon className={buttonStyles.icon} />
              Export CSV
            </button>

            <div style={styles.exportSheetContainer}>
              <button
                onClick={() => exportToGoogleSheet(business,"Daily Sales", rowData)}
                disabled={!rowData || rowData.length === 0 || !business}
                className={`${buttonStyles.button} ${(!rowData || rowData.length === 0 || !business) ? buttonStyles.disabled : ''}`}
              >
                📤 Export to Google Sheet
              </button>
              {currentGoogleSheetLink && (
                <a
                  href={currentGoogleSheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.sheetIconLink}
                  title={`Open Google Sheet for ${currentBusinessName}`}
                >
                  <GoogleSheetsIcon />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep minimal inline styles only for layout that's not covered by CSS modules
const styles = {
  inputRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '160px',
    flex: 1,
  },
  monthSelector: {
    display: 'flex',
    gap: '4px',
  },
  weekSelector: {
    display: 'flex',
    gap: '4px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  leftButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  rightButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginLeft: 'auto',
  },
  // New styles for Google Sheets functionality
  exportSheetContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Space between button and icon
  },
  sheetIconLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e1e5e9',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e9ecef',
      borderColor: '#0F9D58',
    },
  },
};

export default ReportControls;