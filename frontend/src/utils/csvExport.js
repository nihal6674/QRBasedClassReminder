import { formatDate, formatPhone, getClassTypeLabel } from './formatters';

/**
 * Convert signups data to CSV format
 * @param {Array} signups - Array of signup objects
 * @returns {string} CSV string
 */
export const convertToCSV = (signups) => {
  if (!signups || signups.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'Signup ID',
    'Student Email',
    'Student Phone',
    'Training Type',
    'Status',
    'Reminder Scheduled Date',
    'Reminder Sent At',
    'Opted Out Email',
    'Opted Out SMS',
    'Signup Date',
  ];

  // Convert data to CSV rows
  const rows = signups.map((signup) => {
    return [
      signup.id || '',
      signup.student?.email || '',
      formatPhone(signup.student?.phone) || '',
      getClassTypeLabel(signup.classType) || '',
      signup.status || '',
      formatDate(signup.reminderScheduledDate, 'yyyy-MM-dd HH:mm:ss') || '',
      formatDate(signup.reminderSentAt, 'yyyy-MM-dd HH:mm:ss') || '',
      signup.student?.optedOutEmail ? 'Yes' : 'No',
      signup.student?.optedOutSms ? 'Yes' : 'No',
      formatDate(signup.createdAt, 'yyyy-MM-dd HH:mm:ss') || '',
    ];
  });

  // Escape and quote CSV fields
  const escapeCSVField = (field) => {
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  // Build CSV string
  const csvContent = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'signups-export.csv') => {
  // Create blob from CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export signups to CSV file
 * @param {Array} signups - Array of signup objects
 * @param {string} filename - Optional filename
 */
export const exportSignupsToCSV = (signups, filename) => {
  const csvContent = convertToCSV(signups);
  if (!csvContent) {
    console.error('No data to export');
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `student-signups-${timestamp}.csv`;

  downloadCSV(csvContent, finalFilename);
};

/**
 * Generate filename based on filters
 * @param {Object} filters - Active filters
 * @returns {string} Generated filename
 */
export const generateExportFilename = (filters) => {
  const timestamp = new Date().toISOString().split('T')[0];
  let filename = `student-signups-${timestamp}`;

  if (filters.classType) {
    filename += `-${filters.classType.toLowerCase()}`;
  }

  if (filters.status) {
    filename += `-${filters.status.toLowerCase()}`;
  }

  return `${filename}.csv`;
};
