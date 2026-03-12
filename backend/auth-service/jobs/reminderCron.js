// backend/auth-service/jobs/reminderCron.js
const cron = require("node-cron");
const reminderService = require("../services/reminderService");
const { createLogger } = require("../shared/utils/logger");

const logger = createLogger("reminder-cron");

/**
 * Start the reminder cron job.
 * Runs on a configurable schedule to check for pending reminders.
 * Default: daily at 8:00 AM ('0 8 * * *')
 */
const startReminderCron = () => {
    // Default: run every minute to keep scheduling precise (and avoid missing due reminders)
    const schedule = process.env.REMINDER_CRON_SCHEDULE || "* * * * *";
    const timezone = process.env.REMINDER_CRON_TIMEZONE || "UTC";

    if (!cron.validate(schedule)) {
        logger.error("Invalid cron schedule expression", { schedule });
        return null;
    }

    let isRunning = false;

    const job = cron.schedule(
        schedule,
        async () => {
            if (isRunning) {
                logger.warn("Reminder cron job skipped because previous run is still in progress");
                return;
            }

            isRunning = true;
            logger.info("Reminder cron job started", { schedule, timezone, now: new Date().toISOString() });
            try {
                const result = await reminderService.processPendingReminders({ triggeredBy: "cron" });
                logger.info("Reminder cron job completed", result);
            } catch (error) {
                logger.error("Reminder cron job failed", {
                    error: error.message,
                    stack: error.stack,
                });
            } finally {
                isRunning = false;
            }
        },
        {
            timezone,
        }
    );

    logger.info("Reminder cron job scheduled", { schedule, timezone });
    return job;
};

module.exports = { startReminderCron };
