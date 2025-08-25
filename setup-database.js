import { executeQuery, testConnection } from './lib/db.js'
import bcrypt from 'bcryptjs'

async function setupDatabase() {
  console.log('🔄 Testing database connection...')
  
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error('❌ Database connection failed!')
    process.exit(1)
  }

  console.log('🔄 Creating tables if they don\'t exist...')

  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nip VARCHAR(18) UNIQUE NOT NULL,
      nama VARCHAR(100) NOT NULL,
      pangkat VARCHAR(50) NOT NULL,
      golongan VARCHAR(10) NOT NULL,
      jabatan VARCHAR(100) NOT NULL,
      pendidikan VARCHAR(50) NOT NULL,
      role ENUM('admin', 'pegawai', 'kepala_bps') DEFAULT 'pegawai',
      status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `

  const usersTableResult = await executeQuery(createUsersTable)
  if (usersTableResult.success) {
    console.log('✅ Users table created/verified')
  } else {
    console.error('❌ Failed to create users table:', usersTableResult.error)
  }

  // Create training_data table
  const createTrainingTable = `
    CREATE TABLE IF NOT EXISTS training_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tema VARCHAR(255) NOT NULL,
      penyelenggara VARCHAR(255) NOT NULL,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE NOT NULL,
      keterangan TEXT NULL,
      sertifikat VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_tanggal (tanggal_mulai, tanggal_selesai)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `

  const trainingTableResult = await executeQuery(createTrainingTable)
  if (trainingTableResult.success) {
    console.log('✅ Training data table created/verified')
  } else {
    console.error('❌ Failed to create training table:', trainingTableResult.error)
  }

  // Check if admin user exists
  const checkAdminQuery = 'SELECT id FROM users WHERE role = "admin" LIMIT 1'
  const adminCheck = await executeQuery(checkAdminQuery)

  if (adminCheck.success && adminCheck.data.length === 0) {
    console.log('🔄 Creating default admin user...')
    
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const createAdminQuery = `
      INSERT INTO users (
        username, password, nip, nama, pangkat, golongan, jabatan, pendidikan, role, status
      ) VALUES (
        'admin1', ?, '196512101989031003', 'Drs. Ahmad Wijaya', 'Pembina', 'IV/a',
        'Kepala Subbagian Umum', 'S1 Administrasi Negara', 'admin', 'aktif'
      )
    `

    const adminResult = await executeQuery(createAdminQuery, [adminPassword])
    if (adminResult.success) {
      console.log('✅ Default admin user created')
      console.log('   Username: Admin Omdian')
      console.log('   Password: adminomdian3319')
    } else {
      console.error('❌ Failed to create admin user:', adminResult.error)
    }
  } else {
    console.log('✅ Admin user already exists')
  }

  // Check if kepala BPS user exists
  const checkKepalaQuery = 'SELECT id FROM users WHERE role = "kepala_bps" LIMIT 1'
  const kepalaCheck = await executeQuery(checkKepalaQuery)

  if (kepalaCheck.success && kepalaCheck.data.length === 0) {
    console.log('🔄 Creating default Kepala BPS user...')

    // Create default Kepala BPS user
    const kepalaPassword = await bcrypt.hash('kepala123', 10)
    const createKepalaQuery = `
      INSERT INTO users (
        username, password, nip, nama, pangkat, golongan, jabatan, pendidikan, role, status
      ) VALUES (
        'kepala1', ?, '196010051985031001', 'Dr. Soekarno Wijaya, M.Si', 'Pembina Utama Muda', 'IV/c',
        'Kepala BPS Kabupaten Kudus', 'S3 Statistik', 'kepala_bps', 'aktif'
      )
    `

    const kepalaResult = await executeQuery(createKepalaQuery, [kepalaPassword])
    if (kepalaResult.success) {
      console.log('✅ Default Kepala BPS user created')
      console.log('   Username: Kepala BPS Kudus')
      console.log('   Password: kepalabps3319')
    } else {
      console.error('❌ Failed to create Kepala BPS user:', kepalaResult.error)
    }
  } else {
    console.log('✅ Kepala BPS user already exists')
  }

  // Check if employee users exist
  const checkEmployeeQuery = 'SELECT id FROM users WHERE role = "pegawai" LIMIT 1'
  const employeeCheck = await executeQuery(checkEmployeeQuery)

  if (employeeCheck.success && employeeCheck.data.length === 0) {
    console.log('🔄 Creating default employee users...')
    
    // Create default employee users
    const employeePassword = await bcrypt.hash('password123', 10)
    
    const employees = [
      {
        username: 'pegawai1',
        nip: '196801011992031001',
        nama: 'Budi Santoso',
        pangkat: 'Penata Muda Tk. I',
        golongan: 'III/b',
        jabatan: 'Statistisi Ahli Pertama',
        pendidikan: 'S1 Statistik'
      },
      {
        username: 'pegawai2',
        nip: '197505151998032002',
        nama: 'Siti Aminah',
        pangkat: 'Penata',
        golongan: 'III/c',
        jabatan: 'Statistisi Ahli Muda',
        pendidikan: 'S1 Matematika'
      }
    ]

    for (const employee of employees) {
      const createEmployeeQuery = `
        INSERT INTO users (
          username, password, nip, nama, pangkat, golongan, jabatan, pendidikan, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pegawai', 'aktif')
      `

      const employeeResult = await executeQuery(createEmployeeQuery, [
        employee.username, employeePassword, employee.nip, employee.nama,
        employee.pangkat, employee.golongan, employee.jabatan, employee.pendidikan
      ])

      if (employeeResult.success) {
        console.log(`✅ Employee ${employee.username} created`)
      } else {
        console.error(`❌ Failed to create employee ${employee.username}:`, employeeResult.error)
      }
    }
  } else {
    console.log('✅ Employee users already exist')
  }

  console.log('\n🎉 Database setup completed!')
  console.log('\n📋 Default Login Credentials:')
  console.log('Admin: admin1 / admin123')
  console.log('Kepala BPS: kepala1 / kepala123')
  console.log('Employee: pegawai1 / password123')
  console.log('Employee: pegawai2 / password123')
}

setupDatabase().catch(console.error)
