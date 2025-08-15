# Database Setup Instructions for OMDIAN

## Prerequisites
- MySQL/MariaDB Server
- phpMyAdmin (optional but recommended)
- Node.js with npm

## Step 1: Create Database

### Using phpMyAdmin:
1. Open phpMyAdmin in your browser
2. Click on "New" to create a new database
3. Enter database name: `omdian_bpskudus`
4. Select Collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Using MySQL Command Line:
```sql
CREATE DATABASE omdian_bpskudus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Import Database Schema

### Using phpMyAdmin:
1. Select the `omdian_bpskudus` database
2. Click on "Import" tab
3. Choose file: `database/omdian_bpskudus.sql`
4. Click "Go" to import

### Using MySQL Command Line:
```bash
mysql -u root -p omdian_bpskudus < database/omdian_bpskudus.sql
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=omdian_bpskudus
   
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   SESSION_TIMEOUT=3600
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Database Connection

Create a test file to verify database connection:

```javascript
// test-db.js
import { testConnection } from './lib/db.js'

testConnection().then((success) => {
  if (success) {
    console.log('✅ Database connection successful!')
  } else {
    console.log('❌ Database connection failed!')
  }
  process.exit(0)
})
```

Run the test:
```bash
node test-db.js
```

## Step 6: Start the Application

```bash
npm run dev
```

## Default Login Credentials

After importing the database, you can use these default accounts:

### Admin Account:
- **Username:** admin1
- **Password:** admin123
- **NIP:** 196512101989031003

### Employee Accounts:
- **Username:** pegawai1
- **Password:** password123
- **NIP:** 196801011992031001

- **Username:** pegawai2
- **Password:** password123
- **NIP:** 197505151998032002

## Database Structure

### Tables Created:
1. **users** - User accounts and employee data
2. **training_data** - Training/workshop/seminar records
3. **certificates** - Certificate file information
4. **user_sessions** - User login sessions
5. **activity_logs** - System activity logging
6. **system_settings** - Application configuration

### Views Created:
1. **view_training_summary** - Training summary per employee
2. **view_statistics** - Overall system statistics

### Stored Procedures:
1. **GetEmployeeStatistics** - Get statistics for specific employee
2. **GetEmployeesWithoutCurrentYearTraining** - Get employees without current year training

## Security Notes

### Important Security Measures:
1. **Change default passwords** immediately after setup
2. **Use strong passwords** for database and admin accounts
3. **Set proper file permissions** on the .env file
4. **Configure firewall** to restrict database access
5. **Enable SSL** for production environments
6. **Regular database backups**

### Password Hashing:
- All passwords are hashed using bcrypt with salt rounds = 10
- Default passwords in SQL are placeholder hashes - update them after setup

## Troubleshooting

### Common Issues:

1. **Connection Refused:**
   - Check if MySQL service is running
   - Verify database credentials in .env file
   - Check firewall settings

2. **Access Denied:**
   - Verify MySQL user permissions
   - Check password in .env file
   - Ensure user has access to the database

3. **Table Not Found:**
   - Ensure SQL file was imported completely
   - Check if database name is correct
   - Verify table names in queries

4. **Character Encoding Issues:**
   - Ensure database uses utf8mb4_unicode_ci collation
   - Check file encoding when importing SQL

### Database Maintenance:

1. **Backup Database:**
   ```bash
   mysqldump -u root -p omdian_bpskudus > backup_$(date +%Y%m%d).sql
   ```

2. **Clear Old Logs:**
   ```sql
   DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
   ```

3. **Clear Expired Sessions:**
   ```sql
   DELETE FROM user_sessions WHERE expires_at < NOW();
   ```

## Production Deployment

### Additional Steps for Production:
1. Create dedicated database user with limited permissions
2. Configure SSL certificates
3. Set up automated backups
4. Configure log rotation
5. Monitor database performance
6. Set up replication if needed

### Sample Production User:
```sql
CREATE USER 'omdian_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON omdian_bpskudus.* TO 'omdian_app'@'localhost';
FLUSH PRIVILEGES;
```

## Support

If you encounter any issues:
1. Check the error logs in your MySQL server
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check file permissions
5. Review database connection settings

For additional help, refer to the application logs and MySQL error logs.
