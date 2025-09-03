import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'
import { DUMMY_USERS } from '../users/dummy-operations'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    let username, password;

    // Handle both JSON and form-encoded data
    if (req.headers['content-type']?.includes('application/json')) {
      ({ username, password } = req.body);
    } else {
      // Handle form-encoded data
      const body = req.body;
      username = body.username || body['"username'] || body['username"'] || body['"username"'];
      password = body.password || body['"password'] || body['password"'] || body['"password"'];

      // Clean up quotes if present
      if (username && username.includes('"')) {
        username = username.replace(/"/g, '');
      }
      if (password && password.includes('"')) {
        password = password.replace(/"/g, '');
      }
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      })
    }

    // Query user from database
    const query = `
      SELECT
        id, username, password, nip, nama, pangkat, golongan, jabatan,
        pendidikan, nilai_skp, hukuman_disiplin, diklat_pim, diklat_fungsional,
        role, status
      FROM users
      WHERE username = ? AND status = 'aktif'
    `

    const result = await executeQuery(query, [username])

    let user = null

    if (result.success && result.data.length > 0) {
      user = result.data[0]
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        })
      }

      const { password: _dbPass, ...safeUser } = user
      console.log('✅ Login successful from database:', safeUser.username)
      return res.status(200).json({
        success: true,
        user: safeUser,
        message: 'Login berhasil'
      })
    }

    // Fallback to dummy users when DB is unavailable or user not found
    const fallbackUser = DUMMY_USERS.find(u => u.username === username && u.status === 'aktif')
    if (!fallbackUser) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      })
    }

    if (fallbackUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      })
    }

    const { password: _dummyPass, ...safeDummy } = fallbackUser
    console.log('✅ Login successful with fallback data:', safeDummy.username)
    return res.status(200).json({
      success: true,
      user: safeDummy,
      message: 'Login berhasil (mode demo)'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}
