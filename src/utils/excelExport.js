// src/utils/excelExport.js

/**
 * Export data to CSV file (Excel-compatible)
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the sheet (not used in CSV but kept for compatibility)
 * @param {Array} columns - Optional: Array of column configurations
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1', columns = null) => {
  try {
    // If no data, show message
    if (!data || data.length === 0) {
      alert('No data to export');
      return false;
    }

    console.log('Exporting data:', { 
      dataLength: data.length, 
      sampleData: data[0], 
      columns: columns?.map(c => c.key) 
    });

    // Process data based on columns configuration
    let processedData = data;
    
    if (columns && columns.length > 0) {
      processedData = data.map(item => {
        const processedItem = {};
        columns.forEach(col => {
          if (col.key && col.header) {
            let value = item[col.key];
            
            // Apply formatter if provided
            if (col.formatter && typeof col.formatter === 'function') {
              try {
                value = col.formatter(value, item);
              } catch (formatterError) {
                console.warn('Formatter error for column', col.key, formatterError);
                value = item[col.key]; // Use original value if formatter fails
              }
            }
            
            // Ensure value is not undefined
            processedItem[col.header] = value !== undefined ? value : '';
          }
        });
        return processedItem;
      });
    } else {
      // If no columns specified, use all data as-is but clean it
      processedData = data.map(item => {
        const cleanItem = {};
        Object.keys(item).forEach(key => {
          let value = item[key];
          // Convert complex objects to strings
          if (value !== null && typeof value === 'object') {
            if (Array.isArray(value)) {
              value = value.length;
            } else {
              value = JSON.stringify(value);
            }
          }
          cleanItem[key] = value !== undefined ? value : '';
        });
        return cleanItem;
      });
    }

    console.log('Processed data sample:', processedData[0]);

    // Convert to Excel-compatible CSV format
    const csvContent = createExcelCompatibleCSV(processedData);

    if (!csvContent) {
      alert('No content to export');
      return false;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fullFilename = `${filename}_${timestamp}.csv`;

    // Create and download file
    downloadCSV(csvContent, fullFilename);
    
    console.log('Export completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error exporting data. Please try again.');
    return false;
  }
};

/**
 * Convert array of objects to CSV string with proper column width handling
 */
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  
  // Calculate optimal column widths
  const columnWidths = {};
  headers.forEach(header => {
    columnWidths[header] = Math.max(header.length, 10); // Minimum width of 10
  });
  
  // Check data to determine optimal widths
  data.forEach(row => {
    headers.forEach(header => {
      let value = row[header];
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      
      // Update column width if this value is longer
      columnWidths[header] = Math.max(columnWidths[header], value.length);
    });
  });
  
  // Format CSV with proper escaping
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else {
      value = String(value);
    }
    
    // Always wrap values in quotes for better Excel compatibility
    // This ensures proper column separation and handles special characters
    return '"' + value.replace(/"/g, '""') + '"';
  };
  
  const csvHeaders = headers.map(header => formatValue(header)).join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => formatValue(row[header])).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Create Excel-compatible CSV with proper column formatting
 */
const createExcelCompatibleCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  
  // Create a more Excel-friendly format
  const excelRows = [];
  
  // Add headers with proper formatting
  const headerRow = headers.map(header => {
    // Clean up header names for better readability
    const cleanHeader = header
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
    return `"${cleanHeader}"`;
  }).join(',');
  
  excelRows.push(headerRow);
  
  // Add data rows
  data.forEach(row => {
    const dataRow = headers.map(header => {
      let value = row[header];
      
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          value = value.length.toString();
        } else {
          value = JSON.stringify(value);
        }
      } else {
        value = String(value);
      }
      
      // Special handling for different data types
      if (value.includes('₹') || /^\d+$/.test(value)) {
        // For currency and numbers, don't add extra quotes
        return `"${value}"`;
      } else if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // For text with special characters
        return `"${value.replace(/"/g, '""')}"`;
      } else {
        // For regular text
        return `"${value}"`;
      }
    }).join(',');
    
    excelRows.push(dataRow);
  });
  
  return excelRows.join('\r\n'); // Use Windows line endings for better Excel compatibility
};

/**
 * Download CSV content as file
 */
const downloadCSV = (csvContent, filename) => {
  // Add UTF-8 BOM for better Excel compatibility
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  const blob = new Blob([csvWithBOM], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for older browsers
    const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvWithBOM);
    window.open(url);
  }
};

