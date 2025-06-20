import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const BUSINESS_CODE_MAP = {
  "ZNG45F8J27LKMNQ": "zing",
  "PRT9X2C6YBMLV0F": "prathiksham",
  "BEE7W5ND34XQZRM": "beelittle",
  "ADBXOUERJVK038L": "adoreaboo",
  "Authentication": "task_db"
};

const useTargets = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load the business name directly from localStorage
  const businessName = localStorage.getItem('selectedBusiness');

  // Determine the business code from the business name
  const businessCode = Object.keys(BUSINESS_CODE_MAP).find(code => BUSINESS_CODE_MAP[code] === businessName);

  // Fetch all targets for a business code
  const fetchTargets = async () => {
    if (!businessCode?.trim()) {
      setTargets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/target/list-targets-with-status?business_name=${encodeURIComponent(businessCode)}`,
        {
          withCredentials: true, // ✅ Send cookies for auth/session
        }
      );

      setTargets(response.data || []);
    } catch (err) {
      console.error('Failed to load targets', err);
      setError(err.response?.data?.message || 'Failed to load targets');
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessCode) {
      fetchTargets();
    }
  }, [businessCode]);

  // Update an existing target (status or value)
  const updateTarget = async ({ Business_Name, Target_Column, Target_Key, Start_Date, status, Target_Value }) => {
    try {
      const payload = {
        Business_Name,
        Target_Column,
        Target_Key,
        Start_Date,
      };
      if (status !== undefined) payload.status = status;
      if (Target_Value !== undefined) payload.Target_Value = Target_Value;

      const res = await axios.post(
        `${API_URL}/api/target/update-target-entry`,
        payload,
        {
          withCredentials: true, // ✅ Send cookies
        }
      );

      await fetchTargets(); // refresh list
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Error updating target', err);
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to update target',
      };
    }
  };

  // Add new target entries (append to file)
  const addTargets = async (entries) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/target/set-daily-targets`,
        entries,
        {
          withCredentials: true, // ✅ Added to fix missing cookies
        }
      );
      await fetchTargets(); // optional: refresh to show new ones
      return {
        success: true,
        message: res.data.message,
        entriesAdded: res.data.entries_added,
      };
    } catch (err) {
      console.error('Error adding targets', err);
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to add targets',
      };
    }
  };

  return {
    targets,
    loading,
    error,
    updateTarget,
    addTargets,
    refetch: fetchTargets,
  };
};

export default useTargets;
