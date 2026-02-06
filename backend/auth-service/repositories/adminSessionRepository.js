const { getDatabase } = require("../config/database");
const { transformError, ValidationError, NotFoundError } = require("../shared/utils/errors");
const { createSessionSchema, uuidSchema } = require("../models/adminSchema");
const { SESSION_FIELDS, ALLOWED_SESSION_UPDATE_FIELDS } = require("../lib/constants");
const { createLogger } = require("../shared/utils/logger");

const logger = createLogger("admin-session-repository");
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
 * Create a new admin session
 * @param {Object} sessionData - Session data to create
 * @returns {Promise<Object>} Created session object
 */
const createSession = async (sessionData) => {
  try {
    const db = await getDB();
    const validatedSessionData = createSessionSchema.parse(sessionData);

    logger.info("Creating admin session", {
      adminId: validatedSessionData.adminId,
      expiresAt: validatedSessionData.expiresAt,
    });

    const newSession = await db.adminSession.create({
      data: validatedSessionData,
      select: SESSION_FIELDS.withTokens,
    });

    if (!newSession) {
      throw new Error("Database returned null for created session");
    }

    logger.info("Admin session created successfully", {
      sessionId: newSession.id,
      adminId: newSession.adminId,
    });

    return newSession;
  } catch (error) {
    logger.error("Failed to create admin session", {
      error: error.message,
      adminId: sessionData?.adminId,
    });
    throw transformError(error, "createSession");
  }
};

/**
 * Find session by access token
 * @param {string} token - Access token
 * @returns {Promise<Object|null>} Session object or null
 */
const findByAccessToken = async (token) => {
  try {
    if (!token) {
      throw ValidationError("Token is required");
    }

    const db = await getDB();
    const session = await db.adminSession.findUnique({
      where: { token },
      select: SESSION_FIELDS.withTokens,
    });

    return session;
  } catch (error) {
    logger.error("Failed to find session by access token", { error: error.message });
    throw transformError(error, "findByAccessToken");
  }
};

/**
 * Find session by refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object|null>} Session object or null
 */
const findByRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw ValidationError("Refresh token is required");
    }

    const db = await getDB();
    const session = await db.adminSession.findUnique({
      where: { refreshToken },
      select: SESSION_FIELDS.withTokens,
    });

    return session;
  } catch (error) {
    logger.error("Failed to find session by refresh token", { error: error.message });
    throw transformError(error, "findByRefreshToken");
  }
};

/**
 * Find session by ID
 * @param {string} sessionId - Session ID (UUID)
 * @returns {Promise<Object|null>} Session object or null
 */
const findById = async (sessionId) => {
  try {
    const validId = uuidSchema.parse(sessionId);
    const db = await getDB();

    const session = await db.adminSession.findUnique({
      where: { id: validId },
      select: SESSION_FIELDS.withTokens,
    });

    return session;
  } catch (error) {
    logger.error("Failed to find session by ID", { error: error.message, sessionId });
    throw transformError(error, "findById");
  }
};

/**
 * Update session data
 * @param {string} sessionId - Session ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated session object
 */
const updateSession = async (sessionId, updateData) => {
  try {
    const validId = uuidSchema.parse(sessionId);

    if (!updateData || Object.keys(updateData).length === 0) {
      throw ValidationError("Update data cannot be empty");
    }

    const db = await getDB();

    // Filter to only allowed update fields
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([key, value]) =>
          ALLOWED_SESSION_UPDATE_FIELDS.includes(key) && value !== undefined && value !== null
      )
    );

    if (Object.keys(cleanData).length === 0) {
      throw ValidationError("No valid fields to update");
    }

    const updatedSession = await db.adminSession.update({
      where: { id: validId },
      data: {
        ...cleanData,
        updatedAt: new Date(),
      },
      select: SESSION_FIELDS.withTokens,
    });

    return updatedSession;
  } catch (error) {
    logger.error("Failed to update session", { error: error.message, sessionId });
    throw transformError(error, "updateSession");
  }
};

/**
 * Delete a session
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteSession = async (sessionId) => {
  try {
    const validId = uuidSchema.parse(sessionId);
    const db = await getDB();

    const deletedSession = await db.adminSession.delete({
      where: { id: validId },
      select: { id: true },
    });

    logger.info("Session deleted", { sessionId: deletedSession.id });
    return { success: true, deletedId: deletedSession.id };
  } catch (error) {
    logger.error("Failed to delete session", { error: error.message, sessionId });
    throw transformError(error, "deleteSession");
  }
};

/**
 * Get all sessions for an admin
 * @param {string} adminId - Admin ID
 * @param {boolean} includeExpired - Whether to include expired sessions
 * @returns {Promise<Object>} Sessions and counts
 */
