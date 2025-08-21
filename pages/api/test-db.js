import { testConnection, executeQuery } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        tests: {
          connection: false
        }
      })
    }

    // Test tables exist
    const tablesCheck = await executeQuery('SHOW TABLES')
    const tables = tablesCheck.success ? tablesCheck.data.map(row => Object.values(row)[0]) : []

    // Test users table
    const usersCount = await executeQuery('SELECT COUNT(*) as count FROM users')
    const trainingCount = await executeQuery('SELECT COUNT(*) as count FROM training_data')

    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      tests: {
        connection: true,
        tables_exist: tables.includes('users') && tables.includes('training_data'),
        users_count: usersCount.success ? usersCount.data[0].count : 0,
        training_count: trainingCount.success ? trainingCount.data[0].count : 0,
        available_tables: tables
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      tests: {
        connection: false
      }
    })
  }
}
