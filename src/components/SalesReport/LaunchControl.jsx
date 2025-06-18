import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExternalLinkIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import useExportToSheet from './hooks/useExportToSheet';
import buttonStyles from './styles/ReportControls.module.css';
import formStyles from './styles/formControls.module.css';

const LaunchControl = ({
  business,
  setBusiness,
  groupBy,
  setGroupBy,
  days,
  setDays,
  fetchData,
  exportMainDataToCSV,
  rowData,
  filterOpen,
  setFilterOpen,
  appliedFilters,
  loading,
  // Launch date filter props (simplified - only date needed now)
  launchDate,
  setLaunchDate,
  // Multi-select columns props
  selectedColumns,
  setSelectedColumns,
  // Period selection props
  selectedPeriods,
  setSelectedPeriods
}) => {
  const [availableBusinessCodes, setAvailableBusinessCodes] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const { exportToGoogleSheet } = useExportToSheet();

  const BUSINESS_CODE_MAP = {
    "ZNG45F8J27LKMNQ": "zing",
    "PRT9X2C6YBMLV0F": "prathiksham",
    "BEE7W5ND34XQZRM": "beelittle",
    "ADBXOUERJVK038L": "adoreaboo",
    "Authentication": "task_db"
  };

  // Google Sheets mapping
  const BRAND_SHEET_MAP = {
    "PRT9X2C6YBMLV0F": "https://docs.google.com/spreadsheets/d/1q5CAMOxVZnFAowxq9w0bbuX9bEPtwJOa9ERA3wCOReQ/edit?usp=sharing",
    "BEE7W5ND34XQZRM": "https://docs.google.com/spreadsheets/d/1fyzL0TPVWSvQ71-N14AIav9e0qCAqGRu47dhUjA2R44/edit?usp=sharing",
    "ADBXOUERJVK038L": "https://docs.google.com/spreadsheets/d/1AmFyKI_XMIrSsxyVk11fEgwa8RJMcBwYSKWuQvHh-eU/edit?usp=sharing",
    "ZNG45F8J27LKMNQ": "https://docs.google.com/spreadsheets/d/15Y79kB1STCwCTNJT6dcK-weqazbqQeptXzXcDgJykT8/edit?usp=sharing"
  };

  // Columns to exclude from the dropdown
  const EXCLUDED_COLUMNS = [
    'item_id',
    'item_name', 
    'item_type',
    'product_type',
    'current_stock',
    'category',
    'sale_discount',  
    "sale_price",
  ];

  // Period options for multi-select
  const periodOptions = [
    { value: 'first_period', label: 'First Period' },
    { value: 'second_period', label: 'Second Period' }
  ];

  // Get business options from localStorage - same pattern as GroupbyReportControls
  const businessOptions = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const reportrixPermissions = userData.permissions?.reportrix || {};
      
      const availableBusinesses = Object.entries(BUSINESS_CODE_MAP)
        .filter(([code, brandName]) => {
          return reportrixPermissions[brandName] === true;
        })
        .map(([code, brandName]) => ({
          value: code,
          label: brandName
        }));

      return availableBusinesses;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return [];
    }
  }, []);

  // Get current Google Sheets link based on selected business
  const currentGoogleSheetLink = useMemo(() => {
    return business ? BRAND_SHEET_MAP[business] : null;
  }, [business]);

  // Get current business name for display
  const currentBusinessName = useMemo(() => {
    return business ? BUSINESS_CODE_MAP[business] : '';
  }, [business]);

  // Set available business codes for backward compatibility
  useEffect(() => {
    const available = businessOptions.map(opt => ({
      code: opt.value,
      brandName: opt.label
    }));
    setAvailableBusinessCodes(available);
    
    if (!business && available.length > 0) {
      setBusiness(available[0].code);
    }
  }, [businessOptions, business, setBusiness]);

  // Load column options from API
  useEffect(() => {
    const fetchColumnOptions = async () => {
      if (!business) {
        setColumnOptions([]);
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${API_URL}/api/filter/available-fields`, {
          params: { business }, 
          withCredentials: true, 
        });
        
        if (response.data?.fields) {
          // Filter out excluded columns and format for dropdown
          const filteredColumns = response.data.fields
            .filter(field => !EXCLUDED_COLUMNS.includes(field.toLowerCase()))
            .map(field => ({
              value: field,
              label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }));
          
          setColumnOptions(filteredColumns);
        }
      } catch (error) {
        console.error('Error fetching column options:', error);
        setColumnOptions([]);
      }
    };

    fetchColumnOptions();
  }, [business]);

  // Clear launch date, selected columns, and selected periods when business changes
  useEffect(() => {
    if (setLaunchDate) {
      setLaunchDate('');
    }
    if (setSelectedColumns) {
      setSelectedColumns([]);
    }
    if (setSelectedPeriods) {
      setSelectedPeriods([]);
    }
  }, [business, setLaunchDate, setSelectedColumns, setSelectedPeriods]);

  // Find selected column options for multi-select
  const selectedColumnOptions = useMemo(() => {
    if (!selectedColumns || selectedColumns.length === 0) return [];
    return columnOptions.filter(option => selectedColumns.includes(option.value));
  }, [selectedColumns, columnOptions]);

  // Find selected period options for multi-select
  const selectedPeriodOptions = useMemo(() => {
    if (!selectedPeriods || selectedPeriods.length === 0) return [];
    return periodOptions.filter(option => selectedPeriods.includes(option.value));
  }, [selectedPeriods]);

  // Group By options (convert to Select format)
  const groupByOptions = [
    { value: 'item_name', label: 'Item Name' },
    { value: 'item_id', label: 'Item Id' }
  ];

  // Days options (convert to Select format)
  const daysOptions = [
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '90', label: '90 Days' },
    { value: '120', label: '120 Days' }
  ];

  // Find selected options for dropdowns
  const selectedGroupByOption = groupByOptions.find(option => option.value === groupBy) || null;
  const selectedDaysOption = daysOptions.find(option => option.value === days) || null;

  // Calculate filter count including launch date filter
  const baseFilterCount = Object.keys(appliedFilters || {}).length;
  const launchDateFilterActive = launchDate ? 1 : 0;
  const totalFilterCount = baseFilterCount + launchDateFilterActive;

  // Sort options to show selected ones first for multi-select
  const sortedColumnOptions = useMemo(() => {
    if (!columnOptions) return [];
    
    const selected = columnOptions.filter(option => 
      selectedColumns.includes(option.value)
    );
    const unselected = columnOptions.filter(option => 
      !selectedColumns.includes(option.value)
    );
    
    return [...selected, ...unselected];
  }, [columnOptions, selectedColumns]);

  // Custom MultiValue component using global styles
  const CustomMultiValue = ({ data, removeProps, selectProps }) => {
    const allValues = selectProps.value || [];
    const currentIndex = allValues.findIndex(item => item.value === data.value);
    
    if (currentIndex === 0 && allValues.length > 1) {
      return (
        <div className={buttonStyles.multiValue}>
          <span className={buttonStyles.multiValueText}>{data.label}</span>
          <span className={buttonStyles.badge}>+{allValues.length - 1}</span>
        </div>
      );
    } else if (currentIndex === 0) {
      return (
        <div className={buttonStyles.multiValue}>
          <span className={buttonStyles.multiValueText}>{data.label}</span>
          <button
            {...removeProps}
            className={buttonStyles.button}
            style={{ 
              padding: '2px 4px', 
              height: 'auto', 
              minHeight: 'auto',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit'
            }}
            onClick={(e) => {
              e.stopPropagation();
              removeProps.onClick(e);
            }}
          >
            ×
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Google Sheets SVG icon
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

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formContainer}>
        {/* Single Input Row */}
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Business</label>
            <select
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className={formStyles.select}
            >
              <option value="">Select Business</option>
              {businessOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Group By</label>
            <Select
              options={groupByOptions}
              value={selectedGroupByOption}
              onChange={(selected) => setGroupBy(selected ? selected.value : '')}
              placeholder="Select Group By"
              isClearable
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPosition="fixed"
            />
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Days</label>
            <Select
              options={daysOptions}
              value={selectedDaysOption}
              onChange={(selected) => setDays(selected ? selected.value : '')}
              placeholder="Select Days"
              isClearable
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPosition="fixed"
            />
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Launch Date (From)</label>
            <input
              type="date"
              value={launchDate || ''}
              onChange={(e) => setLaunchDate && setLaunchDate(e.target.value)}
              className={formStyles.input}
              placeholder="Select launch date"
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 1.5 }}>
            <div style={styles.labelWithBadge}>
              <label className={formStyles.label}>Choose Extra Columns</label>
              {selectedColumns && selectedColumns.length > 0 && (
                <span className={buttonStyles.badge}>{selectedColumns.length}</span>
              )}
            </div>
            <Select
              options={sortedColumnOptions}
              value={selectedColumnOptions}
              onChange={(selected) => {
                const values = selected ? selected.map(option => option.value) : [];
                setSelectedColumns && setSelectedColumns(values);
              }}
              isDisabled={!business || columnOptions.length === 0}
              placeholder="Select Columns"
              isClearable
              isMulti={true}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{ MultiValue: CustomMultiValue }}
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPosition="fixed"
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 1.2 }}>
            <div style={styles.labelWithBadge}>
              <label className={formStyles.label}>Periods</label>
              {selectedPeriods && selectedPeriods.length > 0 && (
                <span className={buttonStyles.badge}>{selectedPeriods.length}</span>
              )}
            </div>
            <Select
              options={periodOptions}
              value={selectedPeriodOptions}
              onChange={(selected) => {
                const values = selected ? selected.map(option => option.value) : [];
                setSelectedPeriods && setSelectedPeriods(values);
              }}
              placeholder="Select Periods"
              isClearable
              isMulti={true}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{ MultiValue: CustomMultiValue }}
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPosition="fixed"
            />
          </div>
        </div>

        {/* Buttons */}
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
              {totalFilterCount > 0 && (
                <span className={buttonStyles.badge}>{totalFilterCount}</span>
              )}
            </button>
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
                onClick={() => exportToGoogleSheet(business, "Launch Summary", rowData)}
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

// Styles - updated to position Google Sheets icon next to button
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
  labelWithBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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

// Custom styles for react-select - same as GroupbyReportControls
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    height: '30px',
    minHeight: '30px',
    fontSize: '14px',
    borderRadius: '6px',
    borderColor: state.isFocused ? '#3b82f6' : '#e1e5e9',
    border: '1px solid #cbd5e1',
    borderWidth: '1px',
    backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: state.isDisabled ? 0.6 : 1,
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#3b82f6',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),
  
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: '0 8px',
    color: state.isFocused ? '#3b82f6' : '#6b7280',
    transition: 'all 0.2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    position: 'absolute',
    right: '0',
    top: '50%',
    transformOrigin: 'center',
    marginTop: '-8px',
    '&:hover': {
      color: '#3b82f6',
    },
    svg: {
      width: '16px',
      height: '16px',
    }
  }),

  clearIndicator: (base, state) => ({
    ...base,
    padding: '0 4px',
    color: '#6b7280',
    position: 'absolute',
    right: '24px',
    top: '50%',
    marginTop: '-8px',
    cursor: 'pointer',
    '&:hover': {
      color: '#ef4444',
    },
    svg: {
      width: '16px',
      height: '16px',
    }
  }),

  valueContainer: (base) => ({
    ...base,
    padding: '4px 40px 4px 12px', // Add right padding for indicators
    flexWrap: 'wrap',
    gap: '4px',
    overflow: 'hidden',
    alignItems: 'center',
  }),
  
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '14px',
  }),
  
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e1e5e9',
    overflow: 'hidden',
    marginTop: '4px',
    position: 'absolute',
    width: '100%',
  }),
  
  menuPortal: base => ({ 
    ...base, 
    zIndex: 9999,
    position: 'fixed',
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
      ? '#f1f5f9'
      : 'white',
    color: state.isSelected ? 'white' : '#374151',
    padding: '10px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    borderLeft: state.isSelected ? '3px solid #1d4ed8' : '3px solid transparent',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#f1f5f9',
    },
  }),
};

export default LaunchControl;