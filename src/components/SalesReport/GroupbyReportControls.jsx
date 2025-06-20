  import React, { useEffect, useMemo, useState, useRef } from 'react';
  import Select from 'react-select';
  import {
    FunnelIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    Bars3Icon,
  } from '@heroicons/react/24/outline';
  import useExportToSheet from './hooks/useExportToSheet';
  import buttonStyles from './styles/ReportControls.module.css';
  import formStyles from './styles/formControls.module.css'; 
  import dragStyles from './styles/ColumnArrangement.module.css';
  import styles from './styles/GroupbyReportControls.module.css';
  import { exportDataToCSV } from './utils/exportUtils';
  import { customSelectStyles } from './styles/selectStyles';

  const BUSINESS_CODE_MAP = {
    "ZNG45F8J27LKMNQ": "zing",
    "PRT9X2C6YBMLV0F": "prathiksham", 
    "BEE7W5ND34XQZRM": "beelittle",
    "ADBXOUERJVK038L": "adoreaboo",
    "Authentication": "task_db"
  };

  const BRAND_SHEET_MAP = {
    "prathiksham": "https://docs.google.com/spreadsheets/d/1q5CAMOxVZnFAowxq9w0bbuX9bEPtwJOa9ERA3wCOReQ/edit?usp=sharing",
    "BEE7W5NDbeelittle34XQZRM": "https://docs.google.com/spreadsheets/d/1fyzL0TPVWSvQ71-N14AIav9e0qCAqGRu47dhUjA2R44/edit?usp=sharing",
    "adoreaboo": "https://docs.google.com/spreadsheets/d/1AmFyKI_XMIrSsxyVk11fEgwa8RJMcBwYSKWuQvHh-eU/edit?usp=sharing",
    "zing": "https://docs.google.com/spreadsheets/d/15Y79kB1STCwCTNJT6dcK-weqazbqQeptXzXcDgJykT8/edit?usp=sharing"
  };

  const GroupbyReportControls = ({
    startDate = '',
    setStartDate = () => {},
    endDate = '',
    setEndDate = () => {},
    groupBy = [],
    setGroupBy = () => {},
    filterOpen = false,
    setFilterOpen = () => {},
    fetchData = () => {},
    rowData = [],
    selectedColumns = [],
    setSelectedColumns = () => {},
    aggregationColumns = [],
    setAggregationColumns = () => {},
    appliedFilters = {},
    loading = false 
  }) => {
    const [showArrangement, setShowArrangement] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [columnOptions, setColumnOptions] = useState([]);
    const [aggColumnOptions, setAggColumnOptions] = useState([]);
    
    // FIX 1: Use useState instead of useMemo for business
    const [business, setBusiness] = useState('');
    
    const combinedColumns = [...selectedColumns, ...aggregationColumns];
    const arrangementRef = useRef(null);
    const { exportToGoogleSheet, loading: exporting } = useExportToSheet();

    // FIX 2: Add effect to listen for localStorage changes and initialize business
    useEffect(() => {
      const initializeBusiness = () => {
        try {
          const selectedBusiness = localStorage.getItem('selectedBusiness') || '';
          setBusiness(selectedBusiness);
        } catch (error) {
          console.error('Error getting business from localStorage:', error);
          setBusiness('');
        }
      };

      // Initialize on mount
      initializeBusiness();

      // FIX 3: Listen for storage events (when localStorage changes in other tabs/windows)
      const handleStorageChange = (e) => {
        if (e.key === 'selectedBusiness') {
          setBusiness(e.newValue || '');
        }
      };

      // FIX 4: Listen for custom events (for same-tab localStorage changes)
      const handleBusinessChange = (e) => {
        if (e.detail && e.detail.business) {
          setBusiness(e.detail.business);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('businessChanged', handleBusinessChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('businessChanged', handleBusinessChange);
      };
    }, []);

    // Get current business name for display
    const currentBusinessName = useMemo(() => {
      return business ? BUSINESS_CODE_MAP[business] : '';
    }, [business]);

    // Get current Google Sheets link based on selected business
    const currentGoogleSheetLink = useMemo(() => {
      return business ? BRAND_SHEET_MAP[business] : null;
    }, [business]);

    // FIX 5: Load column options when business changes
    useEffect(() => {
      const loadColumnOptions = () => {
        if (business) {
          try {
            const businessData = localStorage.getItem(business);
            if (businessData) {
              const data = JSON.parse(businessData);
              
              // Set column options
              if (data.columnNames) {
                const colOptions = data.columnNames.map(col => ({
                  value: col,
                  label: col
                }));
                setColumnOptions(colOptions);
              }
              
              // Set aggregation column options
              if (data.aggColumns) {
                const aggOptions = data.aggColumns.map(col => ({
                  value: col,
                  label: col
                }));
                setAggColumnOptions(aggOptions);
              }
            } else {
              // FIX 6: Reset options if no data found
              setColumnOptions([]);
              setAggColumnOptions([]);
            }
          } catch (error) {
            console.error('Error loading column options:', error);
            setColumnOptions([]);
            setAggColumnOptions([]);
          }
        } else {
          setColumnOptions([]);
          setAggColumnOptions([]);
        }
      };

      loadColumnOptions();
    }, [business]); // Only depend on business

    // Click outside effect for arrangement dropdown
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
            ? prev.filter((item) => combinedColumns.includes(item))
            : []
        );
      }
    }, [combinedColumns, setGroupBy]);

    const selectedColumnsOptions = useMemo(() => {
      return Array.isArray(selectedColumns)
        ? selectedColumns.map((col) => ({ value: col, label: col }))
        : [];
    }, [selectedColumns]);

    const selectedAggregationOptions = useMemo(() => {
      return Array.isArray(aggregationColumns)
        ? aggregationColumns.map((col) => ({ value: col, label: col }))
        : [];
    }, [aggregationColumns]);

    const selectedGroupByOptions = useMemo(() => {
      return Array.isArray(groupBy)
        ? groupBy.map((col) => ({ value: col, label: col }))
        : [];
    }, [groupBy]);

    // Sort options to show selected ones first
    const sortedColumnOptions = useMemo(() => {
      if (!columnOptions.length) return [];
      
      const selected = columnOptions.filter(option => 
        selectedColumns.includes(option.value)
      );
      const unselected = columnOptions.filter(option => 
        !selectedColumns.includes(option.value)
      );
      
      return [...selected, ...unselected];
    }, [columnOptions, selectedColumns]);

    const sortedAggColumnOptions = useMemo(() => {
      if (!aggColumnOptions.length) return [];
      
      const selected = aggColumnOptions.filter(option => 
        aggregationColumns.includes(option.value)
      );
      const unselected = aggColumnOptions.filter(option => 
        !aggregationColumns.includes(option.value)
      );
      
      return [...selected, ...unselected];
    }, [aggColumnOptions, aggregationColumns]);

    const sortedGroupByOptions = useMemo(() => {
      const selected = selectedColumnsOptions.filter(option => 
        groupBy.includes(option.value)
      );
      const unselected = selectedColumnsOptions.filter(option => 
        !groupBy.includes(option.value)
      );
      
      return [...selected, ...unselected];
    }, [selectedColumnsOptions, groupBy]);

    // Check if fetch should be enabled
    const canFetch = useMemo(() => {
      return business && selectedColumns.length > 0 && aggregationColumns.length > 0 && groupBy.length > 0;
    }, [business, selectedColumns, aggregationColumns, groupBy]);

    // Drag and drop handlers - Updated to handle combined columns
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

      const newCombinedColumns = [...combinedColumns];
      const draggedItem = newCombinedColumns[draggedIndex];

      // Remove the dragged item
      newCombinedColumns.splice(draggedIndex, 1);
      
      // Insert at new position
      const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newCombinedColumns.splice(insertIndex, 0, draggedItem);

      // Separate back into selectedColumns and aggregationColumns while maintaining order
      const newSelectedColumns = [];
      const newAggregationColumns = [];

      newCombinedColumns.forEach(col => {
        if (selectedColumns.includes(col)) {
          newSelectedColumns.push(col);
        } else if (aggregationColumns.includes(col)) {
          newAggregationColumns.push(col);
        }
      });

      setSelectedColumns(newSelectedColumns);
      setAggregationColumns(newAggregationColumns);
      setDraggedIndex(null);
      setDragOverIndex(null);
    };

    const handleDragEnd = (e) => {
      e.target.style.opacity = '1';
      setDraggedIndex(null);
      setDragOverIndex(null);
    };

    // Export handlers
    const handleCSVExport = () => {
      const visibleColumns = [...selectedColumns, ...aggregationColumns];
      const visibleData = rowData.map(row =>
        visibleColumns.reduce((acc, col) => {
          acc[col] = row[col];
          return acc;
        }, {})
      );

      const columns = visibleColumns.map(col => ({
        field: col,
        headerName: col
      }));

      exportDataToCSV(visibleData, columns, `SalesReport_${business}_${startDate}_to_${endDate}`);
    };

    const handleGoogleSheetExport = () => {
      const visibleColumns = [...selectedColumns, ...aggregationColumns];
      const visibleData = rowData.map(row =>
        visibleColumns.reduce((acc, col) => {
          acc[col] = row[col];
          return acc;
        }, {})
      );
      exportToGoogleSheet(business, "groupby", visibleData);
    };

    // Custom MultiValue component
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
              <XMarkIcon style={{ width: '12px', height: '12px' }} />
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
          {/* Business Display */}
          {currentBusinessName && (
            <div className={styles.businessDisplay}>
              <span className={formStyles.label}>Business: </span>
              <span className={styles.businessName}>{currentBusinessName}</span>
            </div>
          )}

          {/* Form Inputs Row */}
          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label className={formStyles.label}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={formStyles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={formStyles.label}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={formStyles.input}
              />
            </div>

            <div className={styles.inputGroupFlex2}>
              <div className={styles.labelWithBadge}>
                <label className={formStyles.label}>Select Columns <span style={{color: 'red'}}>*</span> </label>
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
                isDisabled={!business}
                components={{ MultiValue: CustomMultiValue }}
                menuPlacement="auto"
                menuPosition="fixed"
                isGroupBy={false}
                styles={customSelectStyles}
              />
            </div>

            <div className={styles.inputGroupFlex2}>
              <div className={styles.labelWithBadge}>
                <label className={formStyles.label}>Aggregation Columns<span style={{color: 'red'}}>*</span></label>
                {aggregationColumns.length > 0 && (
                  <span className={buttonStyles.badge}>{aggregationColumns.length}</span>
                )}
              </div>
              <Select
                isMulti
                options={sortedAggColumnOptions}
                value={selectedAggregationOptions}
                onChange={(selected) =>
                  setAggregationColumns(selected?.map((opt) => opt.value) || [])
                }
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isDisabled={!business}
                components={{ MultiValue: CustomMultiValue }}
                menuPlacement="auto"
                menuPosition="fixed"
                isGroupBy={false}
                styles={customSelectStyles}
              />
            </div>

            <div className={styles.inputGroupFlex2}>
              <div className={styles.labelWithBadge}>
                <label className={formStyles.label}>
                  Group By Fields <span style={{color: 'red'}}>*</span>
                </label>
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

            <div className={styles.inputGroup}>
              <label className={formStyles.label}>Column Order</label>
              <div className={styles.arrangementContainer} ref={arrangementRef}>
                <button
                  onClick={() => setShowArrangement(!showArrangement)}
                  className={`${buttonStyles.button} ${combinedColumns.length === 0 ? buttonStyles.disabled : ''}`}
                  disabled={combinedColumns.length === 0}
                >
                  <Bars3Icon className={buttonStyles.icon} />
                  Arrange ({combinedColumns.length})
                </button>

                {showArrangement && combinedColumns.length > 0 && (
                  <div className={dragStyles.arrangementDropdown}>
                    <div className={dragStyles.arrangementList}>
                      {combinedColumns.map((col, index) => {
                        const isSelectedColumn = selectedColumns.includes(col);
                        const isAggregationColumn = aggregationColumns.includes(col);
                        
                        return (
                          <div
                            key={col}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                              ${styles.dragListItem}
                              ${draggedIndex === index ? styles.dragging : ''}
                              ${dragOverIndex === index ? styles.dragOver : ''}
                            `}
                          >
                            <span className={dragStyles.orderNumber}>{index + 1}</span>
                            <span className={styles.dragListItemContent}>
                              {col}
                              <span 
                                className={styles.columnType}
                                style={{
                                  color: isSelectedColumn ? '#3b82f6' : '#10b981',
                                  fontSize: '12px',
                                  marginLeft: '8px',
                                  fontWeight: '500'
                                }}
                              >
                                ({isSelectedColumn ? 'Select' : 'Agg'})
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className={styles.buttonRow}>
            <div className={styles.leftButtons}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={buttonStyles.advancedButton}
                disabled={!business}
                style={{
                  backgroundColor: filterOpen ? '#374151' : '#ffffff',
                  color: filterOpen ? '#ffffff' : '#374151',
                  opacity: !business ? 0.5 : 1,
                  cursor: !business ? 'not-allowed' : 'pointer'
                }}
              >
                <FunnelIcon className={buttonStyles.icon} />
                Advanced Filters
                {Object.keys(appliedFilters).length > 0 && (
                  <span className={buttonStyles.badge}>{Object.keys(appliedFilters).length}</span>
                )}
              </button>
            </div>
            
            <div className={styles.rightButtons}>
              <button
                onClick={fetchData}
                className={`${buttonStyles.button} ${buttonStyles.primary} ${loading || !canFetch ? buttonStyles.disabled : ''}`}
                disabled={loading || !canFetch}
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
                onClick={handleCSVExport}
                disabled={!Array.isArray(rowData) || rowData.length === 0}
                className={`${buttonStyles.button} ${(!rowData || rowData.length === 0) ? buttonStyles.disabled : ''}`}
              >
                <ArrowDownTrayIcon className={buttonStyles.icon} />
                Export CSV
              </button>

              <div className={styles.exportSheetContainer}>
                <button
                  onClick={handleGoogleSheetExport}
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
                    className={styles.sheetIconLink}
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

  export default GroupbyReportControls;