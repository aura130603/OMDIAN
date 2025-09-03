import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import EmployeeModal from './EmployeeModal'
import {
  exportEmployeeReport,
  exportTrainingReport,
  exportMonitoringReport,
  exportToPDF,
  generateSummaryStats
} from '../utils/exportUtils'

export default function EnhancedAdminDashboard({ user }) {
  const { 
    logout, 
    getAllUsers, 
    getAllTrainingData, 
    deleteTrainingData,
    addUser,
    updateUser,
    deleteUser
  } = useContext(AuthContext)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    pangkat: '',
    golongan: '',
    periode: '',
    penyelenggara: '',
    status: 'all' // all, complete, incomplete
  })

  useEffect(() => {
    if (user && user.role === 'admin') {
      const loadData = async () => {
        try {
          const users = await getAllUsers()
          const training = await getAllTrainingData()
          setAllUsers(users)
          setAllTraining(training)
        } catch (error) {
          console.error('Error loading admin data:', error)
          setAllUsers([])
          setAllTraining([])
        }
      }
      loadData()
    }
  }, [user, getAllUsers, getAllTrainingData])

  const handleDeleteTraining = async (trainingId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pelatihan ini?')) {
      const result = await deleteTrainingData(trainingId)
      if (result.success) {
        const updatedTraining = await getAllTrainingData()
        setAllTraining(updatedTraining)
      }
    }
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowEmployeeModal(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setShowEmployeeModal(true)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
      const result = await deleteUser(employeeId)
      if (result.success) {
        const updatedUsers = await getAllUsers()
        setAllUsers(updatedUsers)
      }
    }
  }

  const handleSaveEmployee = async (employeeData) => {
    if (editingEmployee) {
      const result = await updateUser(editingEmployee.id, employeeData)
      if (result.success) {
        const updatedUsers = await getAllUsers()
        setAllUsers(updatedUsers)
        setShowEmployeeModal(false)
      }
    } else {
      const result = await addUser(employeeData)
      if (result.success) {
        const updatedUsers = await getAllUsers()
        setAllUsers(updatedUsers)
        setShowEmployeeModal(false)
      }
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
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

  // Get current year for monitoring
  const currentYear = new Date().getFullYear()

  // Filter functions
  const getFilteredEmployees = () => {
    return allUsers.filter(employee => {
      const searchMatch = 
        employee.nama.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.nip.includes(filters.search) ||
        employee.jabatan.toLowerCase().includes(filters.search.toLowerCase())

      const pangkatMatch = !filters.pangkat || employee.pangkat === filters.pangkat
      const golonganMatch = !filters.golongan || employee.golongan === filters.golongan

      let statusMatch = true
      if (filters.status !== 'all') {
        const hasCurrentYearTraining = allTraining.some(training => {
          const year = new Date(training.tanggalMulai).getFullYear()
          return training.userId === employee.id && year === currentYear
        })
        statusMatch = filters.status === 'complete' ? hasCurrentYearTraining : !hasCurrentYearTraining
      }

      return searchMatch && pangkatMatch && golonganMatch && statusMatch
    })
  }

  const getFilteredTraining = () => {
    return allTraining.filter(training => {
      const searchMatch = 
        training.tema.toLowerCase().includes(filters.search.toLowerCase()) ||
        training.penyelenggara.toLowerCase().includes(filters.search.toLowerCase()) ||
        training.pegawaiNama.toLowerCase().includes(filters.search.toLowerCase())

      const penyelenggaraMatch = !filters.penyelenggara || 
        training.penyelenggara.toLowerCase().includes(filters.penyelenggara.toLowerCase())

      let periodeMatch = true
      if (filters.periode) {
        const year = new Date(training.tanggalMulai).getFullYear()
        periodeMatch = year.toString() === filters.periode
      }

      return searchMatch && penyelenggaraMatch && periodeMatch
    })
  }

  const getTrainingStats = () => {
    const thisYearTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    const employeesWithTraining = new Set(
      thisYearTraining.map(t => t.userId)
    ).size

    const employeesWithoutTraining = allUsers.length - employeesWithTraining

    return {
      total: allTraining.length,
      thisYear: thisYearTraining.length,
      withCertificate: allTraining.filter(t => t.sertifikat).length,
      uniqueOrganizers: [...new Set(allTraining.map(t => t.penyelenggara))].length,
      employeesWithTraining,
      employeesWithoutTraining,
      completionRate: allUsers.length > 0 ? ((employeesWithTraining / allUsers.length) * 100).toFixed(1) : 0
    }
  }

  const handleExportEmployeeExcel = () => {
    exportEmployeeReport(allUsers, allTraining)
  }

  const handleExportTrainingExcel = () => {
    exportTrainingReport(allTraining)
  }

  const handleExportMonitoringExcel = () => {
    exportMonitoringReport(allUsers, allTraining)
  }

  const handleExportPDF = (type) => {
    const title = type === 'employee' ? 'Laporan Data Pegawai' :
                  type === 'training' ? 'Laporan Data Pelatihan' :
                  'Laporan Monitoring Kompetensi'
    exportToPDF(title, [])
  }

  const filteredEmployees = getFilteredEmployees()
  const filteredTraining = getFilteredTraining()
  const stats = getTrainingStats()
  
  // Get unique values for filter options
  const uniquePangkat = [...new Set(allUsers.map(u => u.pangkat))].sort()
  const uniqueGolongan = [...new Set(allUsers.map(u => u.golongan))].sort()
  const uniquePenyelenggara = [...new Set(allTraining.map(t => t.penyelenggara))].sort()
  const uniqueYears = [...new Set(allTraining.map(t => new Date(t.tanggalMulai).getFullYear()))].sort((a, b) => b - a)

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
                Kelola Pegawai
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
              <button
                className={`btn btn-secondary ${activeTab === 'monitoring' ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: '0',
                  marginBottom: '-1px',
                  borderBottom: activeTab === 'monitoring' ? '2px solid var(--primary-dark)' : 'none'
                }}
                onClick={() => setActiveTab('monitoring')}
              >
                Monitoring
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="card-title">Statistik Pengembangan Kompetensi</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleExportEmployeeExcel}>
                      📊 Export Data Pegawai
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExportPDF('overview')}>
                      📄 Export PDF
                    </button>
                  </div>
                </div>
                
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
                    <span className="profile-label">Pelatihan Tahun {currentYear}</span>
                    <span className="profile-value">{stats.thisYear} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Dengan Sertifikat</span>
                    <span className="profile-value">{stats.withCertificate} dari {stats.total}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Pegawai Sudah Isi</span>
                    <span className="profile-value">{stats.employeesWithTraining} dari {allUsers.length}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Tingkat Kelengkapan</span>
                    <span className="profile-value">
                      <span className={`status-badge ${stats.completionRate >= 80 ? 'status-active' : 'status-inactive'}`}>
                        {stats.completionRate}%
                      </span>
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ marginBottom: '15px', color: 'var(--primary-darkest)' }}>
                    Ringkasan Pegawai Tahun {currentYear}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="training-table">
                      <thead>
                        <tr>
                          <th>Nama Pegawai</th>
                          <th>NIP</th>
                          <th>Jabatan</th>
                          <th>Total Pelatihan</th>
                          <th>Pelatihan {currentYear}</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((pegawai) => {
                          const trainingCount = allTraining.filter(t => t.userId === pegawai.id).length
                          const thisYearCount = allTraining.filter(t => {
                            const year = new Date(t.tanggalMulai).getFullYear()
                            return t.userId === pegawai.id && year === currentYear
                          }).length

                          return (
                            <tr key={pegawai.id}>
                              <td><strong>{pegawai.nama}</strong></td>
                              <td>{pegawai.nip}</td>
                              <td>{pegawai.jabatan}</td>
                              <td>{trainingCount} kegiatan</td>
                              <td>{thisYearCount} kegiatan</td>
                              <td>
                                <span className={`status-badge ${thisYearCount > 0 ? 'status-active' : 'status-inactive'}`}>
                                  {thisYearCount > 0 ? 'Lengkap' : 'Belum Lengkap'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Management Tab */}
            {activeTab === 'employees' && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 className="card-title">Kelola Data Pegawai ({filteredEmployees.length})</h2>
                  <button className="btn-add" onClick={handleAddEmployee}>
                    + Tambah Pegawai
                  </button>
                </div>

                {/* Filters */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: 'var(--light-gray)',
                  borderRadius: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Cari nama, NIP, jabatan..."
                    className="form-input"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <select
                    className="form-input"
                    value={filters.pangkat}
                    onChange={(e) => handleFilterChange('pangkat', e.target.value)}
                  >
                    <option value="">Semua Pangkat</option>
                    {uniquePangkat.map(pangkat => (
                      <option key={pangkat} value={pangkat}>{pangkat}</option>
                    ))}
                  </select>
                  <select
                    className="form-input"
                    value={filters.golongan}
                    onChange={(e) => handleFilterChange('golongan', e.target.value)}
                  >
                    <option value="">Semua Golongan</option>
                    {uniqueGolongan.map(golongan => (
                      <option key={golongan} value={golongan}>{golongan}</option>
                    ))}
                  </select>
                  <select
                    className="form-input"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="complete">Sudah Lengkap {currentYear}</option>
                    <option value="incomplete">Belum Lengkap {currentYear}</option>
                  </select>
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
                        <th>Status {currentYear}</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((pegawai) => {
                        const thisYearCount = allTraining.filter(t => {
                          const year = new Date(t.tanggalMulai).getFullYear()
                          return t.userId === pegawai.id && year === currentYear
                        }).length

                        return (
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
                              <span className={`status-badge ${thisYearCount > 0 ? 'status-active' : 'status-inactive'}`}>
                                {thisYearCount > 0 ? `${thisYearCount} pelatihan` : 'Belum ada'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                  className="btn btn-small btn-secondary"
                                  onClick={() => handleEditEmployee(pegawai)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-small"
                                  style={{ 
                                    backgroundColor: 'var(--error)',
                                    color: 'var(--white)',
                                    fontSize: '11px'
                                  }}
                                  onClick={() => handleDeleteEmployee(pegawai.id)}
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Training Data Tab */}
            {activeTab === 'training' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 className="card-title">Data Pelatihan ({filteredTraining.length})</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleExportTrainingExcel}>
                      📊 Export Data Pelatihan
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExportPDF('training')}>
                      📄 Export PDF
                    </button>
                  </div>
                </div>

                {/* Training Filters */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: 'var(--light-gray)',
                  borderRadius: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Cari tema, pegawai..."
                    className="form-input"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <select
                    className="form-input"
                    value={filters.periode}
                    onChange={(e) => handleFilterChange('periode', e.target.value)}
                  >
                    <option value="">Semua Periode</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Filter penyelenggara..."
                    className="form-input"
                    value={filters.penyelenggara}
                    onChange={(e) => handleFilterChange('penyelenggara', e.target.value)}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="training-table">
                    <thead>
                      <tr>
                        <th>Pegawai</th>
                        <th>Tema Pelatihan</th>
                        <th>Penyelenggara</th>
                        <th>Periode</th>
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
                                fontWeight: 'bold'
                              }}>
                                {training.keterangan} jam pelajaran
                              </div>
                            )}
                          </td>
                          <td>{training.penyelenggara}</td>
                          <td>
                            {formatDate(training.tanggalMulai)} - {formatDate(training.tanggalSelesai)}
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
                                Belum upload
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

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="card-title">Monitoring Kelengkapan Data Tahun {currentYear}</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleExportMonitoringExcel}>
                      📊 Export Monitoring
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleExportPDF('monitoring')}>
                      📄 Export PDF
                    </button>
                  </div>
                </div>
                
                <div className="profile-grid" style={{ marginBottom: '30px' }}>
                  <div className="profile-item">
                    <span className="profile-label">Total Pegawai</span>
                    <span className="profile-value">{allUsers.length} orang</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Sudah Mengisi</span>
                    <span className="profile-value">
                      <span className="status-badge status-active">
                        {stats.employeesWithTraining} orang
                      </span>
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Belum Mengisi</span>
                    <span className="profile-value">
                      <span className="status-badge status-inactive">
                        {stats.employeesWithoutTraining} orang
                      </span>
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Persentase Kelengkapan</span>
                    <span className="profile-value">
                      <span className={`status-badge ${stats.completionRate >= 80 ? 'status-active' : 'status-inactive'}`}>
                        {stats.completionRate}%
                      </span>
                    </span>
                  </div>
                </div>

                <h3 style={{ marginBottom: '15px', color: 'var(--primary-darkest)' }}>
                  Pegawai Belum Mengisi Data Tahun {currentYear}
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="training-table">
                    <thead>
                      <tr>
                        <th>NIP</th>
                        <th>Nama</th>
                        <th>Jabatan</th>
                        <th>Pangkat/Gol</th>
                        <th>Total Pelatihan</th>
                        <th>Pelatihan Terakhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.filter(pegawai => {
                        const thisYearCount = allTraining.filter(t => {
                          const year = new Date(t.tanggalMulai).getFullYear()
                          return t.userId === pegawai.id && year === currentYear
                        }).length
                        return thisYearCount === 0
                      }).map((pegawai) => {
                        const allUserTraining = allTraining.filter(t => t.userId === pegawai.id)
                        const lastTraining = allUserTraining.sort((a, b) => 
                          new Date(b.tanggalMulai) - new Date(a.tanggalMulai)
                        )[0]

                        return (
                          <tr key={pegawai.id}>
                            <td>{pegawai.nip}</td>
                            <td><strong>{pegawai.nama}</strong></td>
                            <td>{pegawai.jabatan}</td>
                            <td>
                              {pegawai.pangkat}<br />
                              <small style={{ color: 'var(--text-medium)' }}>
                                {pegawai.golongan}
                              </small>
                            </td>
                            <td>{allUserTraining.length} kegiatan</td>
                            <td>
                              {lastTraining ? (
                                <>
                                  {lastTraining.tema}<br />
                                  <small style={{ color: 'var(--text-medium)' }}>
                                    {formatDate(lastTraining.tanggalMulai)}
                                  </small>
                                </>
                              ) : (
                                <span style={{ color: 'var(--text-medium)' }}>
                                  Belum ada data
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEmployeeModal && (
        <EmployeeModal
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onClose={() => setShowEmployeeModal(false)}
        />
      )}
    </>
  )
}
