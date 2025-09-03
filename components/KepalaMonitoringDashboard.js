import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import YearFilter from './YearFilter'
import { exportEmployeeReport, exportTrainingReport, exportMonitoringReport, viewCertificate } from '../utils/exportUtils'
import Pagination from './Pagination'

export default function KepalaMonitoringDashboard({ user }) {
  const { getAllUsers, getAllTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)
  const [pageProgress, setPageProgress] = useState(1)
  const [pageHours, setPageHours] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (user && user.role === 'kepala_bps') {
      const loadData = async () => {
        try {
          const users = await getAllUsers()
          const training = await getAllTrainingData(selectedYear)
          setAllUsers(users)
          setAllTraining(training)
        } catch (error) {
          console.error('Error loading monitoring data:', error)
          setAllUsers([])
          setAllTraining([])
        }
      }
      loadData()
    }
  }, [user, selectedYear, getAllUsers, getAllTrainingData])

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

  const getMonitoringStats = () => {
    const currentYear = new Date().getFullYear()
    const thisYearTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    const employeesWithTraining = new Set(thisYearTraining.map(t => t.userId)).size
    const totalHours = thisYearTraining.reduce((sum, training) => {
      const hours = parseInt(training.keterangan) || 0
      return sum + hours
    }, 0)

    const avgHoursPerEmployee = employeesWithTraining > 0 ? Math.round(totalHours / employeesWithTraining) : 0

    return {
      totalEmployees: allUsers.length,
      employeesWithTraining,
      employeesWithoutTraining: allUsers.length - employeesWithTraining,
      totalTraining: thisYearTraining.length,
      totalHours,
      avgHoursPerEmployee,
      withCertificate: thisYearTraining.filter(t => t.sertifikat).length,
      completionRate: allUsers.length > 0 ? ((employeesWithTraining / allUsers.length) * 100).toFixed(1) : 0
    }
  }

  const getEmployeeTrainingProgress = () => {
    const currentYear = new Date().getFullYear()
    
    return allUsers.map(employee => {
      const employeeTraining = allTraining.filter(t => t.userId === employee.id)
      const thisYearTraining = employeeTraining.filter(t => {
        const year = new Date(t.tanggalMulai).getFullYear()
        return year === currentYear
      })
      
      const totalHours = thisYearTraining.reduce((sum, training) => {
        return sum + (parseInt(training.keterangan) || 0)
      }, 0)
      
      const withCertificate = thisYearTraining.filter(t => t.sertifikat).length

      return {
        ...employee,
        trainingCount: thisYearTraining.length,
        totalHours,
        withCertificate,
        lastTraining: thisYearTraining.length > 0 ? 
          thisYearTraining.sort((a, b) => new Date(b.tanggalMulai) - new Date(a.tanggalMulai))[0] : null
      }
    }).sort((a, b) => b.totalHours - a.totalHours) // Sort by total hours descending
  }

  const stats = getMonitoringStats()
  const employeeProgress = getEmployeeTrainingProgress()

  return (
    <>
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← Kembali
              </button>
              <h1 className="dashboard-title">OMDIAN - Monitoring Kepala BPS</h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              👥 Progress Pegawai
            </button>
            <button 
              className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`}
              onClick={() => setActiveTab('hours')}
            >
              ⏰ Monitoring Jam Pelajaran
            </button>
            <button 
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              📋 Laporan
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="stats-overview" style={{ marginBottom: '30px' }}>
                <h2 className="card-title">Ringkasan Monitoring Tahun {new Date().getFullYear()}</h2>
                <div className="stats-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--primary)' }}>{stats.totalEmployees}</div>
                    <div className="stat-label">Total Pegawai</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.employeesWithTraining}</div>
                    <div className="stat-label">Pegawai dengan Pelatihan</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--warning)' }}>{stats.employeesWithoutTraining}</div>
                    <div className="stat-label">Belum Mengikuti Pelatihan</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--info)' }}>{stats.totalTraining}</div>
                    <div className="stat-label">Total Pelatihan</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--primary-dark)' }}>{stats.totalHours}</div>
                    <div className="stat-label">Total Jam Pelajaran</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.avgHoursPerEmployee}</div>
                    <div className="stat-label">Rata-rata Jam/Pegawai</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--info)' }}>{stats.withCertificate}</div>
                    <div className="stat-label">Pelatihan Bersertifikat</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--primary)' }}>{stats.completionRate}%</div>
                    <div className="stat-label">Tingkat Partisipasi</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions" style={{ marginBottom: '30px' }}>
                <h3 className="card-title">Aksi Cepat</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => exportMonitoringReport(allUsers, allTraining)}
                  >
                    📊 Export Laporan Monitoring
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => exportEmployeeReport(allUsers, allTraining)}
                  >
                    👥 Export Data Pegawai
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => exportTrainingReport(allTraining)}
                  >
                    📚 Export Data Pelatihan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Pegawai Tab */}
          {activeTab === 'progress' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 className="card-title">Progress Pengembangan Kompetensi Pegawai</h2>
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
                      <th>Pegawai</th>
                      <th>Jumlah Pelatihan</th>
                      <th>Total Jam Pelajaran</th>
                      <th>Pelatihan Bersertifikat</th>
                      <th>Pelatihan Terakhir</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeProgress
                      .filter(emp =>
                        emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.nip.includes(searchTerm) ||
                        emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice((pageProgress - 1) * pageSize, pageProgress * pageSize)
                      .map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <strong>{employee.nama}</strong><br />
                          <small style={{ color: 'var(--text-medium)' }}>
                            {employee.nip}<br />
                            {employee.jabatan}
                          </small>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: employee.trainingCount > 0 ? 'var(--success)' : 'var(--warning)' 
                          }}>
                            {employee.trainingCount} pelatihan
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: employee.totalHours > 0 ? 'var(--primary)' : 'var(--text-medium)' 
                          }}>
                            {employee.totalHours} jam
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 'bold',
                            color: employee.withCertificate > 0 ? 'var(--info)' : 'var(--text-medium)'
                          }}>
                            {employee.withCertificate} sertifikat
                          </span>
                        </td>
                        <td>
                          {employee.lastTraining ? (
                            <div>
                              <strong style={{ fontSize: '12px' }}>{employee.lastTraining.tema}</strong><br />
                              <small style={{ color: 'var(--text-medium)' }}>
                                {formatDate(employee.lastTraining.tanggalMulai)}
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-medium)' }}>Belum ada</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${
                            employee.trainingCount > 0 ? 'status-active' : 'status-inactive'
                          }`}>
                            {employee.trainingCount > 0 ? 'Aktif' : 'Belum Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hours Monitoring Tab */}
          {activeTab === 'hours' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <h2 className="card-title">Monitoring Jam Pelajaran</h2>
                  <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>
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
                      <th>Tanggal</th>
                      <th>Jam Pelajaran</th>
                      <th>Sertifikat</th>
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
                        </td>
                        <td>{training.penyelenggara}</td>
                        <td>
                          <div>
                            <strong>{formatDate(training.tanggalMulai)}</strong><br />
                            <small style={{ color: 'var(--text-medium)' }}>
                              s.d. {formatDate(training.tanggalSelesai)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                            fontSize: '16px'
                          }}>
                            {training.keterangan ? `${training.keterangan} jam` : '-'}
                          </span>
                        </td>
                        <td>
                          {training.sertifikat ? (
                            <button
                              className="btn btn-small btn-info"
                              onClick={() => viewCertificate(training.sertifikat)}
                              title="Lihat Sertifikat"
                            >
                              📄 Lihat
                            </button>
                          ) : (
                            <span className="status-badge status-inactive">
                              Belum Upload
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="card-title">Laporan dan Export Data</h2>
              
              <div className="reports-section" style={{ marginTop: '30px' }}>
                <div className="report-cards" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '20px' 
                }}>
                  <div className="report-card" style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    padding: '20px' 
                  }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>
                      📊 Laporan Monitoring Kompetensi
                    </h3>
                    <p style={{ marginBottom: '15px', color: 'var(--text-medium)' }}>
                      Laporan komprehensif progress pengembangan kompetensi seluruh pegawai
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => exportMonitoringReport(allUsers, allTraining)}
                      style={{ width: '100%' }}
                    >
                      Download Excel
                    </button>
                  </div>

                  <div className="report-card" style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    padding: '20px' 
                  }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--success)' }}>
                      👥 Laporan Data Pegawai
                    </h3>
                    <p style={{ marginBottom: '15px', color: 'var(--text-medium)' }}>
                      Data lengkap pegawai dengan ringkasan pelatihan yang diikuti
                    </p>
                    <button 
                      className="btn btn-success"
                      onClick={() => exportEmployeeReport(allUsers, allTraining)}
                      style={{ width: '100%' }}
                    >
                      Download Excel
                    </button>
                  </div>

                  <div className="report-card" style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    padding: '20px' 
                  }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--info)' }}>
                      📚 Laporan Data Pelatihan
                    </h3>
                    <p style={{ marginBottom: '15px', color: 'var(--text-medium)' }}>
                      Detail seluruh pelatihan termasuk jam pelajaran dan status sertifikat
                    </p>
                    <button 
                      className="btn btn-info"
                      onClick={() => exportTrainingReport(allTraining)}
                      style={{ width: '100%' }}
                    >
                      Download Excel
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'var(--light-gray)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>📈 Ringkasan Statistik</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {stats.totalEmployees}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>Total Pegawai</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
                        {stats.totalTraining}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>Total Pelatihan</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--info)' }}>
                        {stats.totalHours}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>Total Jam Pelajaran</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning)' }}>
                        {stats.completionRate}%
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>Tingkat Partisipasi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
