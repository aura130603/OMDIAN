// Simple registration with dummy data (no database)

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

    // Simple validation for demo (no database check)
    console.log('✅ Registration attempt with dummy data:', username)

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun demo yang tersedia.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}
