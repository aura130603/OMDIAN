import { testConnection } from './lib/db.js'

testConnection().then((success) => {
  if (success) {
    console.log('✅ Database connection successful!')
  } else {
    console.log('❌ Database connection failed!')
  }
  process.exit(0)
})