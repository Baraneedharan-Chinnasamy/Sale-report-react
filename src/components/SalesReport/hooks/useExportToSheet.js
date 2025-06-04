import { useState } from 'react';

const useExportToSheet = () => {
  const [load, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const exportToGoogleSheet = async (brand, data) => {
    setLoading(true);
    setSuccessMessage('');
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/export-to-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand,
          data,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message || 'Export successful!');
      } else {
        setError(result.message || 'Failed to export');
      }
    } catch (err) {
      setError('Unexpected error while exporting');
      console.error('Export Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    exportToGoogleSheet,
    load,
    successMessage,
    error,
  };
};

export default useExportToSheet;
