import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

// Dummy data for demonstration
const DUMMY_USERS = [
  {
    id: 1,
    username: 'pegawai1',
    password: 'password123',
    role: 'pegawai',
    nip: '196801011992031001',
    nama: 'Budi Santoso',
    pangkat: 'Penata Muda Tk. I',
    golongan: 'III/b',
    jabatan: 'Statistisi Ahli Pertama',
    pendidikan: 'S1 Statistik',
    nilaiSKP: 85,
    hukumanDisiplin: 'Tidak Pernah',
    diklatPIM: 'Belum',
    diklatFungsional: 'Sudah'
  },
  {
    id: 2,
    username: 'pegawai2',
    password: 'password123',
    role: 'pegawai',
    nip: '197505151998032002',
    nama: 'Siti Aminah',
    pangkat: 'Penata',
    golongan: 'III/c',
    jabatan: 'Statistisi Ahli Muda',
    pendidikan: 'S1 Matematika',
    nilaiSKP: 92,
    hukumanDisiplin: 'Tidak Pernah',
    diklatPIM: 'Sudah',
    diklatFungsional: 'Sudah'
  },
  {
    id: 3,
    username: 'admin1',
    password: 'admin123',
    role: 'admin',
    nip: '196512101989031003',
    nama: 'Drs. Ahmad Wijaya',
    pangkat: 'Pembina',
    golongan: 'IV/a',
    jabatan: 'Kepala Subbagian Umum',
    pendidikan: 'S1 Administrasi Negara',
    nilaiSKP: 95,
    hukumanDisiplin: 'Tidak Pernah',
    diklatPIM: 'Sudah',
    diklatFungsional: 'Sudah'
  }
]

