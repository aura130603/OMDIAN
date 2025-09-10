// Dummy users data for development without database
const DUMMY_USERS = [
  {
    id: 1,
    username: 'admin1',
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
    role: 'admin',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    username: 'pegawai1',
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
    role: 'pegawai',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 3,
    username: 'pegawai2',
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
    role: 'pegawai',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 4,
    username: 'pegawai3',
    nip: '198205051999031004',
    nama: 'Rini Astuti',
    pangkat: 'Penata Muda',
    golongan: 'III/a',
    jabatan: 'Analis Statistik',
    pendidikan: 'S1 Ekonomi',
    nilai_skp: 88,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Belum',
    diklat_fungsional: 'Belum',
    role: 'pegawai',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 5,
    username: 'pegawai4',
    nip: '199003152015031005',
    nama: 'Andi Saputra',
    pangkat: 'Pengatur Tk. I',
    golongan: 'II/d',
    jabatan: 'Pengolah Data',
    pendidikan: 'D3 Statistik',
    nilai_skp: 80,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Belum',
    diklat_fungsional: 'Belum',
    role: 'pegawai',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 6,
    username: 'kepala1',
    nip: '196010051985031001',
    nama: 'Dr. Soekarno Wijaya, M.Si',
    pangkat: 'Pembina Utama Muda',
    golongan: 'IV/c',
    jabatan: 'Kepala BPS Kabupaten Kudus',
    pendidikan: 'S3 Statistik',
    nilai_skp: 98,
    hukuman_disiplin: 'Tidak Pernah',
    diklat_pim: 'Sudah',
    diklat_fungsional: 'Sudah',
    role: 'kepala_bps',
    status: 'aktif',
    created_at: '2024-01-01 10:00:00'
  }
];

export default function handler(req, res) {
  const { role } = req.query

  if (req.method === 'GET') {
    // Only admin can access user list
    if (role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak' 
      })
    }

    const mappedUsers = DUMMY_USERS.map(user => ({
      id: user.id,
      username: user.username,
      nip: user.nip,
      nama: user.nama,
      pangkat: user.pangkat,
      golongan: user.golongan,
      jabatan: user.jabatan,
      pendidikan: user.pendidikan,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    }))

    console.log('✅ Users data retrieved with dummy data')

    res.status(200).json({
      success: true,
      data: mappedUsers
    })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
