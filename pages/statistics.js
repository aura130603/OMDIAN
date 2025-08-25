import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'
import { 
  exportEmployeeReport, 
  exportTrainingReport, 
  exportMonitoringReport,
  exportToPDF
} from '../utils/exportUtils'

export default function Statistics() {
  const { user, loading, getAllUsers, getAllTrainingData, getUserTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [userTraining, setUserTraining] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const loadStatisticsData = async () => {
        try {
          if (user.role === 'admin' || user.role === 'kepala_bps') {
            const users = await getAllUsers()
            const training = await getAllTrainingData()
            setAllUsers(users)
            setAllTraining(training)
          } else {
            const training = await getUserTrainingData(user.id)
            setUserTraining(training)
          }
        } catch (error) {
          console.error('Error loading statistics data:', error)
          setAllUsers([])
          setAllTraining([])
          setUserTraining([])
        }
      }
      loadStatisticsData()
    }
  }, [user, getAllUsers, getAllTrainingData, getUserTrainingData])

  const getAdminStats = () => {
    const currentYear = new Date().getFullYear()
    const thisYearTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    // Get employees with training in the last 3 years for better completion rate
    const lastThreeYearsTraining = allTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year >= currentYear - 2 && year <= currentYear
    })

    const employeesWithTraining = new Set(lastThreeYearsTraining.map(t => t.userId)).size
    const employeesWithoutTraining = allUsers.length - employeesWithTraining

    return {
      totalEmployees: allUsers.length,
      totalTraining: allTraining.length,
      thisYearTraining: thisYearTraining.length,
      withCertificate: allTraining.filter(t => t.sertifikat).length,
      uniqueOrganizers: [...new Set(allTraining.map(t => t.penyelenggara))].length,
      employeesWithTraining,
      employeesWithoutTraining,
      completionRate: allUsers.length > 0 ? ((employeesWithTraining / allUsers.length) * 100).toFixed(1) : 0,
      certificateRate: allTraining.length > 0 ? ((allTraining.filter(t => t.sertifikat).length / allTraining.length) * 100).toFixed(1) : 0
    }
  }

  const getUserStats = () => {
    const currentYear = new Date().getFullYear()
    const thisYearTraining = userTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    return {
      totalTraining: userTraining.length,
      thisYearTraining: thisYearTraining.length,
      withCertificate: userTraining.filter(t => t.sertifikat).length,
      certificateRate: userTraining.length > 0 ? ((userTraining.filter(t => t.sertifikat).length / userTraining.length) * 100).toFixed(1) : 0,
      uniqueOrganizers: [...new Set(userTraining.map(t => t.penyelenggara))].length
    }
  }

  const getTrainingByYears = (trainingData, yearsCount = 3) => {
    const currentYear = new Date().getFullYear()
    const yearData = []

    for (let i = yearsCount - 1; i >= 0; i--) {
      const year = currentYear - i
      const yearTraining = trainingData.filter(t => {
        const trainingYear = new Date(t.tanggalMulai).getFullYear()
        return trainingYear === year
      })

      yearData.push({
        year: year,
        count: yearTraining.length,
        trainings: yearTraining
      })
    }

    return yearData
  }

  const handleExportEmployeeReport = () => {
    exportEmployeeReport(allUsers, allTraining)
  }

  const handleExportTrainingReport = () => {
    exportTrainingReport(user.role === 'admin' ? allTraining : userTraining)
  }

  const handleExportMonitoringReport = () => {
    exportMonitoringReport(allUsers, allTraining)
  }

  const handleExportPDF = (type) => {
    const title = type === 'employee' ? 'Laporan Data Pegawai' :
                  type === 'training' ? 'Laporan Data Pelatihan' :
                  'Laporan Monitoring Kompetensi'
    exportToPDF(title, [])
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
          <p>Memuat statistik...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = user.role === 'admin' ? getAdminStats() : getUserStats()
  const currentYear = new Date().getFullYear()

  return (
    <div className="dashboard-container">
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
              <h1 className="dashboard-title">Statistik Pengembangan Kompetensi</h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {/* Main Statistics Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 className="card-title">
                  {user.role === 'admin' ? 'Statistik Keseluruhan' : 'Statistik Pribadi'}
                </h2>
                {user.role === 'admin' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleExportEmployeeReport}>
                      📊 Export Data Pegawai
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportTrainingReport}>
                      📈 Export Data Pelatihan
                    </button>
                    {/* <button className="btn btn-secondary" onClick={() => handleExportPDF('overview')}>
                      📄 Export PDF
                    </button> */}
                  </div>
                )}
              </div>
            </div>
            
            <div className="profile-grid">
              {user.role === 'admin' ? (
                <>
                  <div className="profile-item">
                    <span className="profile-label">Total Pegawai</span>
                    <span className="profile-value">{stats.totalEmployees} orang</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Total Pelatihan</span>
                    <span className="profile-value">{stats.totalTraining} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Pelatihan Tahun {currentYear}</span>
                    <span className="profile-value">{stats.thisYearTraining} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Pegawai Aktif (3 Tahun)</span>
                    <span className="profile-value">{stats.employeesWithTraining} dari {stats.totalEmployees}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Tingkat Kelengkapan</span>
                    <span className="profile-value">
                      <span className={`status-badge ${stats.completionRate >= 80 ? 'status-active' : 'status-inactive'}`}>
                        {stats.completionRate}%
                      </span>
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Dengan Sertifikat</span>
                    <span className="profile-value">{stats.withCertificate} dari {stats.totalTraining}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Tingkat Sertifikat</span>
                    <span className="profile-value">
                      <span className={`status-badge ${stats.certificateRate >= 70 ? 'status-active' : 'status-inactive'}`}>
                        {stats.certificateRate}%
                      </span>
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Penyelenggara Unik</span>
                    <span className="profile-value">{stats.uniqueOrganizers} lembaga</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Total 3 Tahun Terakhir</span>
                    <span className="profile-value">
                      {(() => {
                        const yearlyData = getTrainingByYears(allTraining, 3)
                        const total = yearlyData.reduce((sum, year) => sum + year.count, 0)
                        return `${total} kegiatan`
                      })()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-item">
                    <span className="profile-label">Total Pelatihan</span>
                    <span className="profile-value">{stats.totalTraining} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Pelatihan Tahun {currentYear}</span>
                    <span className="profile-value">{stats.thisYearTraining} kegiatan</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Dengan Sertifikat</span>
                    <span className="profile-value">{stats.withCertificate} dari {stats.totalTraining}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Tingkat Sertifikat</span>
                    <span className="profile-value">
                      <span className={`status-badge ${stats.certificateRate >= 70 ? 'status-active' : 'status-inactive'}`}>
                        {stats.certificateRate}%
                      </span>
                    </span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Penyelenggara Berbeda</span>
                    <span className="profile-value">{stats.uniqueOrganizers} lembaga</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Rata-rata per Tahun</span>
                    <span className="profile-value">
                      {(() => {
                        const yearlyData = getTrainingByYears(userTraining, 3)
                        const totalLastThreeYears = yearlyData.reduce((sum, year) => sum + year.count, 0)
                        return (totalLastThreeYears / 3).toFixed(1)
                      })()} kegiatan
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Charts (Visual representation) */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Progress Visual</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              <div className="progress-chart">
                <div className="chart-title">
                  {user.role === 'admin' ? 'Tingkat Kelengkapan Data' : 'Progress Sertifikat'}
                </div>
                <div className="chart-container">
                  <div className="circular-progress">
                    <div 
                      className="progress-ring"
                      style={{
                        background: `conic-gradient(var(--primary-dark) 0deg ${(user.role === 'admin' ? stats.completionRate : stats.certificateRate) * 3.6}deg, var(--border-color) ${(user.role === 'admin' ? stats.completionRate : stats.certificateRate) * 3.6}deg 360deg)`
                      }}
                    >
                      <div className="progress-center">
                        <span className="progress-percentage">
                          {user.role === 'admin' ? stats.completionRate : stats.certificateRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="progress-chart">
                <div className="chart-title">Pelatihan per Tahun (3 Tahun Terakhir)</div>
                <div className="chart-container">
                  <div className="bar-chart">
                    {(() => {
                      const trainingData = user.role === 'admin' ? allTraining : userTraining
                      const yearlyData = getTrainingByYears(trainingData, 3)
                      const maxCount = Math.max(...yearlyData.map(d => d.count), 1)

                      return yearlyData.map((yearInfo, index) => (
                        <div key={yearInfo.year} className="bar-item">
                          <div className="bar-label">{yearInfo.year}</div>
                          <div className="bar-container">
                            <div
                              className={`bar-fill ${index === yearlyData.length - 1 ? 'active' : ''}`}
                              style={{
                                height: `${Math.min(100, (yearInfo.count / maxCount) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="bar-value">{yearInfo.count}</div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Breakdown Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Rincian Pelatihan 3 Tahun Terakhir</h2>
            </div>

            <div className="profile-grid">
              {(() => {
                const trainingData = user.role === 'admin' ? allTraining : userTraining
                const yearlyData = getTrainingByYears(trainingData, 3)

                return yearlyData.map((yearInfo) => {
                  const withCertificates = yearInfo.trainings.filter(t => t.sertifikat).length
                  const certificateRate = yearInfo.count > 0 ? ((withCertificates / yearInfo.count) * 100).toFixed(1) : 0

                  return (
                    <div key={yearInfo.year} className="profile-item">
                      <span className="profile-label">
                        Tahun {yearInfo.year}
                        {yearInfo.year === currentYear && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                            color: 'var(--primary-dark)',
                            fontWeight: 'bold'
                          }}>
                            (AKTIF)
                          </span>
                        )}
                      </span>
                      <span className="profile-value">
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--primary-darkest)' }}>
                            {yearInfo.count} kegiatan
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                            {withCertificates} bersertifikat ({certificateRate}%)
                          </div>
                        </div>
                      </span>
                    </div>
                  )
                })
              })()}

              <div className="profile-item">
                <span className="profile-label">Total 3 Tahun</span>
                <span className="profile-value">
                  {(() => {
                    const trainingData = user.role === 'admin' ? allTraining : userTraining
                    const yearlyData = getTrainingByYears(trainingData, 3)
                    const total = yearlyData.reduce((sum, year) => sum + year.count, 0)
                    const avgPerYear = (total / 3).toFixed(1)
                    return (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary-darkest)' }}>
                          {total} kegiatan
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                          Rata-rata: {avgPerYear}/tahun
                        </div>
                      </div>
                    )
                  })()}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Trend Pelatihan</span>
                <span className="profile-value">
                  {(() => {
                    const trainingData = user.role === 'admin' ? allTraining : userTraining
                    const yearlyData = getTrainingByYears(trainingData, 3)
                    const lastYear = yearlyData[yearlyData.length - 1]?.count || 0
                    const previousYear = yearlyData[yearlyData.length - 2]?.count || 0

                    let trend = 'Stabil'
                    let trendColor = 'var(--text-medium)'
                    let trendIcon = '➡️'

                    if (lastYear > previousYear) {
                      trend = 'Meningkat'
                      trendColor = 'var(--success)'
                      trendIcon = '📈'
                    } else if (lastYear < previousYear) {
                      trend = 'Menurun'
                      trendColor = 'var(--warning)'
                      trendIcon = '📉'
                    }

                    return (
                      <div style={{ textAlign: 'right', color: trendColor }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {trendIcon} {trend}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {lastYear} vs {previousYear} (tahun lalu)
                        </div>
                      </div>
                    )
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Monitoring Table for Admin */}
          {user.role === 'admin' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <h2 className="card-title">Monitoring Pegawai Tahun {currentYear}</h2>
                  <button className="btn btn-secondary" onClick={handleExportMonitoringReport}>
                    📊 Export Monitoring
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="training-table">
                  <thead>
                    <tr>
                      <th>Nama Pegawai</th>
                      <th>NIP</th>
                      <th>Jabatan</th>
                      <th>Pelatihan {currentYear}</th>
                      <th>Total Pelatihan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((pegawai) => {
                      const employeeTraining = allTraining.filter(t => t.userId === pegawai.id)
                      const thisYearCount = employeeTraining.filter(t => {
                        const year = new Date(t.tanggalMulai).getFullYear()
                        return year === currentYear
                      }).length

                      return (
                        <tr key={pegawai.id}>
                          <td><strong>{pegawai.nama}</strong></td>
                          <td>{pegawai.nip}</td>
                          <td>{pegawai.jabatan}</td>
                          <td>{thisYearCount} kegiatan</td>
                          <td>{employeeTraining.length} kegiatan</td>
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
          )}
        </div>
      </div>
    </div>
  )
}
