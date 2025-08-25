import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  // password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'omdian_bpskudus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    await connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Execute query with error handling
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params)
    return { success: true, data: results }
  } catch (error) {
    console.error('Database query error:', error.message)
    return { success: false, error: error.message }
  }
}

// Get a single connection for transactions
export const getConnection = async () => {
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error('Failed to get database connection:', error.message)
    throw error
  }
}

export default pool
