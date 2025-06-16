import React, { useEffect, useState, useRef } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import Select from 'react-select';
import Button from './ui/Button';
import {
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/solid';

const AdvancedFilters = ({
  filterConfig,
  availableFields,
  fetchFieldValues,
  updateFilter,
  removeFilter,
  addFilter,
  resetFilters,
  applyFilters
}) => {
  const selectRefs = useRef({});
  const [optionCache, setOptionCache] = useState({});

  const loadOptions = async (field, inputValue, loadedOptions, additional = { page: 1 }) => {
    const isSearch = inputValue?.length >= 3;
    const page = additional.page || 1;
    const result = await fetchFieldValues(field, isSearch ? inputValue : '', page);
    const values = result && result.values ? result.values : [];
    const hasMore = result && typeof result.hasMore !== 'undefined' ? result.hasMore : false;
    const newOptions = (values || []).map((v) => ({ label: v, value: v }));
    return { options: newOptions, hasMore, additional: { page: page + 1 } };
  };

  useEffect(() => {
  const loadMissingOptions = async () => {
    for (const filter of filterConfig) {
      if (filter.field && !optionCache[filter.field]) {
        try {
          const result = await fetchFieldValues(filter.field);
          const values = result?.values || [];
          setOptionCache(prev => ({
            ...prev,
            [filter.field]: values.map(v => ({ label: v, value: v }))
          }));
        } catch (err) {
          console.error(`Failed to load values for field: ${filter.field}`, err);
        }
      }
    }
  };

  loadMissingOptions();
}, [filterConfig, fetchFieldValues]);


  const handleFieldChange = (index, newField) => {
    updateFilter(index, 'field', newField);
    updateFilter(index, 'value', []);
    if (selectRefs.current[index]) {
      selectRefs.current[index].clearValue();
    }
    if (newField && !optionCache[newField]) {
      fetchFieldValues(newField);
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '30px',
      height: '30px',
      borderColor: '#cbd5e1',
      borderRadius: '6px',
      fontSize: '12.5px',
      paddingLeft: '4px',
      paddingRight: '4px',
      backgroundColor: '#fff',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(37, 99, 235, 0.4)' : 'none',
      '&:hover': {
        borderColor: '#94a3b8',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 4px',
      height: '30px',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '30px',
      padding: '0 4px',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '2px',
      svg: {
        width: '14px',
        height: '14px',
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
      fontSize: '12.5px',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#0f172a',
      color: '#fff',
      borderRadius: '4px',
      padding: '0 4px',
      fontSize: '12px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#fff',
      fontWeight: 500,
      fontSize: '12px',
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '13px',
      padding: '6px 10px',
      backgroundColor: state.isFocused
        ? 'rgba(59, 130, 246, 0.1)' // light blue on hover
        : 'white',
      color: '#0f172a',
      cursor: 'pointer',
    }),
    menu: (base) => ({
      ...base,
      fontSize: '13px',
      borderRadius: '6px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      zIndex: 9999,
      overflow: 'hidden',
    }),

    menuList: (base) => ({
      ...base,
      maxHeight: '150px',
      overflowY: 'auto',
    }),
  };

  const operatorOptions = [
    { label: 'In', value: 'In' },
    { label: 'Not In', value: 'Not_In' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Advanced Filters</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={resetFilters}
            style={{
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '8px',
              color: '#343434',
              border: '1px solid #d1d5db'
            }}
          >
            <XMarkIcon style={{ width: '14px', height: '14px' }} />
            Reset All
          </Button>
          <Button
            onClick={applyFilters}
            style={{
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#343434',
              border: '1px solid #d1d5db'
            }}
          >
            <CheckIcon style={{ width: '16px', height: '16px' }} />
            Apply Filters
          </Button>
        </div>
      </div>

      {filterConfig.map((filter, index) => {
        const fieldOptions = availableFields.map(f => ({
          label: f.replaceAll('_', ' '),
          value: f,
        }));

        return (
          <div key={index} style={styles.filterRow}>
            <Select
              options={fieldOptions}
              value={fieldOptions.find(opt => opt.value === filter.field)}
              onChange={(selected) => handleFieldChange(index, selected?.value)}
              styles={{
                ...customSelectStyles,
                container: (base) => ({
                  ...base,
                  minWidth: '180px', // Adjust width here
                  flexShrink: 0
                })
              }}
              placeholder="Select Field"

            />

            <Select
              options={operatorOptions}
              value={operatorOptions.find(opt => opt.value === filter.operator)}
              onChange={(selected) => updateFilter(index, 'operator', selected?.value)}
              styles={customSelectStyles}
              placeholder="Operator"

            />

            <div style={{ flex: 1 }}>
              {filter.field && (
                <AsyncPaginate
                  isMulti
                  ref={(ref) => {
                    if (ref) {
                      selectRefs.current[index] = ref;
                    }
                  }}
                  key={`select-${filter.field}-${index}`}
                  defaultOptions={optionCache[filter.field] || []}
                  value={
                    Array.isArray(filter.value) && filter.value.length > 0
                      ? filter.value.map((val) => ({ label: val, value: val }))
                      : null
                  }
                  loadOptions={(inputValue, loadedOptions, additional) =>
                    loadOptions(filter.field, inputValue, loadedOptions, additional)
                  }
                  onChange={(selected) =>
                    updateFilter(index, 'value', selected ? selected.map((s) => s.value) : [])
                  }
                  placeholder="Search (min 3 char) or select values..."
                  additional={{ page: 1 }}
                  styles={customSelectStyles}

                />
              )}
            </div>

            <Button
              onClick={() => removeFilter(index)}
              style={{
                backgroundColor: '#ef4444', padding: '4px 6px', height: '28px',
                width: '28px',
                minWidth: 'unset',
                borderRadius: '6px',
                fontSize: '14px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              ✕
            </Button>

          </div>
        );
      })}

      <Button
        onClick={addFilter}
        style={{
          marginTop: '10px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 500,
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '13px',
          color: 'black',
          border: '1px solid #d1d5db'
        }}
      >
        <PlusIcon style={{ width: '14px', height: '14px' }} />
        Add Filter Condition
      </Button>

    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  }
  ,
  header: {
    display: 'flex',

    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '500',
    color: '#1e293b'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    padding: '8px',
    backgroundColor: 'transparent',
    borderRadius: '0px',
    border: 'none',
    boxShadow: 'none'
  }


};

export default AdvancedFilters;
