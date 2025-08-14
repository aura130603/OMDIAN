import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'

export default function AdminDashboard({ user }) {
  const { logout, getAllUsers, getAllTrainingData, deleteTrainingData } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && user.role === 'admin') {
      const users = getAllUsers()
      const training = getAllTrainingData()
      setAllUsers(users)
      setAllTraining(training)
    }
  }, [user, getAllUsers, getAllTrainingData])

  const handleDeleteTraining = async (trainingId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelatihan ini?')) {
      const result = await deleteTrainingData(trainingId)
      if (result.success) {
        const updatedTraining = getAllTrainingData()
        setAllTraining(updatedTraining)
      }
    }
  }

  const filteredUsers = allUsers.filter(u => 
    u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nip.includes(searchTerm) ||
    u.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTraining = allTraining.filter(t => 
    t.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.pegawaiNama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTrainingStats = () => {
    const currentYear = new Date().getFullYear()
    const thisYearTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    return {
      total: allTraining.length,
      thisYear: thisYearTraining.length,
      withCertificate: allTraining.filter(t => t.sertifikat).length,
      uniqueOrganizers: [...new Set(allTraining.map(t => t.penyelenggara))].length
    }
  }

  const stats = getTrainingStats()

  return (
    <>
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <h1 className="dashboard-title">OMDIAN - Dashboard Admin</h1>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Navigation Tabs */}
          <div className="card">
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}>
              <button
                className={`btn btn-secondary ${activeTab === 'overview' ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: '0',
                  marginBottom: '-1px',
                  borderBottom: activeTab === 'overview' ? '2px solid var(--primary-dark)' : 'none'
                }}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`btn btn-secondary ${activeTab === 'employees' ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: '0',
                  marginBottom: '-1px',
                  borderBottom: activeTab === 'employees' ? '2px solid var(--primary-dark)' : 'none'
                }}
                onClick={() => setActiveTab('employees')}
              >
                Data Pegawai
              </button>
              <button
                className={`btn btn-secondary ${activeTab === 'training' ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: '0',
                  marginBottom: '-1px',
                  borderBottom: activeTab === 'training' ? '2px solid var(--primary-dark)' : 'none'
                }}
                onClick={() => setActiveTab('training')}
              >
                Data Pelatihan
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="card-title">Statistik Pengembangan Kompetensi</h2>
                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">Total Pegawai</span>
                    <span className="profile-value">{allUsers.length} orang</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Total Pelatihan</span>
                    <span className="profile-value">{stats.total} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Pelatihan Tahun Ini</span>
                    <span className="profile-value">{stats.thisYear} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Dengan Sertifikat</span>
                    <span className="profile-value">{stats.withCertificate} dari {stats.total}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Penyelenggara Unik</span>
                    <span className="profile-value">{stats.uniqueOrganizers} lembaga</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Rata-rata per Pegawai</span>
                    <span className="profile-value">
                      {allUsers.length > 0 ? (stats.total / allUsers.length).toFixed(1) : 0} pelatihan
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ marginBottom: '15px', color: 'var(--primary-darkest)' }}>
                    Ringkasan Pegawai
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="training-table">
                      <thead>
                        <tr>
                          <th>Nama Pegawai</th>
                          <th>NIP</th>
                          <th>Jabatan</th>
                          <th>Jumlah Pelatihan</th>
                          <th>Pelatihan Tahun Ini</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((pegawai) => {
                          const trainingCount = allTraining.filter(t => t.pegawaiId === pegawai.id).length
                          const thisYearCount = allTraining.filter(t => {
                            const year = new Date(t.tanggalMulai).getFullYear()
                            return t.pegawaiId === pegawai.id && year === new Date().getFullYear()
                          }).length

                          return (
                            <tr key={pegawai.id}>
                              <td><strong>{pegawai.nama}</strong></td>
                              <td>{pegawai.nip}</td>
                              <td>{pegawai.jabatan}</td>
                              <td>{trainingCount} kegiatan</td>
                              <td>{thisYearCount} kegiatan</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 className="card-title">Data Pegawai ({filteredUsers.length})</h2>
                  <input
                    type="text"
                    placeholder="Cari nama, NIP, atau jabatan..."
                    className="form-input"
                    style={{ maxWidth: '300px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="training-table">
                    <thead>
                      <tr>
                        <th>NIP</th>
                        <th>Nama</th>
                        <th>Pangkat/Gol</th>
                        <th>Jabatan</th>
                        <th>Pendidikan</th>
                        <th>SKP</th>
                        <th>Diklat PIM</th>
                        <th>Diklat Fungsional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((pegawai) => (
                        <tr key={pegawai.id}>
                          <td>{pegawai.nip}</td>
                          <td><strong>{pegawai.nama}</strong></td>
                          <td>
                            {pegawai.pangkat}<br />
                            <small style={{ color: 'var(--text-medium)' }}>
                              {pegawai.golongan}
                            </small>
                          </td>
                          <td>{pegawai.jabatan}</td>
                          <td>{pegawai.pendidikan}</td>
                          <td>{pegawai.nilaiSKP || '-'}</td>
                          <td>
                            <span className={`status-badge ${pegawai.diklatPIM === 'Sudah' ? 'status-active' : 'status-inactive'}`}>
                              {pegawai.diklatPIM}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${pegawai.diklatFungsional === 'Sudah' ? 'status-active' : 'status-inactive'}`}>
                              {pegawai.diklatFungsional}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Training Tab */}
            {activeTab === 'training' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 className="card-title">Data Pelatihan ({filteredTraining.length})</h2>
                  <input
                    type="text"
                    placeholder="Cari tema, penyelenggara, atau nama pegawai..."
                    className="form-input"
                    style={{ maxWidth: '350px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="training-table">
                    <thead>
                      <tr>
                        <th>Pegawai</th>
                        <th>Tema Pelatihan</th>
                        <th>Penyelenggara</th>
                        <th>Tanggal Mulai</th>
                        <th>Tanggal Selesai</th>
                        <th>Sertifikat</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTraining.map((training) => (
                        <tr key={training.id}>
                          <td>
                            <strong>{training.pegawaiNama}</strong><br />
                            <small style={{ color: 'var(--text-medium)' }}>
                              {training.pegawaiNIP}
                            </small>
                          </td>
                          <td>
                            <strong>{training.tema}</strong>
                            {training.keterangan && (
                              <div style={{ 
                                fontSize: '12px', 
                                color: 'var(--text-medium)',
                                marginTop: '4px',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }} title={training.keterangan}>
                                {training.keterangan}
                              </div>
                            )}
                          </td>
                          <td>{training.penyelenggara}</td>
                          <td>{formatDate(training.tanggalMulai)}</td>
                          <td>{formatDate(training.tanggalSelesai)}</td>
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
                                Belum
                              </span>
                            )}
                          </td>
                          <td>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
