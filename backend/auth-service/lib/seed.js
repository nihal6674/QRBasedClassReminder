// backend/auth-service/lib/seed.js
const { faker } = require('@faker-js/faker');
const path = require('path');

// Load environment variables
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env'),
});

const { getDatabase, initializeDatabase, disconnectDatabase } = require('../config/database');
const { createLogger } = require('../shared/utils/logger');

const logger = createLogger('seed-script');

// Configuration
const TOTAL_SIGNUPS = 500;
const BATCH_SIZE = 50;

// Enums from schema
const CLASS_TYPES = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5', 'TYPE_6'];
const SIGNUP_STATUSES = ['PENDING', 'SENT', 'FAILED'];

// Contact method distribution (percentages)
const CONTACT_METHOD_DISTRIBUTION = {
  EMAIL_ONLY: 0.4, // 40%
  PHONE_ONLY: 0.3, // 30%
  BOTH: 0.3, // 30%
};

// Status distribution
const STATUS_DISTRIBUTION = {
  PENDING: 0.5, // 50%
  SENT: 0.4, // 40%
  FAILED: 0.1, // 10%
};

/**
 * Generate a random contact method configuration
 */
const generateContactMethod = () => {
  const random = Math.random();

  if (random < CONTACT_METHOD_DISTRIBUTION.EMAIL_ONLY) {
    return {
      email: faker.internet.email().toLowerCase(),
      phone: null,
    };
  } else if (random < CONTACT_METHOD_DISTRIBUTION.EMAIL_ONLY + CONTACT_METHOD_DISTRIBUTION.PHONE_ONLY) {
    return {
      email: null,
      phone: faker.phone.number('+1##########'), // US format
    };
  } else {
    return {
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number('+1##########'),
    };
  }
};

/**
 * Generate a random signup status with distribution
 */
const generateStatus = () => {
  const random = Math.random();

  if (random < STATUS_DISTRIBUTION.PENDING) {
    return 'PENDING';
  } else if (random < STATUS_DISTRIBUTION.PENDING + STATUS_DISTRIBUTION.SENT) {
    return 'SENT';
  } else {
    return 'FAILED';
  }
};

/**
 * Generate a random reminder date
 * - PENDING: future dates (1-90 days ahead)
 * - SENT: past dates (1-60 days ago)
 * - FAILED: past dates (1-30 days ago)
 */
const generateReminderDate = (status) => {
  const now = new Date();

  if (status === 'PENDING') {
    // Future dates: 1-90 days ahead
    const daysAhead = faker.number.int({ min: 1, max: 90 });
    return new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  } else if (status === 'SENT') {
    // Past dates: 1-60 days ago
    const daysAgo = faker.number.int({ min: 1, max: 60 });
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  } else {
    // FAILED: past dates: 1-30 days ago
    const daysAgo = faker.number.int({ min: 1, max: 30 });
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
};

/**
 * Generate reminderSentAt date for SENT status
 */
const generateSentDate = (reminderScheduledDate) => {
  // Sent 0-7 days after scheduled date
  const scheduledTime = reminderScheduledDate.getTime();
  const delayDays = faker.number.int({ min: 0, max: 7 });
  return new Date(scheduledTime + delayDays * 24 * 60 * 60 * 1000);
};

/**
 * Generate random notes (50% chance of having notes)
 */
const generateNotes = () => {
  if (Math.random() < 0.5) {
    const noteTemplates = [
      'Preferred morning class',
      'Needs accessible facility',
      'Has prior experience',
      'Company-sponsored training',
      'Prefers weekday schedule',
      'Emergency contact provided',
      'Certification renewal',
      'First-time trainee',
      'Group booking',
      'Requested specific instructor',
    ];
    return faker.helpers.arrayElement(noteTemplates);
  }
  return null;
};

/**
 * Create a student and their signup
 */
const createStudentWithSignup = async (db) => {
  const contactMethod = generateContactMethod();
  const status = generateStatus();
  const classType = faker.helpers.arrayElement(CLASS_TYPES);
  const reminderScheduledDate = generateReminderDate(status);
  const notes = generateNotes();

  // Create student
  const student = await db.student.create({
    data: {
      email: contactMethod.email,
      phone: contactMethod.phone,
      optedOutEmail: Math.random() < 0.05, // 5% opted out
      optedOutSms: Math.random() < 0.05, // 5% opted out
    },
  });

  // Create signup
  const signupData = {
    studentId: student.id,
    classType,
    reminderScheduledDate,
    status,
    notes,
  };

  // Add reminderSentAt if status is SENT
  if (status === 'SENT') {
    signupData.reminderSentAt = generateSentDate(reminderScheduledDate);
  }

  const signup = await db.signup.create({
    data: signupData,
  });

  return { student, signup };
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  let db;

  try {
    logger.info('Starting bulk seeding process...');
    logger.info(`Target: ${TOTAL_SIGNUPS} student signups`);

    // Initialize database
    await initializeDatabase();
    db = await getDatabase();

    // Check existing data
    const existingCount = await db.signup.count();
    logger.info(`Existing signups in database: ${existingCount}`);

    if (existingCount > 0) {
      logger.warn('Database already contains signups. This will add more data.');
      logger.warn('To start fresh, run: npm run db:reset');
    }

    // Create signups in batches
    let created = 0;
    const startTime = Date.now();

    for (let batch = 0; batch < Math.ceil(TOTAL_SIGNUPS / BATCH_SIZE); batch++) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_SIGNUPS - created);
      const batchStart = Date.now();

      logger.info(`Processing batch ${batch + 1}/${Math.ceil(TOTAL_SIGNUPS / BATCH_SIZE)} (${batchSize} signups)...`);

      // Create signups in parallel within batch
      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(createStudentWithSignup(db));
      }

      await Promise.all(promises);
      created += batchSize;

      const batchTime = ((Date.now() - batchStart) / 1000).toFixed(2);
      logger.info(`Batch ${batch + 1} completed in ${batchTime}s. Total created: ${created}/${TOTAL_SIGNUPS}`);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Final statistics
    const stats = await db.signup.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const classTypeStats = await db.signup.groupBy({
      by: ['classType'],
      _count: {
        id: true,
      },
    });

    logger.info('='.repeat(60));
    logger.info('Seeding completed successfully!');
    logger.info(`Total time: ${totalTime}s`);
    logger.info(`Total signups created: ${created}`);
    logger.info('');
    logger.info('Status distribution:');
    stats.forEach(stat => {
      logger.info(`  ${stat.status}: ${stat._count.id}`);
    });
    logger.info('');
    logger.info('Class type distribution:');
    classTypeStats.forEach(stat => {
      logger.info(`  ${stat.classType}: ${stat._count.id}`);
    });
    logger.info('='.repeat(60));

  } catch (error) {
    logger.error('Seeding failed:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (db) {
      await disconnectDatabase();
      logger.info('Database connection closed');
    }
  }
};

// Run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
