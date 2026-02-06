// auth-service/repositories/passwordResetRepository.js
const { getDatabase } = require("../config/database");
const { transformError, ValidationError } = require("../shared/utils/errors");
const { createPasswordResetSchema, uuidSchema } = require("../models/adminSchema");
const { createLogger } = require("../shared/utils/logger");

const logger = createLogger("password-reset-repository");

let dbInstance = null;

/**
 * Get database instance (singleton pattern)
 */
const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await getDatabase();
  }
  return dbInstance;
};

/**
 * Create a new password reset token
 * @param {Object} resetData - Password reset data
 * @returns {Promise<Object>} Created password reset record
 */
const createPasswordReset = async (resetData) => {
  try {
    const db = await getDB();
    const validatedResetData = createPasswordResetSchema.parse(resetData);

    // Delete any existing reset tokens for this admin
    await db.passwordReset.deleteMany({
      where: { adminId: validatedResetData.adminId },
    });

    logger.info("Creating password reset token", {
      adminId: validatedResetData.adminId,
      email: validatedResetData.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
      expiresAt: validatedResetData.expiresAt,
    });

    const newReset = await db.passwordReset.create({
      data: validatedResetData,
      select: {
        id: true,
        adminId: true,
        email: true,
        token: true,
        expiresAt: true,
        isUsed: true,
        createdAt: true,
      },
    });

    logger.info("Password reset token created successfully", {
      resetId: newReset.id,
      adminId: newReset.adminId,
    });

    return newReset;
  } catch (error) {
    logger.error("Failed to create password reset token", {
      error: error.message,
      adminId: resetData?.adminId,
    });
    throw transformError(error, "createPasswordReset");
  }
};

/**
 * Find password reset by token
 * @param {string} token - Reset token
 * @returns {Promise<Object|null>} Password reset record or null
 */
const findByToken = async (token) => {
  try {
    if (!token) {
      throw ValidationError("Reset token is required");
    }

    const db = await getDB();

    const reset = await db.passwordReset.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        adminId: true,
        email: true,
        token: true,
        expiresAt: true,
        isUsed: true,
        attempts: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!reset) {
      logger.warn("Password reset token not found or expired", {
        token: `${token.substring(0, 8)}...`,
      });
    }

    return reset;
  } catch (error) {
    logger.error("Failed to find password reset by token", {
      error: error.message,
      token: token ? `${token.substring(0, 8)}...` : "missing",
    });
    throw transformError(error, "findByToken");
  }
};

/**
 * Find active password reset by admin ID
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object|null>} Active password reset record or null
 */
const findActiveByAdminId = async (adminId) => {
  try {
    const validAdminId = uuidSchema.parse(adminId);
    const db = await getDB();

    const reset = await db.passwordReset.findFirst({
      where: {
        adminId: validAdminId,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        adminId: true,
        email: true,
        expiresAt: true,
        attempts: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reset;
  } catch (error) {
    logger.error("Failed to find active password reset", { error: error.message, adminId });
    throw transformError(error, "findActiveByAdminId");
  }
};

/**
 * Mark password reset as used
 * @param {string} resetId - Password reset ID
 * @returns {Promise<Object>} Updated password reset record
 */
const markAsUsed = async (resetId) => {
  try {
    const validResetId = uuidSchema.parse(resetId);
    const db = await getDB();

    const updatedReset = await db.passwordReset.update({
      where: { id: validResetId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
      select: {
        id: true,
        adminId: true,
        isUsed: true,
        usedAt: true,
      },
    });

    logger.info("Password reset marked as used", {
      resetId: updatedReset.id,
      adminId: updatedReset.adminId,
    });

    return updatedReset;
  } catch (error) {
    logger.error("Failed to mark password reset as used", { error: error.message, resetId });
    throw transformError(error, "markAsUsed");
  }
};

/**
 * Increment reset attempts
 * @param {string} resetId - Password reset ID
 * @returns {Promise<Object>} Updated password reset record
 */
const incrementAttempts = async (resetId) => {
  try {
    const validResetId = uuidSchema.parse(resetId);
    const db = await getDB();

    const updatedReset = await db.passwordReset.update({
      where: { id: validResetId },
      data: {
        attempts: { increment: 1 },
      },
      select: {
        id: true,
        attempts: true,
      },
    });

    return updatedReset;
  } catch (error) {
    logger.error("Failed to increment reset attempts", { error: error.message, resetId });
    throw transformError(error, "incrementAttempts");
  }
};

/**
 * Clean up expired password reset tokens
 * @returns {Promise<Object>} Cleanup result
 */
const cleanupExpired = async () => {
  try {
    const db = await getDB();

    const deletedResets = await db.passwordReset.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
      },
    });

    logger.info("Expired password resets cleaned up", {
      deletedCount: deletedResets.count,
    });

    return { deletedCount: deletedResets.count };
  } catch (error) {
    logger.error("Failed to cleanup expired password resets", { error: error.message });
    throw transformError(error, "cleanupExpired");
  }
};

/**
 * Get password reset statistics for an admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Reset statistics
 */
const getResetStats = async (adminId) => {
  try {
    const validAdminId = uuidSchema.parse(adminId);
    const db = await getDB();

    const [totalResets, activeResets, lastReset] = await Promise.all([
      db.passwordReset.count({
        where: { adminId: validAdminId },
      }),
      db.passwordReset.count({
        where: {
          adminId: validAdminId,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      }),
      db.passwordReset.findFirst({
        where: { adminId: validAdminId },
        select: {
          createdAt: true,
          isUsed: true,
          expiresAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      totalResets,
      activeResets,
      lastReset,
    };
  } catch (error) {
    logger.error("Failed to get password reset stats", { error: error.message, adminId });
    throw transformError(error, "getResetStats");
  }
};

module.exports = {
  createPasswordReset,
  findByToken,
  findActiveByAdminId,
  markAsUsed,
  incrementAttempts,
  cleanupExpired,
  getResetStats,
};
