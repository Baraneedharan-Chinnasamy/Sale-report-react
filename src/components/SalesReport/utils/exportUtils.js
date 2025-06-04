import * as XLSX from 'xlsx';

// Helper: Group and reduce data
const groupByAndSummarize = (data, groupFields, allColumns) => {
  const map = new Map();

  data.forEach(row => {
    const key = groupFields.map(f => row[f]).join('||');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(row);
  });

  const summarized = [];

  map.forEach((rows, key) => {
    const base = {};
    const values = key.split('||');

    // Group-by fields
    groupFields.forEach((field, i) => {
      base[field] = values[i];
    });

    // Summary logic (sum or take first for simplicity)
    allColumns.forEach(col => {
      if (groupFields.includes(col.field)) return;

      const sample = rows[0][col.field];

      // Try to sum numeric fields
      if (typeof sample === 'number') {
        base[col.field] = rows.reduce((sum, r) => sum + (r[col.field] || 0), 0);
      } else {
        base[col.field] = sample; // fallback to first
      }
    });

    summarized.push(base);
  });

  return summarized;
};

export const exportDataToCSV = (data, columns, fileName, groupbyFields = []) => {
  if (!data || data.length === 0) {
    alert('No data to export!');
    return;
  }

  const workbook = XLSX.utils.book_new();
  const headerRow = columns.map(col => col.headerName || col.field);

  let mainSheetData;

  if (Array.isArray(groupbyFields) && groupbyFields.length > 0) {
    const grouped = groupByAndSummarize(data, groupbyFields, columns);
    const rows = grouped.map(row =>
      columns.map(col => row[col.field] !== undefined ? row[col.field] : '')
    );
    mainSheetData = [headerRow, ...rows];
  } else {
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col.field];
        if (typeof val === 'object') return JSON.stringify(val);
        return val !== undefined && val !== null ? val : '';
      })
    );
    mainSheetData = [headerRow, ...rows];
  }

  const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Main');

  // Optional: Target-wise data
  const targetWiseData = [];

  data.forEach(row => {
    const baseDate = row['Date'];
    const targets = row['target_wise'];
    if (Array.isArray(targets)) {
      targets.forEach(t => {
        targetWiseData.push({
          Date: baseDate,
          ...t,
        });
      });
    }
  });

  if (targetWiseData.length > 0) {
    const targetWiseSheet = XLSX.utils.json_to_sheet(targetWiseData);
    XLSX.utils.book_append_sheet(workbook, targetWiseSheet, 'Target_Wise');
  }

  const cleanFileName = fileName.replace(/\.csv$/i, '').replace(/\.xlsx$/i, '') + '.xlsx';
  XLSX.writeFile(workbook, cleanFileName);
};
