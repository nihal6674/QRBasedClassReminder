import apiClient from './api';

/**
 * Get all students with their signups (Admin only)
 * Note: This fetches ALL data - pagination happens on frontend
 * @returns {Promise<Object>} All students and signups
 */
export const getAllStudents = async () => {
  // TODO: Implement when admin endpoints are ready
  // For now, return mock data structure
  return await apiClient.get('/api/admin/students');
};

/**
 * Get all signups (Admin only)
 * Fetches ALL signups without backend pagination - pagination happens on frontend
 * @param {Object} params - Query parameters (filters only, no pagination)
 * @returns {Promise<Object>} All signups
 */
export const getAllSignups = async (params = {}) => {
  // Don't send limit/page - backend will return all results
  return await apiClient.get('/api/admin/signups', {
    params: params
  });
};

/**
 * Update signup status (Admin only)
 * @param {string} signupId - Signup ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated signup
 */
export const updateSignup = async (signupId, updateData) => {
  return await apiClient.patch(`/api/admin/signups/${signupId}`, updateData);
};

/**
 * Delete a signup (Admin only)
 * @param {string} signupId - Signup ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteSignup = async (signupId) => {
  return await apiClient.delete(`/api/admin/signups/${signupId}`);
};
