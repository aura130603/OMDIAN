import bcrypt from 'bcryptjs'
import { executeQuery } from '../../../lib/db'

// Fallback dummy data in case database is not available
const DUMMY_USERS = [
  {
    id: 1,
    username: 'admin1',
    password: 'admin123',
    nip: '196512101989031003',
    nama: 'Drs. Ahmad Wijaya',
    pangkat: 'Pembina',
    golongan: 'IV/a',
    jabatan: 'Kepala Subbagian Umum',
    pendidikan: 'S1 Administrasi Negara',
    nilai_skp: 95,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Sudah',
    diklat_fungsional: 'Sudah',
    role: 'admin'
  },
  {
    id: 2,
    username: 'pegawai1',
    password: 'password123',
    nip: '196801011992031001',
    nama: 'Budi Santoso',
    pangkat: 'Penata Muda Tk. I',
    golongan: 'III/b',
    jabatan: 'Statistisi Ahli Pertama',
    pendidikan: 'S1 Statistik',
    nilai_skp: 85,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Belum',
    diklat_fungsional: 'Sudah',
    role: 'pegawai'
  },
  {
    id: 3,
    username: 'pegawai2',
    password: 'password123',
    nip: '197505151998032002',
    nama: 'Siti Aminah',
    pangkat: 'Penata',
    golongan: 'III/c',
    jabatan: 'Statistisi Ahli Muda',
    pendidikan: 'S1 Matematika',
    nilai_skp: 92,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Sudah',
    diklat_fungsional: 'Sudah',
    role: 'pegawai'
  }
]

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

    // Use dummy data authentication (no database connection)
    const dummyUser = DUMMY_USERS.find(u => u.username === username && u.password === password)

    if (!dummyUser) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = dummyUser

    console.log('✅ Login successful with dummy data:', userWithoutPassword.username)

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
