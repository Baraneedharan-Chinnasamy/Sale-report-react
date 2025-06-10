import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
  },
  summaryContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    marginBottom: '20px',
    padding: '0 24px 0px 0px',
    gap: '16px',
    width: '100%',
  },
  summaryCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: '12px',
    padding: '16px 12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e0e6ed',
    flex: '1 1 180px',
    maxWidth: '20%',
    minWidth: '140px',
    boxSizing: 'border-box',
  },
  summaryTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  summaryValue: {
    margin: '6px 0 0',
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827',
  },
  graphContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e3e8ee',
    width: '100%',
    maxWidth: '95%',
    height: '300px',
  },
  toggleRow: {
    display: 'flex',
    gap: '16px',
    margin: '16px 24px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toggleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  toggleGroupTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '4px',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#4b5563',
    cursor: 'pointer',
  },
};

const formatPeriodLabel = (label) => {
  if (!label.includes("to")) return label;
  const [start, end] = label.split(" to ");
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate().toString().padStart(2, '0')}–${endDate.getDate().toString().padStart(2, '0')} ${startDate.toLocaleString('en-US', { month: 'short' })}`;
  }
  return `${startDate.getDate()} ${startDate.toLocaleString('en-US', { month: 'short' })} – ${endDate.getDate()} ${endDate.toLocaleString('en-US', { month: 'short' })}`;
};

const calculateStandardDeviation = (arr) => {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

const calculateMovingAverage = (data, windowSize = 5) => {
  return data.map((_, i, arr) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(arr.length, i + Math.ceil(windowSize / 2));
    const window = arr.slice(start, end);
    return window.reduce((sum, val) => sum + val, 0) / window.length;
  });
};

const ReportSummary = ({ summary }) => {
  // Individual toggle states for each line
  const [salesToggles, setSalestoggles] = useState({
    showAverage: false,
    showMovingAvg: false,
    showStdDev: false,
  });
  
  const [targetToggles, setTargetToggles] = useState({
    showAverage: false,
    showMovingAvg: false,
    showStdDev: false,
  });
  
  const [comparisonToggles, setComparisonToggles] = useState({
    showAverage: false,
    showMovingAvg: false,
    showStdDev: false,
  });

  const [targetValueToggles, setTargetValueToggles] = useState({
    showAverage: false,
    showMovingAvg: false,
    showStdDev: false,
  });

  if (!summary) return null;

  const currentGraph = summary.growth_graph_data || [];
  const targetGraph = summary.target_sales_graph_data || [];
  const targetValueGraph = summary.target_value_graph_data || [];
  const comparisonGraph = summary?.comparison?.growth_graph_data || [];

  const labels = currentGraph.map(point => formatPeriodLabel(point.period));
  const currentSaleValues = currentGraph.map(point => point.sale_value);
  const targetSaleValues = targetGraph.map(point => point.target_sales);
  const targetValues = targetValueGraph.map(point => point.target_value);
  const comparisonSaleValues = comparisonGraph.map(point => point.sale_value);

  // Calculate statistics for Total Sales
  const salesAverage = currentSaleValues.length > 0 ? currentSaleValues.reduce((a, b) => a + b, 0) / currentSaleValues.length : 0;
  const salesStdDev = currentSaleValues.length > 0 ? calculateStandardDeviation(currentSaleValues) : 0;
  const salesAverageLine = Array(currentSaleValues.length).fill(salesAverage);
  const salesStdDevUpper = Array(currentSaleValues.length).fill(salesAverage + salesStdDev);
  const salesStdDevLower = Array(currentSaleValues.length).fill(salesAverage - salesStdDev);
  const salesMovingAverage = currentSaleValues.length > 0 ? calculateMovingAverage(currentSaleValues) : [];

  // Calculate statistics for Target Sales
  const targetAverage = targetSaleValues.length > 0 ? targetSaleValues.reduce((a, b) => a + b, 0) / targetSaleValues.length : 0;
  const targetStdDev = targetSaleValues.length > 0 ? calculateStandardDeviation(targetSaleValues) : 0;
  const targetAverageLine = Array(targetSaleValues.length).fill(targetAverage);
  const targetStdDevUpper = Array(targetSaleValues.length).fill(targetAverage + targetStdDev);
  const targetStdDevLower = Array(targetSaleValues.length).fill(targetAverage - targetStdDev);
  const targetMovingAverage = targetSaleValues.length > 0 ? calculateMovingAverage(targetSaleValues) : [];

  // Calculate statistics for Target Values
  const targetValueAverage = targetValues.length > 0 ? targetValues.reduce((a, b) => a + b, 0) / targetValues.length : 0;
  const targetValueStdDev = targetValues.length > 0 ? calculateStandardDeviation(targetValues) : 0;
  const targetValueAverageLine = Array(targetValues.length).fill(targetValueAverage);
  const targetValueStdDevUpper = Array(targetValues.length).fill(targetValueAverage + targetValueStdDev);
  const targetValueStdDevLower = Array(targetValues.length).fill(targetValueAverage - targetValueStdDev);
  const targetValueMovingAverage = targetValues.length > 0 ? calculateMovingAverage(targetValues) : [];

  // Calculate statistics for Comparison Sales
  const comparisonAverage = comparisonSaleValues.length > 0 ? comparisonSaleValues.reduce((a, b) => a + b, 0) / comparisonSaleValues.length : 0;
  const comparisonStdDev = comparisonSaleValues.length > 0 ? calculateStandardDeviation(comparisonSaleValues) : 0;
  const comparisonAverageLine = Array(comparisonSaleValues.length).fill(comparisonAverage);
  const comparisonStdDevUpper = Array(comparisonSaleValues.length).fill(comparisonAverage + comparisonStdDev);
  const comparisonStdDevLower = Array(comparisonSaleValues.length).fill(comparisonAverage - comparisonStdDev);
  const comparisonMovingAverage = comparisonSaleValues.length > 0 ? calculateMovingAverage(comparisonSaleValues) : [];

  const shouldHideGraph = summary?.aggregation === "custom" || summary?.aggregation === "compare";
  const totalSaleValue = Math.round((summary.Total_Sale_Value || 0) + (summary?.comparison?.Total_Sale_Value || 0));
  const totalQuantitySold = Math.round((summary.Total_Quantity_Sold || 0) + (summary?.comparison?.Total_Quantity_Sold || 0));
  const totalItemsViewed = summary.Total_Items_Viewed || 0;
  const totalItemsAddedToCart = summary.Total_Items_Added_To_Cart || 0;
  const sellThroughRate = summary?.Sell_Through_Rate ?? null;

  const data = {
    labels,
    datasets: [
      // Main data lines - reduced thickness
      {
        label: 'Total Sales',
        data: currentSaleValues,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 1,
      },
      ...(targetSaleValues.length > 0 ? [{
        label: 'Target Sales',
        data: targetSaleValues,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#dc2626',
        pointBorderWidth: 1,
      }] : []),
      ...(targetValues.length > 0 ? [{
        label: 'Target Value',
        data: targetValues,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 1,
      }] : []),
      ...(comparisonSaleValues.length > 0 ? [{
        label: 'Comparison Period',
        data: comparisonSaleValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 1,
      }] : []),
      
      // Statistical overlays for Total Sales
      ...(salesToggles.showAverage && currentSaleValues.length > 0 ? [{
        label: 'Sales Average',
        data: salesAverageLine,
        borderColor: '#8b5cf6',
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
      }] : []),
      ...(salesToggles.showMovingAvg && currentSaleValues.length > 0 ? [{
        label: 'Sales Moving Avg',
        data: salesMovingAverage,
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4,
      }] : []),
      ...(salesToggles.showStdDev && currentSaleValues.length > 0 ? [
        {
          label: 'Sales +1σ',
          data: salesStdDevUpper,
          borderColor: '#f97316',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Sales -1σ',
          data: salesStdDevLower,
          borderColor: '#f97316',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ] : []),
      
      // Statistical overlays for Target Sales
      ...(targetToggles.showAverage && targetSaleValues.length > 0 ? [{
        label: 'Target Average',
        data: targetAverageLine,
        borderColor: '#ec4899',
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
      }] : []),
      ...(targetToggles.showMovingAvg && targetSaleValues.length > 0 ? [{
        label: 'Target Moving Avg',
        data: targetMovingAverage,
        borderColor: '#06b6d4',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4,
      }] : []),
      ...(targetToggles.showStdDev && targetSaleValues.length > 0 ? [
        {
          label: 'Target +1σ',
          data: targetStdDevUpper,
          borderColor: '#84cc16',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Target -1σ',
          data: targetStdDevLower,
          borderColor: '#84cc16',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ] : []),

      // Statistical overlays for Target Values
      ...(targetValueToggles.showAverage && targetValues.length > 0 ? [{
        label: 'Target Value Average',
        data: targetValueAverageLine,
        borderColor: '#d946ef',
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
      }] : []),
      ...(targetValueToggles.showMovingAvg && targetValues.length > 0 ? [{
        label: 'Target Value Moving Avg',
        data: targetValueMovingAverage,
        borderColor: '#0ea5e9',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4,
      }] : []),
      ...(targetValueToggles.showStdDev && targetValues.length > 0 ? [
        {
          label: 'Target Value +1σ',
          data: targetValueStdDevUpper,
          borderColor: '#65a30d',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Target Value -1σ',
          data: targetValueStdDevLower,
          borderColor: '#65a30d',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ] : []),
      
      // Statistical overlays for Comparison Sales
      ...(comparisonToggles.showAverage && comparisonSaleValues.length > 0 ? [{
        label: 'Comparison Average',
        data: comparisonAverageLine,
        borderColor: '#a855f7',
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
      }] : []),
      ...(comparisonToggles.showMovingAvg && comparisonSaleValues.length > 0 ? [{
        label: 'Comparison Moving Avg',
        data: comparisonMovingAverage,
        borderColor: '#ef4444',
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        tension: 0.4,
      }] : []),
      ...(comparisonToggles.showStdDev && comparisonSaleValues.length > 0 ? [
        {
          label: 'Comparison +1σ',
          data: comparisonStdDevUpper,
          borderColor: '#22d3ee',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'Comparison -1σ',
          data: comparisonStdDevLower,
          borderColor: '#22d3ee',
          borderDash: [2, 4],
          fill: false,
          pointRadius: 0,
          borderWidth: 1,
        },
      ] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: { size: 13, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { weight: 'bold', size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: '#e5e7eb', 
          borderDash: [3, 3],
          drawBorder: false,
        },
        ticks: {
          color: '#4b5563',
          font: { size: 12 },
          callback: (value) => `₹${value.toLocaleString()}`,
          padding: 8,
        },
        title: {
          display: true,
          text: 'Sale Value (₹)',
          color: '#374151',
          font: { size: 14, weight: '600' },
          padding: { top: 20, bottom: 0 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#4b5563',
          font: { size: 12 },
          maxRotation: 25,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          padding: 8,
        },
        title: {
          display: true,
          text: 'Period',
          color: '#374151',
          font: { size: 14, weight: '600' },
          padding: { top: 15, bottom: 0 },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={{ width: '100%' }}>
        <div style={styles.summaryContainer}>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Sale Value</h4>
            <p style={styles.summaryValue}>₹{totalSaleValue.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Quantity Sold</h4>
            <p style={styles.summaryValue}>{totalQuantitySold.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Items Viewed</h4>
            <p style={styles.summaryValue}>{totalItemsViewed.toLocaleString()}</p>
          </div>
          <div style={styles.summaryCard}>
            <h4 style={styles.summaryTitle}>Total Items Added to Cart</h4>
            <p style={styles.summaryValue}>{totalItemsAddedToCart.toLocaleString()}</p>
          </div>
          {!shouldHideGraph && sellThroughRate !== null && (
            <div style={styles.summaryCard}>
              <h4 style={styles.summaryTitle}>Sell Through Rate</h4>
              <p style={styles.summaryValue}>{sellThroughRate.toFixed(2)}%</p>
            </div>
          )}
        </div>

        {!shouldHideGraph && (
          <>
            <div style={styles.toggleRow}>
              {/* Total Sales Controls */}
              {currentSaleValues.length > 0 && (
                <div style={styles.toggleGroup}>
                  <div style={styles.toggleGroupTitle}>Total Sales Analytics</div>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={salesToggles.showAverage} 
                        onChange={() => setSalestoggles(prev => ({...prev, showAverage: !prev.showAverage}))} 
                      />
                      Average
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={salesToggles.showMovingAvg} 
                        onChange={() => setSalestoggles(prev => ({...prev, showMovingAvg: !prev.showMovingAvg}))} 
                      />
                      Moving Avg
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={salesToggles.showStdDev} 
                        onChange={() => setSalestoggles(prev => ({...prev, showStdDev: !prev.showStdDev}))} 
                      />
                      Std Dev
                    </label>
                  </div>
                </div>
              )}

              {/* Target Sales Controls */}
              {targetSaleValues.length > 0 && (
                <div style={styles.toggleGroup}>
                  <div style={styles.toggleGroupTitle}>Target Sales Analytics</div>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetToggles.showAverage} 
                        onChange={() => setTargetToggles(prev => ({...prev, showAverage: !prev.showAverage}))} 
                      />
                      Average
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetToggles.showMovingAvg} 
                        onChange={() => setTargetToggles(prev => ({...prev, showMovingAvg: !prev.showMovingAvg}))} 
                      />
                      Moving Avg
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetToggles.showStdDev} 
                        onChange={() => setTargetToggles(prev => ({...prev, showStdDev: !prev.showStdDev}))} 
                      />
                      Std Dev
                    </label>
                  </div>
                </div>
              )}

              {/* Target Value Controls */}
              {targetValues.length > 0 && (
                <div style={styles.toggleGroup}>
                  <div style={styles.toggleGroupTitle}>Target Value Analytics</div>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetValueToggles.showAverage} 
                        onChange={() => setTargetValueToggles(prev => ({...prev, showAverage: !prev.showAverage}))} 
                      />
                      Average
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetValueToggles.showMovingAvg} 
                        onChange={() => setTargetValueToggles(prev => ({...prev, showMovingAvg: !prev.showMovingAvg}))} 
                      />
                      Moving Avg
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={targetValueToggles.showStdDev} 
                        onChange={() => setTargetValueToggles(prev => ({...prev, showStdDev: !prev.showStdDev}))} 
                      />
                      Std Dev
                    </label>
                  </div>
                </div>
              )}

              {/* Comparison Sales Controls */}
              {comparisonSaleValues.length > 0 && (
                <div style={styles.toggleGroup}>
                  <div style={styles.toggleGroupTitle}>Comparison Analytics</div>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={comparisonToggles.showAverage} 
                        onChange={() => setComparisonToggles(prev => ({...prev, showAverage: !prev.showAverage}))} 
                      />
                      Average
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={comparisonToggles.showMovingAvg} 
                        onChange={() => setComparisonToggles(prev => ({...prev, showMovingAvg: !prev.showMovingAvg}))} 
                      />
                      Moving Avg
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={comparisonToggles.showStdDev} 
                        onChange={() => setComparisonToggles(prev => ({...prev, showStdDev: !prev.showStdDev}))} 
                      />
                      Std Dev
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div style={styles.graphContainer}>
              <Line data={data} options={options} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;