const DUMMY_TRAINING_DATA = [
  {
    id: 1,
    pegawaiId: 1,
    tema: 'Pelatihan Analisis Data dengan SPSS',
    penyelenggara: 'BPS Pusat',
    tanggalMulai: '2024-01-15',
    tanggalSelesai: '2024-01-19',
    keterangan: 'Pelatihan dasar penggunaan SPSS untuk analisis statistik',
    sertifikat: 'sertifikat_spss_2024.pdf',
    status: 'Selesai'
  },
  {
    id: 2,
    pegawaiId: 1,
    tema: 'Workshop Sensus Penduduk 2025',
    penyelenggara: 'BPS Provinsi Jawa Tengah',
    tanggalMulai: '2024-02-10',
    tanggalSelesai: '2024-02-12',
    keterangan: 'Persiapan pelaksanaan Sensus Penduduk 2025',
    sertifikat: null,
    status: 'Selesai'
  },
  {
    id: 3,
    pegawaiId: 2,
    tema: 'Seminar Nasional Statistik Digital',
    penyelenggara: 'Universitas Gadjah Mada',
    tanggalMulai: '2024-03-05',
    tanggalSelesai: '2024-03-06',
    keterangan: 'Seminar tentang transformasi digital dalam bidang statistik',
    sertifikat: 'sertifikat_semnas_ugm.pdf',
    status: 'Selesai'
  },
  {
    id: 4,
    pegawaiId: 2,
    tema: 'Pelatihan Leadership untuk ASN',
    penyelenggara: 'LAN RI',
    tanggalMulai: '2024-04-01',
    tanggalSelesai: '2024-04-05',
    keterangan: 'Pelatihan kepemimpinan bagi Aparatur Sipil Negara',
    sertifikat: 'sertifikat_leadership_lan.pdf',
    status: 'Selesai'
  }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('omdian_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const foundUser = DUMMY_USERS.find(
      u => u.username === username && u.password === password
    )

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('omdian_user', JSON.stringify(userWithoutPassword))
      return { success: true }
    } else {
      return { success: false, message: 'Username atau password salah' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('omdian_user')
  }

  const register = async (userData) => {
    // Simulate registration - in real app, this would call an API
    const newUser = {
      id: DUMMY_USERS.length + 1,
      username: userData.username,
      password: userData.password,
      role: 'pegawai',
      ...userData
    }
    
    // Check if username already exists
    const existingUser = DUMMY_USERS.find(u => u.username === userData.username)
    if (existingUser) {
      return { success: false, message: 'Username sudah digunakan' }
    }

    DUMMY_USERS.push(newUser)
    return { success: true, message: 'Registrasi berhasil' }
  }

  const getAllUsers = () => {
    if (user && user.role === 'admin') {
      return DUMMY_USERS.map(({ password, ...user }) => user)
    }
    return []
  }

  const getUserTrainingData = (userId) => {
    return DUMMY_TRAINING_DATA.filter(training => training.pegawaiId === userId)
  }

  const getAllTrainingData = () => {
    if (user && user.role === 'admin') {
      return DUMMY_TRAINING_DATA.map(training => {
        const pegawai = DUMMY_USERS.find(u => u.id === training.pegawaiId)
        return {
          ...training,
          pegawaiNama: pegawai ? pegawai.nama : 'Unknown',
          pegawaiNIP: pegawai ? pegawai.nip : 'Unknown'
        }
      })
    }
    return []
  }

  const addTrainingData = (trainingData) => {
    const newTraining = {
      id: DUMMY_TRAINING_DATA.length + 1,
      pegawaiId: user.id,
      ...trainingData,
      status: 'Selesai'
    }
    DUMMY_TRAINING_DATA.push(newTraining)
    return { success: true, data: newTraining }
  }

  const updateTrainingData = (trainingId, updatedData) => {
    const index = DUMMY_TRAINING_DATA.findIndex(t => t.id === trainingId)
    if (index !== -1) {
      DUMMY_TRAINING_DATA[index] = { ...DUMMY_TRAINING_DATA[index], ...updatedData }
      return { success: true }
    }
    return { success: false, message: 'Data tidak ditemukan' }
  }

  const deleteTrainingData = (trainingId) => {
    const index = DUMMY_TRAINING_DATA.findIndex(t => t.id === trainingId)
    if (index !== -1) {
      DUMMY_TRAINING_DATA.splice(index, 1)
      return { success: true }
    }
    return { success: false, message: 'Data tidak ditemukan' }
  }

  const addUser = async (userData) => {
    // Check if username or NIP already exists
    const existingUser = DUMMY_USERS.find(u => u.username === userData.username || u.nip === userData.nip)
    if (existingUser) {
      return { success: false, message: 'Username atau NIP sudah digunakan' }
    }

    const newUser = {
      id: Math.max(...DUMMY_USERS.map(u => u.id)) + 1,
      role: 'pegawai',
      ...userData
    }

    DUMMY_USERS.push(newUser)
    return { success: true, message: 'Pegawai berhasil ditambahkan' }
  }

  const updateUser = async (userId, userData) => {
    const index = DUMMY_USERS.findIndex(u => u.id === userId)
    if (index === -1) {
      return { success: false, message: 'Pegawai tidak ditemukan' }
    }

    // Check if username is being changed and already exists
    if (userData.username && userData.username !== DUMMY_USERS[index].username) {
      const existingUser = DUMMY_USERS.find(u => u.username === userData.username && u.id !== userId)
      if (existingUser) {
        return { success: false, message: 'Username sudah digunakan' }
      }
    }

    // Update user data (don't change NIP or role)
    const updatedData = { ...userData }
    delete updatedData.nip // NIP cannot be changed
    delete updatedData.role // Role cannot be changed by admin

    DUMMY_USERS[index] = {
      ...DUMMY_USERS[index],
      ...updatedData
    }

    return { success: true, message: 'Data pegawai berhasil diperbarui' }
  }

  const deleteUser = async (userId) => {
    // Don't allow deleting admin users
    const userToDelete = DUMMY_USERS.find(u => u.id === userId)
    if (userToDelete && userToDelete.role === 'admin') {
      return { success: false, message: 'Admin tidak dapat dihapus' }
    }

    const index = DUMMY_USERS.findIndex(u => u.id === userId)
    if (index === -1) {
      return { success: false, message: 'Pegawai tidak ditemukan' }
    }

    // Also delete all training data for this user
    for (let i = DUMMY_TRAINING_DATA.length - 1; i >= 0; i--) {
      if (DUMMY_TRAINING_DATA[i].pegawaiId === userId) {
        DUMMY_TRAINING_DATA.splice(i, 1)
      }
    }

    DUMMY_USERS.splice(index, 1)
    return { success: true, message: 'Pegawai berhasil dihapus' }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    getAllUsers,
    getUserTrainingData,
    getAllTrainingData,
    addTrainingData,
    updateTrainingData,
    deleteTrainingData,
    addUser,
    updateUser,
    deleteUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
