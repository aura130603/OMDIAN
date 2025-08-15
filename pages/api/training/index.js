import { executeQuery } from '../../../lib/db'
import {
  getFallbackTrainingData,
  addFallbackTrainingData,
  updateFallbackTrainingData,
  deleteFallbackTrainingData
} from './fallback'

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

  // Use dummy data only (no database connection)
  const fallbackData = getFallbackTrainingData(userId, role)

  console.log('✅ Training data retrieved with dummy data')

  res.status(200).json({
    success: true,
    data: fallbackData
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
    keterangan 
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

  // Use dummy data (no database)
  const result = addFallbackTrainingData({
    user_id: userId,
    tema,
    penyelenggara,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    keterangan
  })

  console.log('✅ Training data added with dummy data')

  res.status(201).json({
    success: true,
    message: 'Data pelatihan berhasil ditambahkan',
    data: result.data
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
    keterangan 
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

  const query = `
    UPDATE training_data 
    SET tema = ?, penyelenggara = ?, tanggal_mulai = ?, tanggal_selesai = ?, keterangan = ?
    WHERE id = ?
  `

  const result = await executeQuery(query, [
    tema,
    penyelenggara,
    tanggalMulai,
    tanggalSelesai,
    keterangan || null,
    id
  ])

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memperbarui data pelatihan' 
    })
  }

  if (result.data.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Data pelatihan tidak ditemukan' 
    })
  }

  res.status(200).json({
    success: true,
    message: 'Data pelatihan berhasil diperbarui'
  })
}

// DELETE - Delete training data
async function deleteTrainingData(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pelatihan diperlukan' 
    })
  }

  const query = 'DELETE FROM training_data WHERE id = ?'
  const result = await executeQuery(query, [id])

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus data pelatihan' 
    })
  }

  if (result.data.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Data pelatihan tidak ditemukan' 
    })
  }

  res.status(200).json({
    success: true,
    message: 'Data pelatihan berhasil dihapus'
  })
}
