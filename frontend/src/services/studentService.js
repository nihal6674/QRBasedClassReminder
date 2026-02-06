import apiClient from './api';

/**
 * Create a new student signup
 * @param {Object} signupData - Signup data (email, phone, classType)
 * @returns {Promise<Object>} Signup response
 */
export const createSignup = async (signupData) => {
  return await apiClient.post('/api/students/signup', signupData);
};

/**
 * Get signup confirmation details
 * @param {string} signupId - Signup ID
 * @returns {Promise<Object>} Signup details
 */
export const getSignupConfirmation = async (signupId) => {
  return await apiClient.get(`/api/students/signup/${signupId}`);
};

/**
 * Get all signups for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Student signups
 */
export const getStudentSignups = async (studentId) => {
  return await apiClient.get(`/api/students/${studentId}/signups`);
};

/**
 * Update student opt-out preferences
 * @param {string} studentId - Student ID
 * @param {Object} preferences - Opt-out preferences (optedOutEmail, optedOutSms)
 * @returns {Promise<Object>} Update response
 */
export const updateOptOutPreference = async (studentId, preferences) => {
  return await apiClient.patch(`/api/students/${studentId}/opt-out`, preferences);
};
