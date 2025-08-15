import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username dan password wajib diisi' 
      })
    }

    // Get user from database
    const userQuery = `
      SELECT id, username, password, nip, nama, pangkat, golongan, jabatan, 
             pendidikan, nilai_skp, hukuman_disiplin, diklat_pim, diklat_fungsional, role, status
      FROM users 
      WHERE username = ? AND status = 'aktif'
    `
    
    const userResult = await executeQuery(userQuery, [username])
    
    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah' 
      })
    }

    const user = userResult.data[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah' 
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Log login activity
    const logQuery = `
      INSERT INTO activity_logs (user_id, activity_type, description, ip_address, user_agent)
      VALUES (?, 'login', 'User berhasil login', ?, ?)
    `
    
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    
    await executeQuery(logQuery, [user.id, clientIP, userAgent])

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: 'Login berhasil'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}
