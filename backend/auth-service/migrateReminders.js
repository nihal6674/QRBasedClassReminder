require("dotenv").config();
const { PrismaClient } = require("./shared/lib/generated/client");

// Need to match the client path from schema
const prisma = new PrismaClient();

const CLASS_REMINDER_INTERVALS = {
  TYPE_1: 4,
  TYPE_2: 5,
  TYPE_3: 11,
  TYPE_4: 11,
  TYPE_5: 11,
  TYPE_6: 11,
};

async function migrate() {
  console.log("Starting Reminder Migration...");
  
  try {
    const signups = await prisma.signup.findMany();
    console.log(`Found ${signups.length} signups to migrate.`);
    
    let updated = 0;
    for (const signup of signups) {
      if (!signup.reminderScheduledDate) {
        continue; // Already migrated or no date
      }
      
      // The old reminderScheduledDate was the final reminder date (e.g. 11 months out).
      // That becomes our secondReminderDate.
      const secondDate = new Date(signup.reminderScheduledDate);
      
      // The firstReminderDate should be exactly 1 month BEFORE the second reminder
      // Because second was (duration) months out, and first is (duration - 1) months out.
      const firstDate = new Date(secondDate);
      firstDate.setMonth(firstDate.getMonth() - 1);
      
      // Determine statuses based on overall legacy status
      // If main status is "SENT", then both are historically sent.
      // If "PENDING", then figure out if first reminder should already be sent. For safety, just set both to match the old status initially, or set both to PENDING and let cron handle it.
      let firstStatus = signup.status;
      let secondStatus = signup.status;
      let firstSentAt = signup.reminderSentAt;
      let secondSentAt = signup.reminderSentAt;
      
      // If the old one was SENT, both are SENT.
      // If the old one was PENDING, but the first date is in the past, the cron will pick it up immediately.
      
      await prisma.signup.update({
        where: { id: signup.id },
        data: {
          firstReminderDate: firstDate,
          secondReminderDate: secondDate,
          firstReminderStatus: firstStatus,
          secondReminderStatus: secondStatus,
          firstReminderSentAt: firstSentAt,
          secondReminderSentAt: secondSentAt,
          // nullify the old date so we know it's migrated
          reminderScheduledDate: null,
        }
      });
      updated++;
    }
    
    console.log(`Migration Complete! Successfully updated ${updated} records.`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
