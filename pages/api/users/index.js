// Users API with dummy data operations (no database)

// Import dummy users data
import { DUMMY_USERS } from './dummy-operations'

// Helper function to map user data consistently
const mapUserData = (user) => ({
  id: user.id,
  username: user.username,
  nip: user.nip,
  nama: user.nama,
  pangkat: user.pangkat,
  golongan: user.golongan,
  jabatan: user.jabatan,
  pendidikan: user.pendidikan,
  nilaiSKP: user.nilai_skp,
  hukumanDisiplin: user.hukuman_disiplin,
  diklatPIM: user.diklat_pim,
  diklatFungsional: user.diklat_fungsional,
  role: user.role,
  status: user.status,
  createdAt: user.created_at
})

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

  const mappedUsers = DUMMY_USERS.map(mapUserData)

  console.log('✅ Users data retrieved with dummy data')

  res.status(200).json({
    success: true,
    data: mappedUsers
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
  const existingUser = DUMMY_USERS.find(u => u.username === username || u.nip === nip)
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      message: 'Username atau NIP sudah digunakan' 
    })
  }

  // Add new user to dummy data
  const newId = Math.max(...DUMMY_USERS.map(u => u.id)) + 1
  const newUser = {
    id: newId,
    username,
    password, // In real app, this would be hashed
    nip,
    nama,
    pangkat,
    golongan,
    jabatan,
    pendidikan,
    nilai_skp: nilaiSKP || null,
    hukuman_disiplin: hukumanDisiplin || 'Tidak Pernah',
    diklat_pim: diklatPIM || 'Belum',
    diklat_fungsional: diklatFungsional || 'Belum',
    role: 'pegawai',
    status: 'aktif',
    created_at: new Date().toISOString()
  }

  DUMMY_USERS.push(newUser)

  console.log('✅ User created with dummy data')

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

  // Find user to update
  const userIndex = DUMMY_USERS.findIndex(u => u.id === parseInt(id))
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan' 
    })
  }

  // Update user data
  const updatedUser = {
    ...DUMMY_USERS[userIndex],
    username: username || DUMMY_USERS[userIndex].username,
    nama: nama || DUMMY_USERS[userIndex].nama,
    pangkat: pangkat || DUMMY_USERS[userIndex].pangkat,
    golongan: golongan || DUMMY_USERS[userIndex].golongan,
    jabatan: jabatan || DUMMY_USERS[userIndex].jabatan,
    pendidikan: pendidikan || DUMMY_USERS[userIndex].pendidikan,
    nilai_skp: nilaiSKP !== undefined ? nilaiSKP : DUMMY_USERS[userIndex].nilai_skp,
    hukuman_disiplin: hukumanDisiplin || DUMMY_USERS[userIndex].hukuman_disiplin,
    diklat_pim: diklatPIM || DUMMY_USERS[userIndex].diklat_pim,
    diklat_fungsional: diklatFungsional || DUMMY_USERS[userIndex].diklat_fungsional
  }

  // Update password if provided
  if (password) {
    updatedUser.password = password // In real app, this would be hashed
  }

  // Replace the user in array
  DUMMY_USERS[userIndex] = updatedUser

  console.log('✅ User updated with dummy data')

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

  // Find user to delete
  const userIndex = DUMMY_USERS.findIndex(u => u.id === parseInt(id))
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Pengguna tidak ditemukan' 
    })
  }

  // Check if user is admin (don't allow deleting admin users)
  if (DUMMY_USERS[userIndex].role === 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin tidak dapat dihapus' 
    })
  }

  // Delete user
  DUMMY_USERS.splice(userIndex, 1)

  console.log('✅ User deleted with dummy data')

  res.status(200).json({
    success: true,
    message: 'Pengguna berhasil dihapus'
  })
}
