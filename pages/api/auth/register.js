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
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR nip = ?'
    const existingUser = await executeQuery(checkQuery, [username, nip])

    if (!existingUser.success) {
      return res.status(500).json({
        success: false,
        message: 'Gagal memeriksa data existing'
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
        username, password, nip, nama, pangkat, golongan, jabatan, pendidikan,
        nilai_skp, hukuman_disiplin, diklat_pim, diklat_fungsional, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pegawai', 'aktif')
    `

    const insertParams = [
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
