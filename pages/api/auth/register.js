import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    let username, password, nip, nama, pangkat, golongan, jabatan, pendidikan;

    // Handle both JSON and form-encoded data
    if (req.headers['content-type']?.includes('application/json')) {
      ({ username, password, nip, nama, pangkat, golongan, jabatan, pendidikan } = req.body);
    } else {
      // Handle form-encoded data
      const body = req.body;
      const cleanValue = (key) => {
        let value = body[key] || body[`"${key}`] || body[`${key}"`] || body[`"${key}"`];
        if (value && value.includes('"')) {
          value = value.replace(/"/g, '');
        }
        return value;
      };

      username = cleanValue('username');
      password = cleanValue('password');
      nip = cleanValue('nip');
      nama = cleanValue('nama');
      pangkat = cleanValue('pangkat');
      golongan = cleanValue('golongan');
      jabatan = cleanValue('jabatan');
      pendidikan = cleanValue('pendidikan');
    }

    // Validation
    if (!username || !password || !nip || !nama || !pangkat || !golongan || !jabatan || !pendidikan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field wajib diisi' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password harus minimal 6 karakter' 
      })
    }

    if (nip.length !== 18) {
      return res.status(400).json({ 
        success: false, 
        message: 'NIP harus 18 digit' 
      })
    }

    // Check if username or NIP already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR nip = ?'
    const existingUser = await executeQuery(checkQuery, [username, nip])

    if (!existingUser.success) {
      // Fallback to in-memory demo registration
      const { DUMMY_USERS } = await import('../users/dummy-operations')
      const exists = DUMMY_USERS.some(u => u.username === username || u.nip === nip)
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Username atau NIP sudah digunakan'
        })
      }
      const newId = Math.max(...DUMMY_USERS.map(u => u.id)) + 1
      DUMMY_USERS.push({
        id: newId,
        username,
        password, // stored plain for demo consistency
        nip,
        nama,
        pangkat,
        golongan,
        jabatan,
        pendidikan,
        role: 'pegawai',
        status: 'aktif',
        created_at: new Date().toISOString()
      })
      console.log('✅ Registration successful in fallback mode:', username)
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil (mode demo). Silakan login.'
      })
    }

    if (existingUser.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username atau NIP sudah digunakan'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const insertQuery = `
      INSERT INTO users (
        username, password, nip, nama, pangkat, golongan, jabatan, pendidikan, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pegawai', 'aktif')
    `

    const insertParams = [
      username,
      hashedPassword,
      nip,
      nama,
      pangkat,
      golongan,
      jabatan,
      pendidikan
    ]

    const result = await executeQuery(insertQuery, insertParams)

    if (!result.success) {
      console.error('Insert user error:', result.error)
      return res.status(500).json({
        success: false,
        message: 'Gagal mendaftarkan pengguna'
      })
    }

    console.log('✅ Registration successful in database:', username)

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun yang baru dibuat.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}
