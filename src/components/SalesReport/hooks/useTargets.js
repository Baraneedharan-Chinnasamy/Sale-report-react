import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const useTargets = (businessName) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all targets for a business
  const fetchTargets = async () => {
    if (!businessName?.trim()) {
      setTargets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/target/list-targets-with-status?business_name=${encodeURIComponent(businessName)}`,
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
    if (businessName) {
      fetchTargets();
    }
  }, [businessName]);

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