const getAdminSessions = async (adminId, includeExpired = false) => {
  try {
    const validId = uuidSchema.parse(adminId);
    const db = await getDB();

    const whereClause = { adminId: validId };
    if (!includeExpired) {
      whereClause.expiresAt = { gt: new Date() };
    }

    const sessions = await db.adminSession.findMany({
      where: whereClause,
      select: SESSION_FIELDS.public,
      orderBy: { createdAt: "desc" },
    });

    const currentTime = new Date();
    const activeSessions = sessions.filter((s) => new Date(s.expiresAt) > currentTime);
    const expiredSessions = sessions.filter((s) => new Date(s.expiresAt) <= currentTime);

    return {
      sessions,
      counts: {
        total: sessions.length,
        active: activeSessions.length,
        expired: expiredSessions.length,
      },
    };
  } catch (error) {
    logger.error("Failed to get admin sessions", { error: error.message, adminId });
    throw transformError(error, "getAdminSessions");
  }
};

/**
 * Invalidate all sessions for an admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Deletion result with count
 */
const invalidateAllSessions = async (adminId) => {
  try {
    const validId = uuidSchema.parse(adminId);
    const db = await getDB();

    const result = await db.adminSession.deleteMany({
      where: { adminId: validId },
    });

    logger.info("All admin sessions invalidated", { adminId: validId, count: result.count });
    return { deletedCount: result.count };
  } catch (error) {
    logger.error("Failed to invalidate all sessions", { error: error.message, adminId });
    throw transformError(error, "invalidateAllSessions");
  }
};

/**
 * Get session statistics for an admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Session statistics
 */
const getSessionStats = async (adminId) => {
  try {
    const validId = uuidSchema.parse(adminId);
    const db = await getDB();

    const [activeSessions, totalSessions, lastSession] = await Promise.all([
      db.adminSession.count({
        where: {
          adminId: validId,
          expiresAt: { gt: new Date() },
        },
      }),
      db.adminSession.count({
        where: { adminId: validId },
      }),
      db.adminSession.findFirst({
        where: { adminId: validId },
        select: {
          createdAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      activeSessions,
      totalSessions,
      lastSession,
    };
  } catch (error) {
    logger.error("Failed to get session stats", { error: error.message, adminId });
    throw transformError(error, "getSessionStats");
  }
};

/**
 * Check if session is valid (exists and not expired)
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if session is valid
 */
const isSessionValid = async (sessionId) => {
  try {
    const session = await findById(sessionId);
    if (!session) {
      return false;
    }
    return new Date(session.expiresAt) > new Date();
  } catch (error) {
    logger.error("Failed to check session validity", { error: error.message, sessionId });
    return false;
  }
};

/**
 * Validate session by IP address
 * @param {string} sessionId - Session ID
 * @param {string} currentIP - Current request IP
 * @returns {Promise<boolean>} Whether IP matches
 */
const validateSessionIP = async (sessionId, currentIP) => {
  try {
    const db = await getDB();
    const session = await db.adminSession.findUnique({
      where: { id: sessionId },
      select: { ipAddress: true, id: true },
    });

    if (!session) {
      logger.warn("Session not found for IP validation", { sessionId });
      return false;
    }

    if (!session.ipAddress) {
      logger.debug("No IP stored for session, allowing access", { sessionId });
      return true;
    }

    const ipMatches = session.ipAddress === currentIP;
    logger.debug("Session IP validation", {
      sessionId,
      storedIP: session.ipAddress,
      currentIP,
      matches: ipMatches,
    });

    return ipMatches;
  } catch (error) {
    logger.error("Failed to validate session IP", { error: error.message, sessionId });
    return false;
  }
};

/**
 * Clean up expired sessions
 * @returns {Promise<Object>} Cleanup result with count
 */
const cleanupExpiredSessions = async () => {
  try {
    const db = await getDB();

    const result = await db.adminSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    logger.info("Expired sessions cleaned up", { deletedCount: result.count });
    return { deletedCount: result.count };
  } catch (error) {
    logger.error("Failed to cleanup expired sessions", { error: error.message });
    throw transformError(error, "cleanupExpiredSessions");
  }
};

module.exports = {
  createSession,
  findByAccessToken,
  findByRefreshToken,
  findById,
  updateSession,
  deleteSession,
  getAdminSessions,
  invalidateAllSessions,
  getSessionStats,
  isSessionValid,
  validateSessionIP,
  cleanupExpiredSessions,
};
