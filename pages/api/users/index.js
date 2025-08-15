import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getUsers(req, res)
      case 'POST':
        return await createUser(req, res)
      case 'PUT':
        return await updateUser(req, res)
      case 'DELETE':
        return await deleteUser(req, res)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Users API error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}

// GET - Retrieve users
async function getUsers(req, res) {
  const { role } = req.query

  // Only admin can access user list
  if (role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak' 
    })
  }

  const query = `
    SELECT 
      id, username, nip, nama, pangkat, golongan, jabatan, 
      pendidikan, nilai_skp, hukuman_disiplin, diklat_pim, 
      diklat_fungsional, role, status, created_at
    FROM users
    ORDER BY nama ASC
  `

  const result = await executeQuery(query)

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data pengguna' 
    })
  }

  res.status(200).json({
    success: true,
    data: result.data
  })
}

// POST - Create new user (Admin only)
async function createUser(req, res) {
  const { 
    requestorRole,
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

  // Only admin can create users
  if (requestorRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak' 
    })
  }

  // Validation
  if (!username || !password || !nip || !nama || !pangkat || !golongan || !jabatan || !pendidikan) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field wajib diisi' 
    })
  }

  // Check if username or NIP already exists
  const checkQuery = 'SELECT username, nip FROM users WHERE username = ? OR nip = ?'
  const checkResult = await executeQuery(checkQuery, [username, nip])
  
  if (!checkResult.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan database' 
    })
  }

  if (checkResult.data.length > 0) {
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
      username, password, nip, nama, pangkat, golongan, jabatan, 
      pendidikan, nilai_skp, hukuman_disiplin, diklat_pim, diklat_fungsional, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pegawai')
  `
  
  const insertResult = await executeQuery(insertQuery, [
    username, hashedPassword, nip, nama, pangkat, golongan, jabatan,
    pendidikan, nilaiSKP || null, hukumanDisiplin || 'Tidak Pernah',
    diklatPIM || 'Belum', diklatFungsional || 'Belum'
  ])

  if (!insertResult.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menyimpan data pengguna' 
    })
  }

  res.status(201).json({
    success: true,
    message: 'Pengguna berhasil ditambahkan'
  })
}

// PUT - Update user
async function updateUser(req, res) {
  const { 
    requestorRole,
    id,
    username, 
    password,
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

  // Only admin can update users
  if (requestorRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak' 
    })
  }

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pengguna diperlukan' 
    })
  }

  let query, params

  if (password) {
    // Update with new password
    const hashedPassword = await bcrypt.hash(password, 10)
    query = `
      UPDATE users 
      SET username = ?, password = ?, nama = ?, pangkat = ?, golongan = ?, 
          jabatan = ?, pendidikan = ?, nilai_skp = ?, hukuman_disiplin = ?, 
          diklat_pim = ?, diklat_fungsional = ?
      WHERE id = ?
    `
    params = [
      username, hashedPassword, nama, pangkat, golongan, jabatan,
      pendidikan, nilaiSKP || null, hukumanDisiplin || 'Tidak Pernah',
      diklatPIM || 'Belum', diklatFungsional || 'Belum', id
    ]
  } else {
    // Update without changing password
    query = `
      UPDATE users 
      SET username = ?, nama = ?, pangkat = ?, golongan = ?, jabatan = ?, 
          pendidikan = ?, nilai_skp = ?, hukuman_disiplin = ?, diklat_pim = ?, 
          diklat_fungsional = ?
      WHERE id = ?
    `
    params = [
      username, nama, pangkat, golongan, jabatan, pendidikan,
      nilaiSKP || null, hukumanDisiplin || 'Tidak Pernah',
      diklatPIM || 'Belum', diklatFungsional || 'Belum', id
    ]
  }

  const result = await executeQuery(query, params)

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memperbarui data pengguna' 
    })
  }

  if (result.data.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan' 
    })
  }

  res.status(200).json({
    success: true,
    message: 'Data pengguna berhasil diperbarui'
  })
}

// DELETE - Delete user
async function deleteUser(req, res) {
  const { id, requestorRole } = req.query

  // Only admin can delete users
  if (requestorRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak' 
    })
  }

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pengguna diperlukan' 
    })
  }

  // Check if user is admin (don't allow deleting admin users)
  const checkQuery = 'SELECT role FROM users WHERE id = ?'
  const checkResult = await executeQuery(checkQuery, [id])
  
  if (checkResult.success && checkResult.data.length > 0) {
    if (checkResult.data[0].role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin tidak dapat dihapus' 
      })
    }
  }

  const query = 'DELETE FROM users WHERE id = ? AND role != "admin"'
  const result = await executeQuery(query, [id])

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus pengguna' 
    })
  }

  if (result.data.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan atau tidak dapat dihapus' 
    })
  }

  res.status(200).json({
    success: true,
    message: 'Pengguna berhasil dihapus'
  })
}
