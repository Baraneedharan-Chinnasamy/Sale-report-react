import React from 'react';

const ViewButtonRenderer = (props) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick({
        data: props.data,
        value: props.value,
        colDef: {
          field: props.colDef.field
        }
      });
    }
  };

  // If no value or not an object, just display the value
  if (!props.value) return <span>-</span>;
  if (typeof props.value !== 'object' && props.value !== 'View') return <span>{props.value}</span>;

  return (
    <span
      onClick={handleClick}
      style={{
        color: '#6B9FF8',
        fontWeight: '500',
        fontSize: '14px',
        cursor: 'pointer',
        textDecoration: 'underline',
        transition: 'color 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#AB64F7'}
      onMouseLeave={(e) => e.currentTarget.style.color = '#6B9FF8'}
    >
      View
    </span>
  );
};

export default ViewButtonRenderer;
