import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'
import TrainingModal from '../components/TrainingModal'
import YearFilter from '../components/YearFilter'
import { viewCertificate } from '../utils/exportUtils'
import Pagination from '../components/Pagination'

export default function TrainingHistory() {
  const { user, loading, getUserTrainingData, getAllTrainingData, addTrainingData, updateTrainingData, deleteTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [trainingData, setTrainingData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTraining, setEditingTraining] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const loadTrainingData = async () => {
        try {
          if (user.role === 'admin') {
            const data = await getAllTrainingData(selectedYear)
            setTrainingData(data)
          } else if (user.role === 'kepala_bps') {
            // Kepala BPS can manage their own training data like employees
            const data = await getUserTrainingData(user.id, selectedYear)
            setTrainingData(data)
          } else {
            const data = await getUserTrainingData(user.id, selectedYear)
            setTrainingData(data)
          }
        } catch (error) {
          console.error('Error loading training data:', error)
          setTrainingData([])
        }
      }
      loadTrainingData()
    }
  }, [user, selectedYear, getUserTrainingData, getAllTrainingData])

  useEffect(() => { setPage(1) }, [searchTerm, selectedYear])

  const handleAddTraining = () => {
    setEditingTraining(null)
    setShowModal(true)
  }

  const handleEditTraining = (training) => {
    setEditingTraining(training)
    setShowModal(true)
  }

  const handleDeleteTraining = async (trainingId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelatihan ini?')) {
      const result = await deleteTrainingData(trainingId)
      if (result.success) {
        if (user.role === 'admin') {
          const updatedData = await getAllTrainingData(selectedYear)
          setTrainingData(updatedData)
        } else {
          const updatedData = await getUserTrainingData(user.id, selectedYear)
          setTrainingData(updatedData)
        }
      }
    }
  }

  const handleSaveTraining = async (formData) => {
    if (editingTraining) {
      const result = await updateTrainingData(editingTraining.id, formData)
      if (result.success) {
        if (user.role === 'admin') {
          const updatedData = await getAllTrainingData(selectedYear)
          setTrainingData(updatedData)
        } else {
          const updatedData = await getUserTrainingData(user.id, selectedYear)
          setTrainingData(updatedData)
        }
        setShowModal(false)
      }
    } else {
      const result = await addTrainingData(formData)
      if (result.success) {
        if (user.role === 'admin') {
          const updatedData = await getAllTrainingData(selectedYear)
          setTrainingData(updatedData)
        } else {
          const updatedData = await getUserTrainingData(user.id, selectedYear)
          setTrainingData(updatedData)
        }
        setShowModal(false)
      }
    }
  }

  const filteredTrainingData = trainingData.filter(training => {
    if (user.role === 'admin') {
      return training.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
             training.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (training.pegawaiNama && training.pegawaiNama.toLowerCase().includes(searchTerm.toLowerCase()))
    } else {
      return training.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
             training.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase())
    }
  })

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary-darkest)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '20px' }}>OMDIAN</h1>
          <p>Memuat data pelatihan...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div className="nav-actions">
              <button
                onClick={() => router.push('/dashboard')}
                className="nav-back-button"
                aria-label="Kembali"
                title="Kembali"
              >
                <svg className="nav-back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">Kembali</span>
              </button>
              <h1 className="dashboard-title">Riwayat Diklat/Workshop/Seminar</h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h2 className="card-title">
                    {user.role === 'admin' ? 'Semua Data Pelatihan' :
                     user.role === 'kepala_bps' ? 'Riwayat Pelatihan Kepala BPS' :
                     'Riwayat Pelatihan Anda'}
                    ({filteredTrainingData.length})
                  </h2>
                  <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                  <input
                    type="text"
                    placeholder="Cari pelatihan..."
                    className="form-input"
                    style={{ maxWidth: '300px', marginBottom: '0' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {(user.role === 'pegawai' || user.role === 'employee' || user.role === 'kepala_bps') && (
                  <button className="btn-add" onClick={handleAddTraining}>
                    + Tambah Data
                  </button>
                )}
              </div>
            </div>
            
            {filteredTrainingData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 40px', 
                color: 'var(--text-medium)' 
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                <h3 style={{ marginBottom: '10px', color: 'var(--primary-darkest)' }}>
                  {searchTerm ? 'Tidak ada data yang sesuai' : 'Belum ada data pelatihan'}
                </h3>
                <p>
                  {searchTerm 
                    ? 'Coba ubah kata kunci pencarian Anda'
                    : user.role === 'admin' 
                      ? 'Data pelatihan akan muncul di sini ketika pegawai mulai menginput data'
                      : 'Klik "Tambah Data" untuk menambah riwayat pelatihan Anda'
                  }
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="training-table">
                  <thead>
                    <tr>
                      {user.role === 'admin' && <th>Pegawai</th>}
                      <th>Tema Pelatihan</th>
                      <th>Penyelenggara</th>
                      <th>Tanggal Mulai</th>
                      <th>Tanggal Selesai</th>
                      <th>Jam Pelajaran</th>
                      <th>Sertifikat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrainingData
                      .slice((page - 1) * pageSize, page * pageSize)
                      .map((training) => (
                      <tr key={training.id}>
                        {user.role === 'admin' && (
                          <td>
                            <strong>{training.pegawaiNama || 'Unknown'}</strong><br />
                            <small style={{ color: 'var(--text-medium)' }}>
                              {training.pegawaiNIP || 'Unknown'}
                            </small>
                          </td>
                        )}
                        <td>
                          <strong>{training.tema}</strong>
                        </td>
                        <td>{training.penyelenggara}</td>
                        <td>{formatDate(training.tanggalMulai)}</td>
                        <td>{formatDate(training.tanggalSelesai)}</td>
                        <td>
                          <span style={{ fontWeight: 'bold' }}>
                            {training.keterangan ? `${training.keterangan} jam` : '-'}
                          </span>
                        </td>
                        <td>
                          {training.sertifikat ? (
                            <button
                              className="btn btn-small btn-secondary"
                              onClick={() => viewCertificate(training.sertifikat)}
                              title="Lihat Sertifikat"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📄 Lihat
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-medium)' }}>
                              Belum upload
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {(user.role === 'pegawai' || user.role === 'employee' || user.role === 'kepala_bps') ? (
                              <button
                                className="btn btn-small btn-secondary"
                                onClick={() => handleEditTraining(training)}
                              >
                                Edit
                              </button>
                            ) : (
                              <button 
                                className="btn btn-small"
                                style={{ 
                                  backgroundColor: 'var(--error)',
                                  color: 'var(--white)',
                                  fontSize: '11px'
                                }}
                                onClick={() => handleDeleteTraining(training.id)}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div>
                  <Pagination
                    currentPage={page}
                    totalItems={filteredTrainingData.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <TrainingModal
          training={editingTraining}
          onSave={handleSaveTraining}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
