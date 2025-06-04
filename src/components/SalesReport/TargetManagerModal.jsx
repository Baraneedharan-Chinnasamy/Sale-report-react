import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { PlusIcon } from '@heroicons/react/24/solid';
import useTargets from './hooks/useTargets';
import useFilterManagement from './hooks/useFilterManagement';

const TargetManagerModal = ({ isOpen, onClose, businessName }) => {
  const { targets, loading, error, updateTarget, addTargets, refetch } = useTargets(businessName);
  const { fetchAvailableFields, availableFields, fetchFieldValues } = useFilterManagement(businessName);

  const [editingValues, setEditingValues] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [columnOptions, setColumnOptions] = useState([]);
  const [newTarget, setNewTarget] = useState({
    Target_Column: '',
    Target_Key: '',
    Start_Date: '',
    Target_Value: ''
  });

  const modalRef = useRef();

  useEffect(() => {
    if (isOpen && businessName) {
      fetchAvailableFields();
    }
  }, [isOpen, businessName, fetchAvailableFields]);

  useEffect(() => {
    if (availableFields.length) {
      setColumnOptions(availableFields.map(field => ({
        value: field,
        label: field.replace(/_/g, ' ')
      })));
    }
  }, [availableFields]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleValueChange = (index, value) => {
    setEditingValues((prev) => ({ ...prev, [index]: value }));
  };

  const handleBlur = async (target, index) => {
    const newValue = editingValues[index];
    if (newValue !== undefined && newValue !== target.Target_Value) {
      const res = await updateTarget({
        ...target,
        Business_Name: businessName,
        Target_Value: newValue
      });
      if (res.success) refetch();
      else alert(res.message);
    }
    setEditingIndex(null);
  };

  const handleToggleStatus = async (target) => {
    const res = await updateTarget({
      ...target,
      Business_Name: businessName,
      status: !target.Status
    });
    if (res.success) refetch();
    else alert(res.message);
  };

  const handleAddTarget = async () => {
    if (!newTarget.Target_Column || !newTarget.Target_Key || !newTarget.Start_Date || !newTarget.Target_Value) {
      alert('Please fill out all fields.');
      return;
    }

    const payload = {
      ...newTarget,
      Business_Name: businessName,
      Target_Value: Number(newTarget.Target_Value)
    };

    const res = await addTargets([payload]);
    if (res.success) {
      refetch();
      setShowAddForm(false);
      setNewTarget({
        Target_Column: '',
        Target_Key: '',
        Start_Date: '',
        Target_Value: ''
      });
    } else {
      alert(res.message);
    }
  };

  const unifiedInputStyle = {
    control: (base) => ({
      ...base,
      minHeight: '36px',
      fontSize: '14px'
    }),
    menu: (base) => ({
      ...base,
      fontSize: '13px'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '4px'
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '4px'
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px'
    }),
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} ref={modalRef}>
        <div style={styles.modalInner}>
          <div style={styles.header}>
            <span style={styles.icon}>🎯</span>
            <h2 style={styles.title}>Target Manager</h2>
            <button onClick={onClose} style={styles.closeIcon}>✖</button>
          </div>

          <div style={styles.content}>
            {showAddForm && (
              <div style={{ ...styles.card, border: '1px solid #f97316', backgroundColor: '#fff7ed' }}>
                <Select
                  styles={unifiedInputStyle}
                  placeholder="Target Column"
                  options={columnOptions}
                  value={columnOptions.find(opt => opt.value === newTarget.Target_Column)}
                  onChange={(selected) =>
                    setNewTarget(prev => ({ ...prev, Target_Column: selected?.value || '', Target_Key: '' }))
                  }
                />
                <AsyncPaginate
                  styles={unifiedInputStyle}
                  key={newTarget.Target_Column}
                  value={newTarget.Target_Key ? { label: newTarget.Target_Key, value: newTarget.Target_Key } : null}
                  loadOptions={async (inputValue, loadedOptions, { page = 1 }) => {
                    const { values, hasMore } = await fetchFieldValues(newTarget.Target_Column, inputValue, page);
                    return {
                      options: values.map(v => ({ label: v, value: v })),
                      hasMore,
                      additional: { page: page + 1 }
                    };
                  }}
                  onChange={(selected) =>
                    setNewTarget(prev => ({ ...prev, Target_Key: selected?.value || '' }))
                  }
                  additional={{ page: 1 }}
                  isClearable
                  placeholder="Target Key"
                />
                <input
                  type="date"
                  value={newTarget.Start_Date}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, Start_Date: e.target.value }))}
                  style={styles.inputField}
                />
                <input
                  type="number"
                  placeholder="Target Value"
                  value={newTarget.Target_Value}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, Target_Value: e.target.value }))}
                  style={styles.inputField}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => setShowAddForm(false)} style={{ ...styles.closeButton, color: '#b91c1c', backgroundColor: '#fef2f2' }}>Cancel</button>
                  <button onClick={handleAddTarget} style={{ ...styles.closeButton, color: '#fff', backgroundColor: '#10b981' }}>Add</button>
                </div>
              </div>
            )}

            {loading && <p>Loading targets...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {targets.map((target, index) => (
              <div key={index} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.targetHeading}>{target.Target_Column} — {target.Target_Key}</div>
                  <div style={styles.targetSubText}>
                    📅 {new Date(target.Start_Date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>
                <div style={styles.cardBottom}>
                  <div style={styles.editableField}>
                    <label style={styles.valueLabel}>Target:</label>
                    {editingIndex === index ? (
                      <input
                        type="number"
                        autoFocus
                        value={editingValues[index] ?? target.Target_Value}
                        onChange={(e) => handleValueChange(index, Number(e.target.value))}
                        onBlur={() => handleBlur(target, index)}
                        style={styles.inputField}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingValues(prev => ({ ...prev, [index]: target.Target_Value }));
                        }}
                        style={styles.displayValue}
                      >
                        ₹ {Number(target.Target_Value).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(target)}
                    style={{
                      ...styles.statusButton,
                      backgroundColor: target.Status ? '#ef4444' : '#10b981'
                    }}
                  >
                    {target.Status ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.footer}>
            <div style={styles.footerActions}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={styles.addButton}
              >
                <PlusIcon style={{ width: '14px', height: '14px' }} />
                Add Target
              </button>
              <button onClick={onClose} style={styles.closeButton}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '850px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '0 24px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0'
  },
  icon: { fontSize: '1.4rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, flex: 1 },
  closeIcon: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '16px'
  },
  footer: {
    borderTop: '1px solid #e5e7eb',
    padding: '12px 0',
    backgroundColor: '#fff'
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  closeButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    fontWeight: 500,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px 32px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #e5e7eb',
  },
  cardTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px'
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  targetHeading: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827',
    letterSpacing: '0.2px'
  },
  targetSubText: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 400
  },
  editableField: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  valueLabel: {
    fontWeight: 600,
    fontSize: '14px'
  },
  inputField: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    height: '36px',
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box'
  },
  displayValue: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '14px',
    color: '#111827',
    cursor: 'pointer'
  },
  statusButton: {
    padding: '8px 16px',
    borderRadius: '9999px',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  }
};

export default TargetManagerModal;