/**
 * Export customers data to Excel
 */
export const exportCustomersToExcel = (customers) => {
  const columns = [
    { key: 'id', header: 'Customer ID' },
    { key: 'name', header: 'Customer Name' },
    { key: 'contactPerson', header: 'Contact Person' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    { key: 'gstNumber', header: 'GST Number' },
    { key: 'totalOrders', header: 'Total Orders' },
    { 
      key: 'totalAmount', 
      header: 'Total Amount',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { 
      key: 'creditLimit', 
      header: 'Credit Limit',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { key: 'paymentTerms', header: 'Payment Terms' },
    { key: 'status', header: 'Status' },
    { 
      key: 'createdDate', 
      header: 'Created Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString('en-IN') : ''
    }
  ];

  return exportToExcel(customers, 'Customers_Report', 'Customers', columns);
};

/**
 * Export invoices data to Excel
 */
export const exportInvoicesToExcel = (invoices) => {
  const columns = [
    { key: 'id', header: 'Invoice ID' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'customerId', header: 'Customer ID' },
    { 
      key: 'invoiceDate', 
      header: 'Invoice Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString('en-IN') : ''
    },
    { 
      key: 'dueDate', 
      header: 'Due Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString('en-IN') : ''
    },
    { 
      key: 'subtotal', 
      header: 'Subtotal',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { 
      key: 'tax', 
      header: 'Tax',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { 
      key: 'totalAmount', 
      header: 'Total Amount',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { key: 'status', header: 'Status' },
    { 
      key: 'paymentDate', 
      header: 'Payment Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString('en-IN') : 'Not Paid'
    },
    { 
      key: 'items', 
      header: 'Items Count',
      formatter: (value) => value ? value.length : 0
    }
  ];

  return exportToExcel(invoices, 'Invoices_Report', 'Invoices', columns);
};

/**
 * Export contracts data to Excel
 */
export const exportContractsToExcel = (contracts) => {
  const columns = [
    { key: 'id', header: 'Contract ID' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'customerId', header: 'Customer ID' },
    { key: 'title', header: 'Contract Title' },
    { key: 'type', header: 'Contract Type' },
    { 
      key: 'startDate', 
      header: 'Start Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
    },
    { 
      key: 'endDate', 
      header: 'End Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
    },
    { 
      key: 'renewalDate', 
      header: 'Renewal Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
    },
    { 
      key: 'value', 
      header: 'Contract Value (₹)',
      formatter: (value) => value ? `₹${value.toLocaleString()}` : '₹0'
    },
    { key: 'status', header: 'Status' },
    { 
      key: 'terms', 
      header: 'Terms Count',
      formatter: (value) => value ? value.length : 0
    },
    { 
      key: 'createdDate', 
      header: 'Created Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString() : ''
    }
  ];

  return exportToExcel(contracts, 'Contracts_Report', 'Contracts', columns);
};

/**
 * Export orders data to Excel
 */
export const exportOrdersToExcel = (orders) => {
  const columns = [
    { key: 'id', header: 'Order ID' },
    { key: 'customer', header: 'Customer Name' },
    { key: 'customerPhone', header: 'Customer Phone' },
    { key: 'pickupLocation', header: 'Pickup Location' },
    { key: 'deliveryLocation', header: 'Delivery Location' },
    { 
      key: 'pickupDate', 
      header: 'Order Date',
      formatter: (value, item) => {
        const date = value || item.date || item.createdAt;
        return date ? new Date(date).toLocaleDateString('en-IN') : '';
      }
    },
    { 
      key: 'deliveryDate', 
      header: 'Delivery Date',
      formatter: (value) => value ? new Date(value).toLocaleDateString('en-IN') : 'Not Set'
    },
    { 
      key: 'amount', 
      header: 'Total Amount',
      formatter: (value) => value ? `₹ ${value.toLocaleString('en-IN')}` : '₹ 0'
    },
    { key: 'status', header: 'Status' },
    { key: 'priority', header: 'Priority' },
    { 
      key: 'items', 
      header: 'Items Count',
      formatter: (value) => value ? value.length.toString() : '0'
    },
    { key: 'notes', header: 'Notes' }
  ];

  return exportToExcel(orders, 'Orders_Report', 'Orders', columns);
};

export default {
  exportToExcel,
  exportCustomersToExcel,
  exportInvoicesToExcel,
  exportContractsToExcel,
  exportOrdersToExcel
};
