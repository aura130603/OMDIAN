import { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import YearFilter from './YearFilter'
import { exportEmployeeReport, exportTrainingReport, exportMonitoringReport, viewCertificate } from '../utils/exportUtils'

export default function EnhancedKepalaMonitoring({ user }) {
  const { getAllUsers, getAllTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all-training')
  const [hoveredTab, setHoveredTab] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [filterStatus, setFilterStatus] = useState('all')
  const [serverStats, setServerStats] = useState(null)

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

  useEffect(() => {
    const fetchAdvancedStats = async () => {
      try {
        const params = selectedYear ? `?year=${selectedYear}` : ''
        const res = await fetch(`/api/reports/advanced${params}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success) setServerStats(json.data)
        } else {
          setServerStats(null)
        }
      } catch (e) {
        setServerStats(null)
      }
    }
    if (user && user.role === 'kepala_bps') fetchAdvancedStats()
  }, [user, selectedYear])

  const filteredAndSortedTraining = () => {
    let filtered = allTraining.filter(t => {
      const matchesSearch = t.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.pegawaiNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.pegawaiNIP.includes(searchTerm)

      if (filterStatus === 'with-certificate') {
        return matchesSearch && t.sertifikat
      } else if (filterStatus === 'without-certificate') {
        return matchesSearch && !t.sertifikat
      }
      return matchesSearch
    })

    // Sort the filtered data
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.tanggalMulai) - new Date(a.tanggalMulai)
        case 'employee':
          return a.pegawaiNama.localeCompare(b.pegawaiNama)
        case 'theme':
          return a.tema.localeCompare(b.tema)
        case 'organizer':
          return a.penyelenggara.localeCompare(b.penyelenggara)
        case 'hours':
          return (parseInt(b.keterangan) || 0) - (parseInt(a.keterangan) || 0)
        default:
          return 0
      }
    })
  }

  const getDetailedStats = () => {
    const currentYear = new Date().getFullYear()
    const thisYearTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    const employeesWithTraining = new Set(thisYearTraining.map(t => t.userId)).size
    const totalHours = thisYearTraining.reduce((sum, training) => {
      return sum + (parseInt(training.keterangan) || 0)
    }, 0)

    const trainingByOrganizer = {}
    allTraining.forEach(t => {
      trainingByOrganizer[t.penyelenggara] = (trainingByOrganizer[t.penyelenggara] || 0) + 1
    })

    const topOrganizers = Object.entries(trainingByOrganizer)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      totalEmployees: allUsers.length,
      employeesWithTraining,
      employeesWithoutTraining: allUsers.length - employeesWithTraining,
      totalTraining: allTraining.length,
      thisYearTraining: thisYearTraining.length,
      totalHours,
      avgHoursPerEmployee: employeesWithTraining > 0 ? Math.round(totalHours / employeesWithTraining) : 0,
      withCertificate: allTraining.filter(t => t.sertifikat).length,
      completionRate: allUsers.length > 0 ? ((employeesWithTraining / allUsers.length) * 100).toFixed(1) : 0,
      certificateRate: allTraining.length > 0 ? ((allTraining.filter(t => t.sertifikat).length / allTraining.length) * 100).toFixed(1) : 0,
      topOrganizers
    }
  }

  const getEmployeeAnalysis = () => {
    // Use the already year-filtered allTraining (based on selectedYear)
    return allUsers.map(employee => {
      const employeeTraining = allTraining.filter(t => t.userId === employee.id)
      const totalHours = employeeTraining.reduce((sum, training) => {
        return sum + (parseInt(training.keterangan) || 0)
      }, 0)
      const withCertificate = employeeTraining.filter(t => t.sertifikat).length
      const uniqueOrganizers = [...new Set(employeeTraining.map(t => t.penyelenggara))].length

      return {
        ...employee,
        totalTraining: employeeTraining.length,
        totalHours,
        withCertificate,
        certificateRate: employeeTraining.length > 0 ? ((withCertificate / employeeTraining.length) * 100).toFixed(1) : 0,
        uniqueOrganizers,
        lastTraining: employeeTraining.length > 0 ?
          employeeTraining.sort((a, b) => new Date(b.tanggalMulai) - new Date(a.tanggalMulai))[0] : null,
        status: employeeTraining.length > 0 ? 'Aktif' : 'Perlu Perhatian'
      }
    }).sort((a, b) => b.totalHours - a.totalHours)
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

  const stats = getDetailedStats()
  const employeeAnalysis = getEmployeeAnalysis()
  const filteredTraining = filteredAndSortedTraining()

  return (
    <>
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
              <h1 className="dashboard-title">OMDIAN - Monitoring Kompetensi Kepala BPS</h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Modern Tab Navigation */}
          <div style={{
            display: 'flex',
            borderRadius: '12px',
            backgroundColor: 'white',
            padding: '8px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0'
          }}>
            <button
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'all-training' ? '#CBD2A4' : (hoveredTab === 'all-training' ? 'white' : 'transparent'),
                color: '#54473F',
                fontWeight: activeTab === 'all-training' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hoveredTab === 'all-training' || activeTab === 'all-training' ? '0 4px 10px rgba(84,71,63,0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredTab('all-training')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab('all-training')}
            >
              📚 Semua Data Pelatihan
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'employee-analysis' ? '#CBD2A4' : (hoveredTab === 'employee-analysis' ? 'white' : 'transparent'),
                color: '#54473F',
                fontWeight: activeTab === 'employee-analysis' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hoveredTab === 'employee-analysis' || activeTab === 'employee-analysis' ? '0 4px 10px rgba(84,71,63,0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredTab('employee-analysis')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab('employee-analysis')}
            >
              👥 Analisis Pegawai
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === 'reports' ? '#CBD2A4' : (hoveredTab === 'reports' ? 'white' : 'transparent'),
                color: '#54473F',
                fontWeight: activeTab === 'reports' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hoveredTab === 'reports' || activeTab === 'reports' ? '0 4px 10px rgba(84,71,63,0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredTab('reports')}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => setActiveTab('reports')}
            >
              📋 Laporan Lanjutan
            </button>
          </div>

          {/* All Training Data Tab */}
          {activeTab === 'all-training' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {/* Header Section */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--primary-darkest)',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Semua Data Pelatihan
                </h2>
                <p style={{
                  color: 'var(--text-medium)',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Total {filteredTraining.length} data pelatihan ditemukan
                </p>
              </div>

              {/* Modern Control Panel */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', minWidth: '60px' }}>Filter:</span>
                  <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', minWidth: '60px' }}>Urutkan:</span>
                  <select
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      minWidth: '140px',
                      outline: 'none'
                    }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Tanggal</option>
                    <option value="employee">Pegawai</option>
                    <option value="theme">Tema</option>
                    <option value="organizer">Penyelenggara</option>
                    <option value="hours">Jam Pelajaran</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', minWidth: '60px' }}>Status:</span>
                  <select
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      minWidth: '140px',
                      outline: 'none'
                    }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="with-certificate">Bersertifikat</option>
                    <option value="without-certificate">Tanpa Sertifikat</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '250px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Cari pelatihan, pegawai, atau penyelenggara..."
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      outline: 'none'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabel Data Pelatihan */}
              {filteredTraining.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-medium)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <h3 style={{ marginBottom: '8px', color: 'var(--primary-darkest)' }}>
                    Tidak ada data pelatihan
                  </h3>
                  <p style={{ margin: '0' }}>
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="training-table">
                    <thead>
                      <tr>
                        <th>Pegawai</th>
                        <th>Tema Pelatihan</th>
                        <th>Penyelenggara</th>
                        <th>Tanggal</th>
                        <th>Jam Pelajaran</th>
                        <th>Status</th>
                        <th>Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTraining.map((training) => (
                        <tr key={training.id}>
                          <td>
                            <strong>{training.pegawaiNama}</strong><br />
                            <small style={{ color: 'var(--text-medium)' }}>{training.pegawaiNIP}</small>
                          </td>
                          <td><strong>{training.tema}</strong></td>
                          <td>{training.penyelenggara}</td>
                          <td>
                            {formatDate(training.tanggalMulai)}<br />
                            <small style={{ color: 'var(--text-medium)' }}>s.d. {formatDate(training.tanggalSelesai)}</small>
                          </td>
                          <td>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                              {training.keterangan ? `${training.keterangan} jam` : '-'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${training.sertifikat ? 'status-active' : 'status-inactive'}`}>
                              {training.sertifikat ? 'Lengkap' : 'Perlu Sertifikat'}
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
                              <span style={{ color: 'var(--text-medium)' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Employee Analysis Tab */}
          {activeTab === 'employee-analysis' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {/* Header Section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--primary-darkest)',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    Analisis Kerja Pegawai
                  </h2>
                  <p style={{
                    color: 'var(--text-medium)',
                    fontSize: '14px',
                    margin: '0'
                  }}>
                    Analisis detail performance dan partisipasi pelatihan per pegawai
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                  <div style={{ minWidth: '300px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Cari nama, NIP, atau jabatan..."
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e1e5e9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        outline: 'none'
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tabel Analisis Pegawai */}
              {employeeAnalysis
                .filter(emp =>
                  emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  emp.nip.includes(searchTerm) ||
                  emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-medium)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                    <h3 style={{ marginBottom: '8px', color: 'var(--primary-darkest)' }}>
                      Tidak ada pegawai ditemukan
                    </h3>
                    <p style={{ margin: '0' }}>
                      Coba ubah kata kunci pencarian
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="training-table">
                      <thead>
                        <tr>
                          <th>NIP</th>
                          <th>Nama</th>
                          <th>Jabatan</th>
                          <th>Total Pelatihan</th>
                          <th>Total Jam Pelatihan</th>
                          <th>Sertifikat</th>
                          <th>Progres Sertifikat</th>
                          <th>Pelatihan Terakhir</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeeAnalysis
                          .filter(emp =>
                            emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.nip.includes(searchTerm) ||
                            emp.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((emp) => (
                            <tr key={emp.id}>
                              <td>{emp.nip}</td>
                              <td><strong>{emp.nama}</strong></td>
                              <td>{emp.jabatan}</td>
                              <td>{emp.totalTraining}</td>
                              <td>{emp.totalHours}</td>
                              <td>{emp.withCertificate}</td>
                              <td>{emp.certificateRate}%</td>
                              <td>
                                {emp.lastTraining ? (
                                  <>
                                    {emp.lastTraining.tema}<br />
                                    <small style={{ color: 'var(--text-medium)' }}>
                                      {formatDate(emp.lastTraining.tanggalMulai)}
                                    </small>
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--text-medium)' }}>-</span>
                                )}
                              </td>
                              <td>
                                <span className={`status-badge ${emp.status === 'Aktif' ? 'status-active' : 'status-inactive'}`}>
                                  {emp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}


          {/* Advanced Reports Tab */}
          {activeTab === 'reports' && (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {/* Header Section */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--primary-darkest)',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Laporan & Analisis
                </h2>
                <p style={{
                  color: 'var(--text-medium)',
                  fontSize: '14px',
                  margin: '0'
                }}>
                  Export laporan komprehensif dan insight strategis untuk pengambilan keputusan
                </p>
              </div>

              {/* Quick Stats Overview - API backed with client fallback */}
              {(() => {
                const s = serverStats || stats
                return (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px',
                    padding: '24px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>
                        {s.totalEmployees}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>Total Pegawai</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
                        {s.thisYearTraining}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>Pelatihan Tahun Ini</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--info)', marginBottom: '4px' }}>
                        {s.totalHours}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>Total Jam Pelatihan</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning)', marginBottom: '4px' }}>
                        {s.completionRate}%
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>Tingkat Partisipasi</div>
                    </div>
                  </div>
                )
              })()}

              {/* Report Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  background: '#FFC6C6',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'black',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      Laporan Monitoring
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', margin: '0 0 20px 0' }}>
                      Analisis komprehensif performance dan tren pelatihan
                    </p>
                    <button
                      onClick={() => exportMonitoringReport(allUsers, allTraining)}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'black',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📥 Download Excel
                    </button>
                  </div>
                </div>

                <div style={{
                  // background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  background: '#9ECAD6',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'black',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      Analisis Pegawai
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', margin: '0 0 20px 0' }}>
                      Data kinerja individual dengan insight dan rekomendasi
                    </p>
                    <button
                      onClick={() => exportEmployeeReport(allUsers, allTraining)}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'black',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📥 Download Excel
                    </button>
                  </div>
                </div>

                <div style={{
                  // background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  background: '#EAC8A6',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'black',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      Detail Pelatihan
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', margin: '0 0 20px 0' }}>
                      Breakdown lengkap per program dengan analisis jam
                    </p>
                    <button
                      onClick={() => exportTrainingReport(allTraining)}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'black',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📥 Download Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--primary-darkest)',
                  marginBottom: '20px',
                  margin: '0 0 20px 0'
                }}>
                  🔍 Insight Strategis
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: (serverStats?.completionRate ?? stats.completionRate) >= 80 ? '#e7f5e7' : (serverStats?.completionRate ?? stats.completionRate) >= 60 ? '#fff3cd' : '#f8d7da',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        {(serverStats?.completionRate ?? stats.completionRate) >= 80 ? '✅' : (serverStats?.completionRate ?? stats.completionRate) >= 60 ? '⚠️' : '🚨'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--primary-darkest)' }}>
                          Partisipasi Pegawai
                        </h4>
                        <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>
                          {(serverStats?.completionRate ?? stats.completionRate)}% dari target
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-dark)' }}>
                      {(serverStats?.completionRate ?? stats.completionRate) >= 80 ?
                        'Tingkat partisipasi sangat baik, pertahankan momentum ini' :
                        (serverStats?.completionRate ?? stats.completionRate) >= 60 ?
                        'Perlu peningkatan partisipasi, dorong lebih banyak pegawai' :
                        'Butuh perhatian khusus, review strategi pelatihan'
                      }
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: stats.certificateRate >= 70 ? '#e7f5e7' : stats.certificateRate >= 50 ? '#fff3cd' : '#f8d7da',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        {stats.certificateRate >= 70 ? '🏆' : stats.certificateRate >= 50 ? '📄' : '❌'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--primary-darkest)' }}>
                          Kelengkapan Sertifikat
                        </h4>
                        <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>
                          {stats.certificateRate}% terupload
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-dark)' }}>
                      {stats.certificateRate >= 70 ?
                        'Tingkat kelengkapan baik, dokumentasi lengkap' :
                        stats.certificateRate >= 50 ?
                        'Perlu reminder upload sertifikat secara berkala' :
                        'Banyak sertifikat belum diupload, perlu tindakan'
                      }
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: stats.avgHoursPerEmployee >= 40 ? '#e7f5e7' : '#fff3cd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        {stats.avgHoursPerEmployee >= 40 ? '🎯' : '📈'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--primary-darkest)' }}>
                          Distribusi Jam
                        </h4>
                        <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>
                          {stats.avgHoursPerEmployee} jam/pegawai
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-dark)' }}>
                      {stats.avgHoursPerEmployee >= 40 ?
                        'Target jam pelatihan tercapai dengan baik' :
                        'Perlu ditingkatkan untuk mencapai target optimal'
                      }
                    </p>
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
