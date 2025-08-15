// Fallback training data for when database is not available
const DUMMY_TRAINING_DATA = [
  {
    id: 1,
    user_id: 2,
    tema: 'Pelatihan Analisis Data dengan SPSS',
    penyelenggara: 'BPS Pusat',
    tanggal_mulai: '2024-01-15',
    tanggal_selesai: '2024-01-19',
    keterangan: 'Pelatihan dasar penggunaan SPSS untuk analisis statistik',
    sertifikat_filename: 'sertifikat_spss_2024.pdf',
    status: 'selesai',
    created_at: '2024-01-15 10:00:00',
    pegawai_nama: 'Budi Santoso',
    pegawai_nip: '196801011992031001'
  },
  {
    id: 2,
    user_id: 2,
    tema: 'Workshop Sensus Penduduk 2025',
    penyelenggara: 'BPS Provinsi Jawa Tengah',
    tanggal_mulai: '2024-02-10',
    tanggal_selesai: '2024-02-12',
    keterangan: 'Persiapan pelaksanaan Sensus Penduduk 2025',
    sertifikat_filename: null,
    status: 'selesai',
    created_at: '2024-02-10 10:00:00',
    pegawai_nama: 'Budi Santoso',
    pegawai_nip: '196801011992031001'
  },
  {
    id: 3,
    user_id: 3,
    tema: 'Seminar Nasional Statistik Digital',
    penyelenggara: 'Universitas Gadjah Mada',
    tanggal_mulai: '2024-03-05',
    tanggal_selesai: '2024-03-06',
    keterangan: 'Seminar tentang transformasi digital dalam bidang statistik',
    sertifikat_filename: 'sertifikat_semnas_ugm.pdf',
    status: 'selesai',
    created_at: '2024-03-05 10:00:00',
    pegawai_nama: 'Siti Aminah',
    pegawai_nip: '197505151998032002'
  },
  {
    id: 4,
    user_id: 3,
    tema: 'Pelatihan Leadership untuk ASN',
    penyelenggara: 'LAN RI',
    tanggal_mulai: '2024-04-01',
    tanggal_selesai: '2024-04-05',
    keterangan: 'Pelatihan kepemimpinan bagi Aparatur Sipil Negara',
    sertifikat_filename: 'sertifikat_leadership_lan.pdf',
    status: 'selesai',
    created_at: '2024-04-01 10:00:00',
    pegawai_nama: 'Siti Aminah',
    pegawai_nip: '197505151998032002'
  }
]

export function getFallbackTrainingData(userId, role) {
  if (role === 'admin') {
    return DUMMY_TRAINING_DATA
  } else {
    return DUMMY_TRAINING_DATA.filter(training => training.user_id === parseInt(userId))
  }
}

export function addFallbackTrainingData(trainingData) {
  const newId = Math.max(...DUMMY_TRAINING_DATA.map(t => t.id)) + 1
  const newTraining = {
    id: newId,
    ...trainingData,
    status: 'selesai',
    created_at: new Date().toISOString(),
    pegawai_nama: 'Current User',
    pegawai_nip: 'Current NIP'
  }
  DUMMY_TRAINING_DATA.push(newTraining)
  return { success: true, data: { id: newId } }
}

export function updateFallbackTrainingData(trainingId, trainingData) {
  const index = DUMMY_TRAINING_DATA.findIndex(t => t.id === parseInt(trainingId))
  if (index !== -1) {
    DUMMY_TRAINING_DATA[index] = { ...DUMMY_TRAINING_DATA[index], ...trainingData }
    return { success: true }
  }
  return { success: false, message: 'Data tidak ditemukan' }
}

export function deleteFallbackTrainingData(trainingId) {
  const index = DUMMY_TRAINING_DATA.findIndex(t => t.id === parseInt(trainingId))
  if (index !== -1) {
    DUMMY_TRAINING_DATA.splice(index, 1)
    return { success: true }
  }
  return { success: false, message: 'Data tidak ditemukan' }
}
