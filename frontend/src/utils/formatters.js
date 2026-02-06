import { format, parseISO } from 'date-fns';

/**
 * Format a date string or Date object
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format string (date-fns format)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Return as-is if not 10 digits
  return phone;
};

/**
 * Format email for display (truncate if too long)
 * @param {string} email - Email address
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Formatted email
 */
export const formatEmail = (email, maxLength = 30) => {
  if (!email) return '-';
  if (email.length <= maxLength) return email;

  const [local, domain] = email.split('@');
  if (local.length > maxLength - domain.length - 4) {
    return `${local.slice(0, maxLength - domain.length - 7)}...@${domain}`;
  }

  return email;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert class type enum to readable label
 * @param {string} classType - Class type enum value
 * @returns {string} Human-readable label
 */
export const getClassTypeLabel = (classType) => {
  const labels = {
    TYPE_1: 'Initial Firearms',
    TYPE_2: 'Firearms Requalification',
    TYPE_3: 'CPR/AED and/or First Aid',
    TYPE_4: 'Handcuffing and/or Pepper Spray',
    TYPE_5: 'CEW / Taser',
    TYPE_6: 'Baton',
  };

  return labels[classType] || classType;
};

/**
 * Convert status enum to readable label
 * @param {string} status - Status enum value
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pending',
    SENT: 'Sent',
    FAILED: 'Failed',
  };

  return labels[status] || status;
};

/**
 * Get status color for badges
 * @param {string} status - Status enum value
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SENT: 'bg-green-100 text-green-800 border-green-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
  };

  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
};

/**
 * Calculate reminder scheduled date based on class type
 * @param {string} classType - Class type enum
 * @param {number} daysOffset - Number of days before class
 * @returns {Date} Calculated date
 */
export const calculateReminderDate = (classType, daysOffset = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  const cleanedPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && cleanedPhone.length >= 10;
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
