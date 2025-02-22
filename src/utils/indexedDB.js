import { openDB } from "idb";

const DB_NAME = "QuizAppDB";
const DB_VERSION = 1;
const STORES = {
  ATTEMPTS: "attempts",
  USERS: "users",
  SETTINGS: "settings"
};

/**
 * Initializes and returns the database connection
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create attempts store with index for efficient queries
        if (!db.objectStoreNames.contains(STORES.ATTEMPTS)) {
          const attemptsStore = db.createObjectStore(STORES.ATTEMPTS, { 
            keyPath: "id", 
            autoIncrement: true 
          });
          attemptsStore.createIndex("byDate", "date");
          attemptsStore.createIndex("byScore", "score");
          attemptsStore.createIndex("byUserId", "userId");
        }
        
        // Create users store
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: "id" });
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
        }
        
        console.log(`Database upgraded from v${oldVersion} to v${newVersion}`);
      },
    });
    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw new Error("Failed to initialize database");
  }
}

/**
 * Saves a quiz attempt to the database
 * @param {Object} attempt - Quiz attempt with date, score, and answers
 * @returns {Promise<number>} - ID of the saved attempt
 */
export async function saveAttempt(attempt) {
  if (!attempt || !attempt.date) {
    throw new Error("Invalid attempt data");
  }
  
  try {
    const db = await initDB();
    const enhancedAttempt = {
      ...attempt,
      date: attempt.date instanceof Date ? attempt.date : new Date(attempt.date),
      lastModified: new Date()
    };
    
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const id = await tx.store.add(enhancedAttempt);
    await tx.done;
    return id;
  } catch (error) {
    console.error("Failed to save attempt:", error);
    throw new Error("Failed to save quiz attempt");
  }
}

/**
 * Updates an existing quiz attempt
 * @param {number} id - Attempt ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateAttempt(id, updates) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const attempt = await tx.store.get(id);
    
    if (!attempt) {
      throw new Error(`Attempt with ID ${id} not found`);
    }
    
    const updatedAttempt = {
      ...attempt,
      ...updates,
      lastModified: new Date()
    };
    
    await tx.store.put(updatedAttempt);
    await tx.done;
  } catch (error) {
    console.error("Failed to update attempt:", error);
    throw new Error("Failed to update quiz attempt");
  }
}

/**
 * Gets all quiz attempts
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {string} options.sortBy - Field to sort by ('date', 'score')
 * @param {boolean} options.descending - Sort in descending order
 * @returns {Promise<Array>} - Matching attempts
 */
export async function getAttempts(options = {}) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ATTEMPTS, "readonly");
    
    let results;
    if (options.sortBy) {
      const index = tx.store.index(`by${options.sortBy.charAt(0).toUpperCase() + options.sortBy.slice(1)}`);
      results = await index.getAll(null, options.limit);
      
      if (options.descending) {
        results.reverse();
      }
    } else {
      results = await tx.store.getAll(null, options.limit);
    }
    
    await tx.done;
    return results;
  } catch (error) {
    console.error("Failed to get attempts:", error);
    throw new Error("Failed to retrieve quiz attempts");
  }
}

/**
 * Gets attempts by date range
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Array>} - Matching attempts
 */
export async function getAttemptsByDateRange(startDate, endDate) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ATTEMPTS, "readonly");
    const index = tx.store.index("byDate");
    
    const range = IDBKeyRange.bound(startDate, endDate);
    const results = await index.getAll(range);
    await tx.done;
    
    return results;
  } catch (error) {
    console.error("Failed to get attempts by date range:", error);
    throw new Error("Failed to retrieve quiz attempts by date range");
  }
}

/**
 * Deletes a quiz attempt
 * @param {number} id - Attempt ID to delete
 * @returns {Promise<void>}
 */
export async function deleteAttempt(id) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    await tx.store.delete(id);
    await tx.done;
  } catch (error) {
    console.error("Failed to delete attempt:", error);
    throw new Error("Failed to delete quiz attempt");
  }
}

/**
 * Clears outdated attempts (older than 30 days) but keeps recent data.
 * @returns {Promise<void>}
 */
export async function clearOldAttempts() {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const index = tx.store.index("byDate");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1); // 1 days ago

    const range = IDBKeyRange.upperBound(cutoffDate);
    const oldAttempts = await index.getAllKeys(range);

    for (const id of oldAttempts) {
      await tx.store.delete(id);
    }

    await tx.done;
    console.log("Old attempts cleared successfully");
  } catch (error) {
    console.error("Failed to clear old attempts:", error);
    throw new Error("Failed to clean past quiz attempts");
  }
}

/**
 * Clears all stored data
 * @returns {Promise<void>}
 */
export async function clearDatabase() {
  try {
    const db = await initDB();
    const tx = db.transaction(Object.values(STORES), "readwrite");

    const promises = Object.values(STORES).map(store => tx.objectStore(store).clear());
    await Promise.all(promises);
    await tx.done;

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw new Error("Failed to clear database");
  }
}
