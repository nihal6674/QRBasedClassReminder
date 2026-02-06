import { create } from 'zustand';

const useReminderStore = create((set, get) => ({
  // State
  scheduledReminders: [],
  sendingReminders: [],
  sentReminders: [],
  failedReminders: [],

  // Loading states
  isScheduling: false,
  isSending: false,

  // Error states
  scheduleError: null,
  sendError: null,

  // Actions - Schedule Reminders
  scheduleReminder: (signupId, reminderDate) => {
    set((state) => ({
      scheduledReminders: [
        ...state.scheduledReminders,
        {
          signupId,
          scheduledDate: reminderDate,
          status: 'scheduled',
          createdAt: new Date(),
        },
      ],
    }));
  },

  // Actions - Send Reminders
  markReminderAsSending: (signupId) => {
    set((state) => ({
      sendingReminders: [...state.sendingReminders, signupId],
    }));
  },

  markReminderAsSent: (signupId) => {
    set((state) => ({
      sendingReminders: state.sendingReminders.filter((id) => id !== signupId),
      sentReminders: [
        ...state.sentReminders,
        {
          signupId,
          sentAt: new Date(),
          status: 'sent',
        },
      ],
    }));
  },

  markReminderAsFailed: (signupId, error) => {
    set((state) => ({
      sendingReminders: state.sendingReminders.filter((id) => id !== signupId),
      failedReminders: [
        ...state.failedReminders,
        {
          signupId,
          failedAt: new Date(),
          error,
          status: 'failed',
        },
      ],
    }));
  },

  // Actions - Retry Failed Reminders
  retryFailedReminder: (signupId) => {
    set((state) => ({
      failedReminders: state.failedReminders.filter(
        (reminder) => reminder.signupId !== signupId
      ),
      sendingReminders: [...state.sendingReminders, signupId],
    }));
  },

  // Actions - Bulk Operations
  scheduleMultipleReminders: (reminders) => {
    set((state) => ({
      scheduledReminders: [
        ...state.scheduledReminders,
        ...reminders.map((reminder) => ({
          ...reminder,
          status: 'scheduled',
          createdAt: new Date(),
        })),
      ],
    }));
  },

  // Actions - Clear States
  clearScheduledReminders: () => {
    set({ scheduledReminders: [] });
  },

  clearSentReminders: () => {
    set({ sentReminders: [] });
  },

  clearFailedReminders: () => {
    set({ failedReminders: [] });
  },

  clearAllReminders: () => {
    set({
      scheduledReminders: [],
      sendingReminders: [],
      sentReminders: [],
      failedReminders: [],
    });
  },

  // Getters
  getReminderBySignupId: (signupId) => {
    const state = get();

    // Check if sending
    if (state.sendingReminders.includes(signupId)) {
      return { status: 'sending' };
    }

    // Check if sent
    const sent = state.sentReminders.find((r) => r.signupId === signupId);
    if (sent) return sent;

    // Check if failed
    const failed = state.failedReminders.find((r) => r.signupId === signupId);
    if (failed) return failed;

    // Check if scheduled
    const scheduled = state.scheduledReminders.find((r) => r.signupId === signupId);
    if (scheduled) return scheduled;

    return null;
  },

  getScheduledRemindersCount: () => {
    return get().scheduledReminders.length;
  },

  getSentRemindersCount: () => {
    return get().sentReminders.length;
  },

  getFailedRemindersCount: () => {
    return get().failedReminders.length;
  },

  getPendingRemindersCount: () => {
    const state = get();
    return state.scheduledReminders.length + state.sendingReminders.length;
  },
}));

export default useReminderStore;
