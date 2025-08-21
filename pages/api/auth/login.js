import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

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

    if (!result.success) {
      console.error('Database error during login:', result.error)
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      })
    }

    if (result.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      })
    }

    const user = result.data[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Map database fields to frontend format
    const userResponse = {
      ...userWithoutPassword,
      nilaiSKP: user.nilai_skp,
      hukumanDisiplin: user.hukuman_disiplin,
      diklatPIM: user.diklat_pim,
      diklatFungsional: user.diklat_fungsional
    }

    console.log('✅ Login successful from database:', userResponse.username)

    res.status(200).json({
      success: true,
      user: userResponse,
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
