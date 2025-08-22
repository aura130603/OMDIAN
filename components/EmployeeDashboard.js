import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import TrainingModal from './TrainingModal'
import ProfileDropdown from './ProfileDropdown'
import YearFilter from './YearFilter'

export default function EmployeeDashboard({ user }) {
  const { logout, getUserTrainingData, addTrainingData, updateTrainingData } = useContext(AuthContext)
  const [trainingData, setTrainingData] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTraining, setEditingTraining] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)

  useEffect(() => {
    if (user) {
      const loadTrainingData = async () => {
        try {
          const data = await getUserTrainingData(user.id, selectedYear)
          setTrainingData(data)
        } catch (error) {
          console.error('Error loading training data:', error)
          setTrainingData([])
        }
      }
      loadTrainingData()
    }
  }, [user, selectedYear, getUserTrainingData])

  const handleAddTraining = () => {
    setEditingTraining(null)
    setShowModal(true)
  }

  const handleEditTraining = (training) => {
    setEditingTraining(training)
    setShowModal(true)
  }

  const handleSaveTraining = async (formData) => {
    if (editingTraining) {
      const result = await updateTrainingData(editingTraining.id, formData)
      if (result.success) {
        const updatedData = await getUserTrainingData(user.id, selectedYear)
        setTrainingData(updatedData)
        setShowModal(false)
      }
    } else {
      const result = await addTrainingData(formData)
      if (result.success) {
        const updatedData = await getUserTrainingData(user.id, selectedYear)
        setTrainingData(updatedData)
        setShowModal(false)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <h1 className="dashboard-title">OMDIAN - Dashboard Pegawai</h1>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">

          {/* Training History Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h2 className="card-title">Riwayat Diklat/Workshop/Seminar</h2>
                  <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>
                <button className="btn-add" onClick={handleAddTraining}>
                  + Tambah Data
                </button>
              </div>
            </div>
            
            {trainingData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: 'var(--text-medium)' 
              }}>
                Belum ada data pelatihan. Klik "Tambah Data" untuk menambah riwayat pelatihan.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="training-table">
                  <thead>
                    <tr>
                      <th>Tema Diklat</th>
                      <th>Penyelenggara</th>
                      <th>Tanggal Mulai</th>
                      <th>Tanggal Selesai</th>
                      <th>Keterangan</th>
                      <th>Sertifikat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.map((training) => (
                      <tr key={training.id}>
                        <td>
                          <strong>{training.tema}</strong>
                        </td>
                        <td>{training.penyelenggara}</td>
                        <td>{formatDate(training.tanggalMulai)}</td>
                        <td>{formatDate(training.tanggalSelesai)}</td>
                        <td>
                          <div style={{ 
                            maxWidth: '200px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={training.keterangan}>
                            {training.keterangan}
                          </div>
                        </td>
                        <td>
                          {training.sertifikat ? (
                            <a 
                              href="#" 
                              className="auth-link"
                              title="Lihat Sertifikat"
                            >
                              📄 Lihat
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-medium)' }}>
                              Belum diunggah
                            </span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-small btn-secondary"
                            onClick={() => handleEditTraining(training)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Statistics Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Statistik Pengembangan Kompetensi</h2>
            </div>
            <div className="profile-grid">
              <div className="profile-item">
                <span className="profile-label">Total Pelatihan</span>
                <span className="profile-value">{trainingData.length} kegiatan</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Tahun Ini</span>
                <span className="profile-value">
                  {trainingData.filter(t => {
                    const year = new Date(t.tanggalMulai).getFullYear()
                    return year === new Date().getFullYear()
                  }).length} kegiatan
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Sertifikat Terupload</span>
                <span className="profile-value">
                  {trainingData.filter(t => t.sertifikat).length} dari {trainingData.length}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Status Kompetensi</span>
                <span className="profile-value">
                  <span className="status-badge status-active">
                    Aktif
                  </span>
                </span>
              </div>
            </div>
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
    </>
  )
}
