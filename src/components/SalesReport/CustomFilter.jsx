import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';

const CustomFilter = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState(new Set());
  const [allValues, setAllValues] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const inputRef = useRef(null);

  // Get unique values from the column
  useEffect(() => {
    const { api, column } = props;
    const colId = column.getColId();
    const values = new Set();
    
    api.forEachNode(node => {
      const value = api.getValue(colId, node);
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      } else {
        values.add('(Blanks)');
      }
    });
    
    const sortedValues = Array.from(values).sort((a, b) => {
      if (a === '(Blanks)') return 1;
      if (b === '(Blanks)') return -1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    
    setAllValues(sortedValues);
    setSelectedValues(new Set(sortedValues));
  }, [props.api, props.column]);

  // Filter values based on search term
  const filteredValues = useMemo(() => {
    if (!searchTerm) return allValues;
    return allValues.filter(value => 
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allValues, searchTerm]);

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedValues(new Set());
      setSelectAll(false);
    } else {
      setSelectedValues(new Set(filteredValues));
      setSelectAll(true);
    }
  };

  // Handle individual value selection
  const handleValueToggle = (value) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    setSelectedValues(newSelected);
    setSelectAll(newSelected.size === filteredValues.length);
  };

  // Update select all state when filtered values change
  useEffect(() => {
    const allFilteredSelected = filteredValues.every(value => selectedValues.has(value));
    setSelectAll(allFilteredSelected && filteredValues.length > 0);
  }, [filteredValues, selectedValues]);

  // Apply filter
  const applyFilter = () => {
    const { api, column } = props;
    const colId = column.getColId();
    
    if (selectedValues.size === 0) {
      // No values selected - hide all rows
      api.setFilterModel({
        ...api.getFilterModel(),
        [colId]: {
          filterType: 'set',
          values: []
        }
      });
    } else if (selectedValues.size === allValues.length) {
      // All values selected - remove filter
      const filterModel = api.getFilterModel();
      delete filterModel[colId];
      api.setFilterModel(filterModel);
    } else {
      // Some values selected
      const filterValues = Array.from(selectedValues).filter(v => v !== '(Blanks)');
      const includeBlanks = selectedValues.has('(Blanks)');
      
      api.setFilterModel({
        ...api.getFilterModel(),
        [colId]: {
          filterType: 'set',
          values: filterValues,
          includeBlanks
        }
      });
    }
    
    props.parentFilterInstance.hidePopup();
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedValues(new Set(allValues));
    setSelectAll(true);
    setSearchTerm('');
    
    const { api, column } = props;
    const filterModel = api.getFilterModel();
    delete filterModel[column.getColId()];
    api.setFilterModel(filterModel);
  };

  // Close filter
  const closeFilter = () => {
    props.parentFilterInstance.hidePopup();
  };

  // Focus search input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="custom-filter-container" style={{
      width: '250px',
      maxHeight: '400px',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with sorting options */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '13px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          Sort A to Z
        </div>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          Sort Z to A
        </div>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          Sort by colour →
        </div>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>
          Filter by colour →
        </div>
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '8px',
          marginTop: '8px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '8px' }}>
            Filter by values ▼
          </div>
        </div>
      </div>

      {/* Search box */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={14} style={{
            position: 'absolute',
            left: '8px',
            color: '#6b7280'
          }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 6px 6px 28px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Select All option */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flex: 1
          }}>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              style={{ marginRight: '8px' }}
            />
            Select all
          </label>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {selectedValues.size}/{allValues.length}
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px'
        }}>
          <button
            onClick={() => setSelectedValues(new Set(allValues))}
            style={{
              fontSize: '11px',
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Select all
          </button>
          <button
            onClick={() => setSelectedValues(new Set())}
            style={{
              fontSize: '11px',
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Values list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '200px',
        padding: '4px 0'
      }}>
        {filteredValues.map(value => (
          <label
            key={value}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '14px',
              height: '14px',
              marginRight: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selectedValues.has(value) ? '#2563eb' : 'white'
            }}>
              {selectedValues.has(value) && (
                <Check size={10} style={{ color: 'white' }} />
              )}
            </div>
            <span style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {value}
            </span>
            <input
              type="checkbox"
              checked={selectedValues.has(value)}
              onChange={() => handleValueToggle(value)}
              style={{ display: 'none' }}
            />
          </label>
        ))}
      </div>

      {/* Footer with buttons */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={clearFilter}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
        <button
          onClick={closeFilter}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={applyFilter}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            border: '1px solid #2563eb',
            borderRadius: '4px',
            backgroundColor: '#2563eb',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomFilter;