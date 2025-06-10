import React, { useEffect, useMemo, useState, useRef } from 'react';
import Select from 'react-select';
import {FunnelIcon,ArrowDownTrayIcon,MagnifyingGlassIcon,XMarkIcon,Bars3Icon,
} from '@heroicons/react/24/outline';
import useColumnOptions from './hooks/useColumnOptions';
import useExportToSheet from './hooks/useExportToSheet';
import buttonStyles from './styles/ReportControls.module.css';
import formStyles from './styles/formControls.module.css'; 
import dragStyles from './styles/ColumnArrangement.module.css';
import { exportDataToCSV } from './utils/exportUtils';

const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham", 
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const GroupbyReportControls = ({
  startDate = '',
  setStartDate = () => {},
  endDate = '',
  setEndDate = () => {},
  business = '',
  setBusiness = () => {},
  groupBy = [],
  setGroupBy = () => {},
  filterOpen = false,
  setFilterOpen = () => {},
  fetchData = () => {},
  rowData = [],
  selectedColumns = [],
  setSelectedColumns = () => {},
  appliedFilters = {},
  loading = false 
}) => {
  const columnOptions = useColumnOptions(business);
  const filterCount = appliedFilters ? Object.keys(appliedFilters).length : 0;
  const { exportToGoogleSheet, loading: exporting } = useExportToSheet();

  const [showArrangement, setShowArrangement] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Add ref for click outside detection
  const arrangementRef = useRef(null);

  // Get business options from localStorage
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
          label: brandName  // friendlier display name
        }));

      
      return availableBusinesses;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return [];
    }
  }, []);

  // Find current business option for Select component
  const selectedBusinessOption = useMemo(() => {
    return businessOptions.find(option => option.value === business) || null;
  }, [business, businessOptions]);

  // Add click outside effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (arrangementRef.current && !arrangementRef.current.contains(event.target)) {
        setShowArrangement(false);
      }
    };

    if (showArrangement) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showArrangement]);
  
  useEffect(() => {
    if (typeof setGroupBy === 'function') {
      setGroupBy((prev = []) =>
        Array.isArray(prev)
          ? prev.filter((item) => selectedColumns.includes(item))
          : []
      );
    }
  }, [selectedColumns, setGroupBy]);

  const selectedColumnsOptions = useMemo(() => {
    return Array.isArray(selectedColumns)
      ? selectedColumns.map((col) => ({ value: col, label: col }))
      : [];
  }, [selectedColumns]);

  const selectedGroupByOptions = useMemo(() => {
    return Array.isArray(groupBy)
      ? groupBy.map((col) => ({ value: col, label: col }))
      : [];
  }, [groupBy]);

  // Sort options to show selected ones first
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

  const sortedGroupByOptions = useMemo(() => {
    const selected = selectedColumnsOptions.filter(option => 
      groupBy.includes(option.value)
    );
    const unselected = selectedColumnsOptions.filter(option => 
      !groupBy.includes(option.value)
    );
    
    return [...selected, ...unselected];
  }, [selectedColumnsOptions, groupBy]);

  // Handle drag and drop for column arrangement
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newColumns = [...selectedColumns];
    const draggedItem = newColumns[draggedIndex];
    
    newColumns.splice(draggedIndex, 1);
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newColumns.splice(insertIndex, 0, draggedItem);
    
    setSelectedColumns(newColumns);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Custom MultiValue component using global styles
  const CustomMultiValue = ({ data, removeProps, selectProps }) => {
    const isGroupBy = selectProps.isGroupBy;
    const allValues = selectProps.value || [];
    const currentIndex = allValues.findIndex(item => item.value === data.value);
    
    if (currentIndex === 0 && allValues.length > 1) {
      return (
        <div className={isGroupBy ? buttonStyles.groupByMultiValue : buttonStyles.multiValue}>
          <span className={buttonStyles.multiValueText}>{data.label}</span>
          <span className={buttonStyles.badge}>+{allValues.length - 1}</span>
        </div>
      );
    } else if (currentIndex === 0) {
      return (
        <div className={isGroupBy ? buttonStyles.groupByMultiValue : buttonStyles.multiValue}>
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

          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formContainer}>
        {/* Single Row Layout */}
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={formStyles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={formStyles.input}
            />
          </div>

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

          <div style={{ ...styles.inputGroup, flex: 2 }}>
            <div style={styles.labelWithBadge}>
              <label className={formStyles.label}>Select Columns</label>
              {selectedColumns.length > 0 && (
                <span className={buttonStyles.badge}>{selectedColumns.length}</span>
              )}
            </div>
            <Select
              isMulti
              options={sortedColumnOptions}
              value={selectedColumnsOptions}
              onChange={(selected) =>
                setSelectedColumns(selected?.map((opt) => opt.value) || [])
              }
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
             
              components={{ MultiValue: CustomMultiValue }}
              menuPlacement="auto"
              menuPosition="fixed"
              isGroupBy={false}
              styles={customSelectStyles}
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 2 }}>
            <div style={styles.labelWithBadge}>
              <label className={formStyles.label}>Group By Fields</label>
              {groupBy.length > 0 && (
                <span className={buttonStyles.badge}>{groupBy.length}</span>
              )}
            </div>
            <Select
              isMulti
              options={sortedGroupByOptions}
              value={selectedGroupByOptions}
              onChange={(selected) =>
                setGroupBy(selected?.map((opt) => opt.value) || [])
              }
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              
              isDisabled={selectedColumns.length === 0}
              components={{ MultiValue: CustomMultiValue }}
              menuPlacement="auto"
              menuPosition="fixed"
              isGroupBy={true}
              styles={customSelectStyles}
            />
          </div>

          <div style={styles.inputGroup}>
            <label className={formStyles.label}>Column Order</label>
            <div style={{ position: 'relative' }} ref={arrangementRef}>
              <button
                onClick={() => setShowArrangement(!showArrangement)}
                className={`${buttonStyles.button} ${selectedColumns.length === 0 ? buttonStyles.disabled : ''}`}
              >
                <Bars3Icon className={buttonStyles.icon} />
                Arrange ({selectedColumns.length})
              </button>

              {showArrangement && selectedColumns.length > 0 && (
                <div className={dragStyles.arrangementDropdown}>
                  <div className={dragStyles.arrangementList}>
                    {selectedColumns.map((col, index) => (
                      <div
                        key={col}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          margin: '2px 0',
                          backgroundColor: dragOverIndex === index ? '#e0f2fe' : '#fff',
                          border: draggedIndex === index
                            ? '2px solid #3b82f6'
                            : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                          fontSize: '13px',
                          boxShadow: draggedIndex === index
                            ? '0 2px 4px rgba(0,0,0,0.1)'
                            : 'none',
                        }}
                      >
                        <span className={dragStyles.orderNumber}>{index + 1}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
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
              {filterCount > 0 && (
                <span className={buttonStyles.badge}>{filterCount}</span>
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
                  Fetch Data
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                  const visibleData = rowData.map(row =>
                    selectedColumns.reduce((acc, col) => {
                      acc[col] = row[col];
                      return acc;
                    }, {})
                  );

                  const columns = selectedColumns.map(col => ({
                    field: col,
                    headerName: col
                  }));

                  exportDataToCSV(visibleData, columns, `SalesReport_${business}_${startDate}_to_${endDate}`);
                }}
              disabled={!Array.isArray(rowData) || rowData.length === 0}
              className={`${buttonStyles.button} ${(!rowData || rowData.length === 0) ? buttonStyles.disabled : ''}`}
            >
              <ArrowDownTrayIcon className={buttonStyles.icon} />
              Export CSV
            </button>

            <button
              onClick={() => {
                  const visibleData = rowData.map(row =>
                    selectedColumns.reduce((acc, col) => {
                      acc[col] = row[col];
                      return acc;
                    }, {})
                  );
                  exportToGoogleSheet(business, "groupby", visibleData);
                }}
              disabled={!rowData || rowData.length === 0 || !business}
              className={`${buttonStyles.button} ${(!rowData || rowData.length === 0 || !business) ? buttonStyles.disabled : ''}`}
            >
              📤 Export to Google Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal inline styles for layout - using same pattern as ReportControls
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
};

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
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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

export default GroupbyReportControls;