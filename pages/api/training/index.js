import { executeQuery } from '../../../lib/db'

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

  let query, params

  if (role === 'admin') {
    // Admin can see all training data
    query = `
      SELECT 
        t.id,
        t.user_id,
        t.tema,
        t.penyelenggara,
        t.tanggal_mulai,
        t.tanggal_selesai,
        t.keterangan,
        t.sertifikat_filename,
        t.status,
        t.created_at,
        u.nama as pegawai_nama,
        u.nip as pegawai_nip
      FROM training_data t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.tanggal_mulai DESC
    `
    params = []
  } else {
    // Regular users can only see their own data
    query = `
      SELECT 
        id,
        user_id,
        tema,
        penyelenggara,
        tanggal_mulai,
        tanggal_selesai,
        keterangan,
        sertifikat_filename,
        status,
        created_at
      FROM training_data
      WHERE user_id = ?
      ORDER BY tanggal_mulai DESC
    `
    params = [userId]
  }

  const result = await executeQuery(query, params)

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data pelatihan' 
    })
  }

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

  const query = `
    INSERT INTO training_data (
      user_id, tema, penyelenggara, tanggal_mulai, tanggal_selesai, keterangan
    ) VALUES (?, ?, ?, ?, ?, ?)
  `

  const result = await executeQuery(query, [
    userId,
    tema,
    penyelenggara,
    tanggalMulai,
    tanggalSelesai,
    keterangan || null
  ])

  if (!result.success) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menyimpan data pelatihan' 
    })
  }

  // Log activity
  const logQuery = `
    INSERT INTO activity_logs (user_id, activity_type, description)
    VALUES (?, 'training_add', ?)
  `
  
  await executeQuery(logQuery, [
    userId,
    `Menambah data pelatihan: ${tema}`
  ])

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
