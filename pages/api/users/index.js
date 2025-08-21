import { executeQuery } from '../../../lib/db'
import bcrypt from 'bcryptjs'

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
      id,
      username,
      nip,
      nama,
      pangkat,
      golongan,
      jabatan,
      pendidikan,
      nilai_skp as nilaiSKP,
      hukuman_disiplin as hukumanDisiplin,
      diklat_pim as diklatPIM,
      diklat_fungsional as diklatFungsional,
      role,
      status,
      created_at as createdAt
    FROM users 
    ORDER BY created_at DESC
  `

  const result = await executeQuery(query)

  if (!result.success) {
    console.error('Database error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengguna'
    })
  }

  console.log('✅ Users data retrieved from database')

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
      message: 'Gagal menambahkan pengguna'
    })
  }

  console.log('✅ User created in database')

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

  // Check if user exists
  const checkQuery = 'SELECT id FROM users WHERE id = ?'
  const existingUser = await executeQuery(checkQuery, [id])

  if (!existingUser.success || existingUser.data.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan' 
    })
  }

  // Build update query
  let updateQuery = `
    UPDATE users SET 
      username = ?, nama = ?, pangkat = ?, golongan = ?, jabatan = ?, 
      pendidikan = ?, nilai_skp = ?, hukuman_disiplin = ?, 
      diklat_pim = ?, diklat_fungsional = ?
  `
  let updateParams = [
    username, nama, pangkat, golongan, jabatan, pendidikan,
    nilaiSKP || null, hukumanDisiplin || 'Tidak Pernah',
    diklatPIM || 'Belum', diklatFungsional || 'Belum'
  ]

  // Add password to update if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    updateQuery += ', password = ?'
    updateParams.push(hashedPassword)
  }

  updateQuery += ' WHERE id = ?'
  updateParams.push(id)

  const result = await executeQuery(updateQuery, updateParams)

  if (!result.success) {
    console.error('Update user error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengguna'
    })
  }

  console.log('✅ User updated in database')

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

  // Check if user exists and get role
  const checkQuery = 'SELECT role FROM users WHERE id = ?'
  const existingUser = await executeQuery(checkQuery, [id])

  if (!existingUser.success || existingUser.data.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan' 
    })
  }

  // Check if user is admin (don't allow deleting admin users)
  if (existingUser.data[0].role === 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin tidak dapat dihapus' 
    })
  }

  // Delete user
  const deleteQuery = 'DELETE FROM users WHERE id = ?'
  const result = await executeQuery(deleteQuery, [id])

  if (!result.success) {
    console.error('Delete user error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengguna'
    })
  }

  console.log('✅ User deleted from database')

  res.status(200).json({
    success: true,
    message: 'Pengguna berhasil dihapus'
  })
}
