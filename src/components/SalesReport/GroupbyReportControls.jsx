import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import {FunnelIcon,ArrowDownTrayIcon,MagnifyingGlassIcon,XMarkIcon,Bars3Icon,
} from '@heroicons/react/24/outline';
import useColumnOptions from './hooks/useColumnOptions';
import useExportToSheet from './hooks/useExportToSheet';
import styles from './styles/ReportControls.module.css';
import formStyles from './styles/formControls.module.css'; 
import dragStyles from './styles/ColumnArrangement.module.css';
import { exportDataToCSV } from './utils/exportUtils'; // adjust path as needed

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
        <div className={isGroupBy ? styles.groupByMultiValue : styles.multiValue}>
          <span className={styles.multiValueText}>{data.label}</span>
          <span className={styles.badge}>+{allValues.length - 1}</span>
        </div>
      );
    } else if (currentIndex === 0) {
      return (
        <div className={isGroupBy ? styles.groupByMultiValue : styles.multiValue}>
          <span className={styles.multiValueText}>{data.label}</span>
          <button
            {...removeProps}
            className={styles.button}
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
            <XMarkIcon className={styles.icon} />
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {/* First Row - Date Inputs and Business ID */}
        <div className={`${formStyles.row} ${formStyles.firstRow}`}>
          <div className={formStyles.fieldGroup}>
            <label className={styles.label}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={formStyles.input}
              style={{
                height: '38px',
                padding: '8px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          <div className={formStyles.fieldGroup}>
            <label className={styles.label}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={formStyles.input}
              style={{
                height: '38px',
                padding: '8px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          <div className={formStyles.fieldGroup}>
            <label className={styles.label}>Business ID</label>
            <input
              type="text"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className={formStyles.input}
              placeholder="Enter Business ID"
              style={{
                height: '38px',
                padding: '8px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
        </div>

        {/* Second Row - Column Selection, Group By, and Column Order */}
        <div className={`${formStyles.row} ${formStyles.secondRow}`}>
          <div className={formStyles.fieldGroup} style={{ flex: '1' }}>
            <div className={styles.labelWithBadge}>
              <label className={styles.label}>Select Columns</label>
              {selectedColumns.length > 0 && (
                <span className={styles.labelCount} style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>{selectedColumns.length}</span>
              )}
            </div>
            <Select
              isMulti
              options={columnOptions}
              value={selectedColumnsOptions}
              onChange={(selected) =>
                setSelectedColumns(selected?.map((opt) => opt.value) || [])
              }
              classNamePrefix="rs"
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              placeholder="Choose columns..."
              components={{ MultiValue: CustomMultiValue }}
              menuPlacement="auto"
              menuPosition="fixed"
              isGroupBy={false}
              styles={customSelectStyles}
            />
          </div>

          <div className={formStyles.fieldGroup} style={{ flex: '1' }}>
            <div className={styles.labelWithBadge}>
              <label className={styles.label}>Group By Fields</label>
              {groupBy.length > 0 && (
                <span className={styles.groupByCount} style={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>{groupBy.length}</span>
              )}
            </div>
            <Select
              isMulti
              options={selectedColumnsOptions}
              value={selectedGroupByOptions}
              onChange={(selected) =>
                setGroupBy(selected?.map((opt) => opt.value) || [])
              }
              classNamePrefix="rs"
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              placeholder={
                selectedColumns.length === 0
                  ? 'Select columns first...'
                  : 'Choose grouping fields...'
              }
              isDisabled={selectedColumns.length === 0}
              components={{ MultiValue: CustomMultiValue }}
              menuPlacement="auto"
              menuPosition="fixed"
              isGroupBy={true}
              styles={customSelectStyles}
            />
          </div>

          <div className={formStyles.fieldGroup} style={{ flex: '0 0 auto', minWidth: '180px' }}>
            <label className={styles.label}>Column Order</label>
            <div className={dragStyles.arrangementContainer} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowArrangement(!showArrangement)}
                className={`${styles.button} ${selectedColumns.length === 0 ? styles.disabled : ''}`}
                style={{ 
                  height: '38px',
                  width: '100%',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: selectedColumns.length === 0 ? '#f9fafb' : '#ffffff',
                  border: '1px solid #e1e5e9',
                  borderRadius: '6px',
                  color: selectedColumns.length === 0 ? '#9ca3af' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: selectedColumns.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                disabled={selectedColumns.length === 0}
                onMouseEnter={(e) => {
                  if (selectedColumns.length > 0) {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedColumns.length > 0) {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#e1e5e9';
                  }
                }}
              >
                <Bars3Icon className={styles.icon} style={{ width: '16px', height: '16px' }} />
                Arrange ({selectedColumns.length})
              </button>

              {showArrangement && selectedColumns.length > 0 && (
                <div className={dragStyles.arrangementDropdown} style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 1000,
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div className={dragStyles.arrangementList} style={{ padding: '8px' }}>
                    {selectedColumns.map((col, index) => (
                      <div
                        key={col}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={dragStyles.arrangementItem}
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
                        <Bars3Icon className={dragStyles.dragIcon} style={{ 
                          width: '14px', 
                          height: '14px', 
                          color: '#9ca3af',
                          marginRight: '8px',
                          flexShrink: 0
                        }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
                        <span className={dragStyles.orderNumber} style={{
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500',
                          marginLeft: '8px'
                        }}>{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className={styles.actionRow} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          marginTop: '20px'
        }}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={styles.advancedButton}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: filterOpen ? '#374151' : '#ffffff',
              color: filterOpen ? '#ffffff' : '#374151',
              border: '1px solid #e1e5e9',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!filterOpen) {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#3b82f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!filterOpen) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#e1e5e9';
              }
            }}
          >
            <FunnelIcon className={styles.icon} style={{ width: '16px', height: '16px' }} />
            Advanced Filters
            {filterCount > 0 && (
              <span className={styles.badge} style={{
                backgroundColor: filterOpen ? '#ffffff' : '#dc2626',
                color: filterOpen ? '#374151' : '#ffffff',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600',
                marginLeft: '4px'
              }}>{filterCount}</span>
            )}
          </button>
          
          <div className={styles.rightActions} style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchData}
              className={`${styles.button} ${styles.primary} ${loading ? styles.disabled : ''}`}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className={styles.icon} style={{ width: '16px', height: '16px' }} />
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
              className={`${styles.button} ${(!rowData || rowData.length === 0) ? styles.disabled : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: (!rowData || rowData.length === 0) ? '#f9fafb' : '#ffffff',
                color: (!rowData || rowData.length === 0) ? '#9ca3af' : '#374151',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (!rowData || rowData.length === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (rowData && rowData.length > 0) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (rowData && rowData.length > 0) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#e1e5e9';
                }
                
              }}
            >
              <ArrowDownTrayIcon className={styles.icon} style={{ width: '16px', height: '16px' }} />
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
                  exportToGoogleSheet(business, visibleData);
                }}
              disabled={!rowData || rowData.length === 0 || !business}
              className={`${styles.button} ${(!rowData || rowData.length === 0 || !business) ? styles.disabled : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: (!rowData || rowData.length === 0 || !business) ? '#f9fafb' : '#ffffff',
                color: (!rowData || rowData.length === 0 || !business) ? '#9ca3af' : '#374151',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (!rowData || rowData.length === 0 || !business) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (rowData && rowData.length > 0 && business) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                if (rowData && rowData.length > 0 && business) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#e1e5e9';
                }
              }}
            >
              📤 Export to Google Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    height: '38px',
    minHeight: '38px',
    fontSize: '14px',
    borderRadius: '6px',
    borderColor: state.isFocused ? '#3b82f6' : '#e1e5e9',
    border: '1px solid #e1e5e9',
    borderWidth: '1px',
    backgroundColor: '#ffffff',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
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
    padding: '8px',
    color: state.isFocused ? '#3b82f6' : '#9ca3af',
    transition: 'color 0.15s ease',
    '&:hover': {
      color: '#3b82f6',
    },
  }),

  valueContainer: (base) => ({
    ...base,
    padding: '4px 12px',
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
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#f1f5f9',
    },
  }),
  
  menuPortal: base => ({ ...base, zIndex: 9999 }),
};

export default GroupbyReportControls;