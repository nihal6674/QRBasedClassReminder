import { create } from 'zustand';
import { createSignup } from '@services/studentService';
import { isValidEmail, isValidPhone, calculateReminderDate } from '@utils/formatters';
import { ERROR_MESSAGES } from '@utils/constants';

const useStudentStore = create((set, get) => ({
  // State
  selectedClassType: null,
  formData: {
    email: '',
    phone: '',
  },
  errors: {},
  isSubmitting: false,
  submitSuccess: false,
  submitError: null,
  signupResult: null,
  showConfirmation: false,

  // Actions
  setSelectedClassType: (classType) => {
    set({ selectedClassType: classType });
  },

  updateFormData: (field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
      errors: {
        ...state.errors,
        [field]: null, // Clear error when user types
      },
    }));
  },

  setFormData: (data) => {
    set({ formData: data });
  },

  validateForm: () => {
    const { formData, selectedClassType } = get();
    const errors = {};

    // Validate class type
    if (!selectedClassType) {
      errors.classType = 'Please select a training type';
    }

    // Validate contact info - require at least one
    const hasEmail = formData.email && formData.email.trim() !== '';
    const hasPhone = formData.phone && formData.phone.trim() !== '';

    if (!hasEmail && !hasPhone) {
      errors.contact = 'Please provide either email or phone number';
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD('Email or Phone');
      errors.phone = ERROR_MESSAGES.REQUIRED_FIELD('Email or Phone');
    }

    // Validate email format if provided
    if (hasEmail && !isValidEmail(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Validate phone format if provided
    if (hasPhone && !isValidPhone(formData.phone)) {
      errors.phone = ERROR_MESSAGES.INVALID_PHONE;
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  showConfirmationScreen: () => {
    const isValid = get().validateForm();
    if (isValid) {
      set({ showConfirmation: true });
    }
    return isValid;
  },

  hideConfirmationScreen: () => {
    set({ showConfirmation: false });
  },

  submitSignup: async () => {
    const { formData, selectedClassType, validateForm } = get();

    // Validate before submitting
    if (!validateForm()) {
      return false;
    }

    set({ isSubmitting: true, submitError: null });

    try {
      // Calculate reminder scheduled date (7 days from now)
      const reminderScheduledDate = calculateReminderDate(selectedClassType, 7);

      const signupData = {
        classType: selectedClassType,
        email: formData.email || null,
        phone: formData.phone || null,
      };

      const result = await createSignup(signupData);

      set({
        isSubmitting: false,
        submitSuccess: true,
        signupResult: result.data,
        submitError: null,
      });

      return true;
    } catch (error) {
      console.error('Signup submission error:', error);

      // Handle UNIQUE constraint violations (Prisma error code P2002)
      let errorMessage = error.message || ERROR_MESSAGES.SUBMISSION_ERROR;

      if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
        errorMessage = 'This email or phone number is already registered. Please use a different contact method.';
      } else if (error.status === 409 || error.message?.includes('already exists')) {
        errorMessage = 'This email or phone number is already registered. Please use a different contact method.';
      }

      set({
        isSubmitting: false,
        submitSuccess: false,
        submitError: errorMessage,
      });

      return false;
    }
  },

  resetForm: () => {
    set({
      selectedClassType: null,
      formData: {
        email: '',
        phone: '',
      },
      errors: {},
      isSubmitting: false,
      submitSuccess: false,
      submitError: null,
      signupResult: null,
      showConfirmation: false,
    });
  },

  resetSubmissionState: () => {
    set({
      isSubmitting: false,
      submitSuccess: false,
      submitError: null,
      signupResult: null,
    });
  },
}));

export default useStudentStore;
