import { useEffect, useState } from 'react';
import axios from 'axios';

const useColumnOptions = (business) => {
  const [columnOptions, setColumnOptions] = useState([]);

  useEffect(() => {
    const fetchColumns = async () => {
      if (!business) {
        setColumnOptions([]);
        return;
      }

      try {
        const res = await axios.post('http://localhost:8000/api/get_column_names', null, {
          params: { business },
        });

        if (res?.data?.columns) {
          setColumnOptions(
            res.data.columns.map((col) => ({ label: col, value: col }))
          );
        } else {
          setColumnOptions([]);
        }
      } catch (err) {
        console.error('Error fetching columns:', err);
        setColumnOptions([]);
      }
    };

    fetchColumns();
  }, [business]);

  return columnOptions;
};

export default useColumnOptions;
