import { executeQuery } from '../../../lib/db'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return await getTrainingData(req, res)
      case 'POST':
        return await createTrainingData(req, res)
      case 'PUT':
        return await updateTrainingData(req, res)
      case 'DELETE':
        return await deleteTrainingData(req, res)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Training API error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}

// GET - Retrieve training data
async function getTrainingData(req, res) {
  const { userId, role } = req.query

  if (!userId || !role) {
    return res.status(400).json({
      success: false,
      message: 'User ID dan role diperlukan'
    })
  }

  let query = `
    SELECT
      t.id,
      t.user_id as userId,
      t.tema,
      t.penyelenggara,
      DATE_FORMAT(t.tanggal_mulai, '%Y-%m-%d') as tanggalMulai,
      DATE_FORMAT(t.tanggal_selesai, '%Y-%m-%d') as tanggalSelesai,
      t.keterangan,
      NULL as sertifikat,
      t.created_at as createdAt,
      u.nama as pegawaiNama,
      u.nip as pegawaiNIP
    FROM training_data t
    JOIN users u ON t.user_id = u.id
  `

  let queryParams = []

  // If not admin, only show own training data
  if (role !== 'admin') {
    query += ' WHERE t.user_id = ?'
    queryParams.push(userId)
  }

  query += ' ORDER BY t.tanggal_mulai DESC'

  const result = await executeQuery(query, queryParams)

  if (!result.success) {
    console.error('Database error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pelatihan'
    })
  }

  console.log('✅ Training data retrieved from database')

  res.status(200).json({
    success: true,
    data: result.data
  })
}

// POST - Create new training data
async function createTrainingData(req, res) {
  const {
    userId,
    tema,
    penyelenggara,
    tanggalMulai,
    tanggalSelesai,
    keterangan,
    sertifikat
  } = req.body

  // Validation
  if (!userId || !tema || !penyelenggara || !tanggalMulai || !tanggalSelesai) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi'
    })
  }

  // Check if end date is after start date
  if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai' 
    })
  }

  // Verify user exists
  const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [userId])
  if (!userCheck.success || userCheck.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    })
  }

  // Insert training data (without sertifikat column for now)
  const insertQuery = `
    INSERT INTO training_data (
      user_id, tema, penyelenggara, tanggal_mulai, tanggal_selesai, keterangan
    ) VALUES (?, ?, ?, ?, ?, ?)
  `

  const insertParams = [
    userId,
    tema,
    penyelenggara,
    tanggalMulai,
    tanggalSelesai,
    keterangan || null
  ]

  const result = await executeQuery(insertQuery, insertParams)

  if (!result.success) {
    console.error('Insert training error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data pelatihan'
    })
  }

  console.log('✅ Training data added to database')

  res.status(201).json({
    success: true,
    message: 'Data pelatihan berhasil ditambahkan',
    data: { id: result.data.insertId }
  })
}

// PUT - Update training data
async function updateTrainingData(req, res) {
  const { 
    id, 
    tema, 
    penyelenggara, 
    tanggalMulai, 
    tanggalSelesai, 
    keterangan,
    sertifikat,
    userId
  } = req.body

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pelatihan diperlukan' 
    })
  }

  // Check if end date is after start date
  if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai' 
    })
  }

  // Check if training exists and user has permission
  let checkQuery = 'SELECT user_id FROM training_data WHERE id = ?'
  let checkParams = [id]

  // If not admin, ensure user can only edit their own data
  if (userId) {
    checkQuery += ' AND user_id = ?'
    checkParams.push(userId)
  }

  const existingTraining = await executeQuery(checkQuery, checkParams)

  if (!existingTraining.success || existingTraining.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Data pelatihan tidak ditemukan atau Anda tidak memiliki akses'
    })
  }

  // Update training data (without sertifikat column for now)
  const updateQuery = `
    UPDATE training_data SET
      tema = ?, penyelenggara = ?, tanggal_mulai = ?, tanggal_selesai = ?,
      keterangan = ?
    WHERE id = ?
  `

  const updateParams = [
    tema,
    penyelenggara,
    tanggalMulai,
    tanggalSelesai,
    keterangan || null,
    id
  ]

  const result = await executeQuery(updateQuery, updateParams)

  if (!result.success) {
    console.error('Update training error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data pelatihan'
    })
  }

  console.log('✅ Training data updated in database')

  res.status(200).json({
    success: true,
    message: 'Data pelatihan berhasil diperbarui'
  })
}

// DELETE - Delete training data
async function deleteTrainingData(req, res) {
  const { id, userId } = req.query

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pelatihan diperlukan' 
    })
  }

  // Check if training exists and user has permission
  let checkQuery = 'SELECT user_id FROM training_data WHERE id = ?'
  let checkParams = [id]

  // If not admin, ensure user can only delete their own data
  if (userId) {
    checkQuery += ' AND user_id = ?'
    checkParams.push(userId)
  }

  const existingTraining = await executeQuery(checkQuery, checkParams)

  if (!existingTraining.success || existingTraining.data.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Data pelatihan tidak ditemukan atau Anda tidak memiliki akses'
    })
  }

  // Delete training data
  const deleteQuery = 'DELETE FROM training_data WHERE id = ?'
  const result = await executeQuery(deleteQuery, [id])

  if (!result.success) {
    console.error('Delete training error:', result.error)
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data pelatihan'
    })
  }

  console.log('✅ Training data deleted from database')

  res.status(200).json({
    success: true,
    message: 'Data pelatihan berhasil dihapus'
  })
}
