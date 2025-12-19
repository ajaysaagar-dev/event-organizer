import API_URL from "../config/api";

/**
 * Execute a raw SQL query against the server
 * @param {string} query - SQL query string
 * @returns {Promise<{success: boolean, rows?: Array, fields?: Array, error?: string}>}
 */
export async function executeQuery(query) {
  try {
    const response = await fetch(`${API_URL}/sql/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Query failed",
      };
    }

    return data;
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Helper to escape SQL strings to prevent injection
 * @param {string} str
 * @returns {string}
 */
export function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

/**
 * Helper to format date for SQL
 * @param {string|Date} date
 * @returns {string}
 */
export function formatSqlDate(date) {
  if (!date) return "NULL";
  const d = new Date(date);
  return `'${d.toISOString().slice(0, 19).replace("T", " ")}'`;
}

/**
 * Helper to format boolean for SQL
 * @param {boolean} val
 * @returns {number}
 */
export function formatSqlBoolean(val) {
  return val ? 1 : 0;
}
