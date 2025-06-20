// selectStyles.js - Custom styles for react-select components

export const customSelectStyles = {
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
    padding: '4px 40px 4px 12px',
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