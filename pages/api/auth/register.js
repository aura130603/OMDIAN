import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      username, 
      password, 
      nip, 
      nama, 
      pangkat, 
      golongan, 
      jabatan, 
      pendidikan, 
      nilaiSKP,
      hukumanDisiplin,
      diklatPIM,
      diklatFungsional 
    } = req.body

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
    const checkQuery = `
      SELECT username, nip FROM users 
      WHERE username = ? OR nip = ?
    `
    
    const checkResult = await executeQuery(checkQuery, [username, nip])
    
    if (!checkResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan database' 
      })
    }

    if (checkResult.data.length > 0) {
      const existing = checkResult.data[0]
      if (existing.username === username) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username sudah digunakan' 
        })
      }
      if (existing.nip === nip) {
        return res.status(409).json({ 
          success: false, 
          message: 'NIP sudah terdaftar' 
        })
      }
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const insertQuery = `
      INSERT INTO users (
        username, password, nip, nama, pangkat, golongan, jabatan, 
        pendidikan, nilai_skp, hukuman_disiplin, diklat_pim, diklat_fungsional, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pegawai')
    `
    
    const insertResult = await executeQuery(insertQuery, [
      username,
      hashedPassword,
      nip,
      nama,
      pangkat,
      golongan,
      jabatan,
      pendidikan,
      nilaiSKP || null,
      hukumanDisiplin || 'Tidak Pernah',
      diklatPIM || 'Belum',
      diklatFungsional || 'Belum'
    ])

    if (!insertResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gagal menyimpan data pengguna' 
      })
    }

    // Log registration activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, activity_type, description, ip_address, user_agent)
      VALUES (?, 'register', 'User baru mendaftar', ?, ?)
    `
    
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    
    await executeQuery(logQuery, [insertResult.data.insertId, clientIP, userAgent])

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}
