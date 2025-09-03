import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'

export default function Dashboard() {
  const { user, loading, getAllUsers, getAllTrainingData, getUserTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [quickStats, setQuickStats] = useState({
    totalEmployees: 0,
    totalTraining: 0,
    thisYearTraining: 0,
    completionRate: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const loadQuickStats = async () => {
        try {
          const currentYear = new Date().getFullYear()

          if (user.role === 'admin') {
            const users = await getAllUsers()
            const training = await getAllTrainingData()
            const thisYearTraining = training.filter(t => {
              const year = new Date(t.tanggalMulai).getFullYear()
              return year === currentYear
            })
            const employeesWithTraining = new Set(thisYearTraining.map(t => t.userId)).size
            const completionRate = users.length > 0 ? Math.round((employeesWithTraining / users.length) * 100) : 0

            setQuickStats({
              totalEmployees: users.length,
              totalTraining: training.length,
              thisYearTraining: thisYearTraining.length,
              completionRate: completionRate
            })
          } else {
            const training = await getUserTrainingData(user.id)
            const thisYearTraining = training.filter(t => {
              const year = new Date(t.tanggalMulai).getFullYear()
              return year === currentYear
            })
            const certificateCount = training.filter(t => t.sertifikat).length
            const certificateRate = training.length > 0 ? Math.round((certificateCount / training.length) * 100) : 0

            setQuickStats({
              totalEmployees: 0,
              totalTraining: training.length,
              thisYearTraining: thisYearTraining.length,
              completionRate: certificateRate
            })
          }
        } catch (error) {
          console.error('Error loading quick stats:', error)
        }
      }
      loadQuickStats()
    }
  }, [user, getAllUsers, getAllTrainingData, getUserTrainingData])

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
          <p>Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCardClick = (path) => {
    router.push(path)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <h1 className="dashboard-title">OMDIAN - Dashboard Utama</h1>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="main-dashboard-content">
          <div className="welcome-section">
            <h2 className="welcome-title">
              Selamat Datang, {user.nama}
            </h2>
            <p className="welcome-subtitle">
              {user.role === 'admin'
                ? 'Kelola data pengembangan kompetensi pegawai dengan mudah'
                : user.role === 'kepala_bps'
                ? 'Monitor progress pengembangan kompetensi seluruh pegawai BPS'
                : 'Kelola riwayat pengembangan kompetensi Anda'}
            </p>
          </div>

          <div className="dashboard-cards">
            <div 
              className="dashboard-card training-card"
              onClick={() => handleCardClick('/training-history')}
            >
              <div className="card-icon">
                📚
              </div>
              <div className="card-content">
                <h3 className="card-title">Riwayat Pelatihan</h3>
                <p className="card-description">
                  {user.role === 'admin'
                    ? 'Kelola dan pantau riwayat diklat/workshop/seminar semua pegawai'
                    : user.role === 'kepala_bps'
                    ? 'Kelola riwayat pelatihan pribadi sebagai Kepala BPS'
                    : 'Lihat dan kelola riwayat pelatihan Anda'}
                </p>
              </div>
              <div className="card-arrow">
                →
              </div>
            </div>

            <div 
              className="dashboard-card statistics-card"
              onClick={() => handleCardClick('/statistics')}
            >
              <div className="card-icon">
                📊
              </div>
              <div className="card-content">
                <h3 className="card-title">Statistik Pengembangan Kompetensi</h3>
                <p className="card-description">
                  {user.role === 'admin'
                    ? 'Analisis dan laporan komprehensif pengembangan kompetensi'
                    : user.role === 'kepala_bps'
                    ? 'Analisis dan laporan monitoring kompetensi pegawai'
                    : 'Lihat statistik dan progress pengembangan kompetensi Anda'}
                </p>
              </div>
              <div className="card-arrow">
                →
              </div>
            </div>

            {user.role === 'admin' && (
              <div
                className="dashboard-card management-card"
                onClick={() => handleCardClick('/employee-management')}
              >
                <div className="card-icon">
                  👥
                </div>
                <div className="card-content">
                  <h3 className="card-title">Kelola Data Pegawai</h3>
                  <p className="card-description">
                    Tambah, edit, dan kelola data pegawai serta monitoring kelengkapan data
                  </p>
                </div>
                <div className="card-arrow">
                  →
                </div>
              </div>
            )}

            {user.role === 'kepala_bps' && (
              <div
                className="dashboard-card monitoring-card"
                onClick={() => handleCardClick('/enhanced-monitoring')}
              >
                <div className="card-icon">
                  📈
                </div>
                <div className="card-content">
                  <h3 className="card-title">Monitoring Kompetensi</h3>
                  <p className="card-description">
                    Monitoring lanjutan semua data pelatihan pegawai dengan analisis detail dan laporan
                  </p>
                </div>
                <div className="card-arrow">
                  →
                </div>
              </div>
            )}
          </div>

          <div className="quick-stats">
            <h3 className="stats-title">Ringkasan Cepat</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">
                  {user.role === 'admin' ? quickStats.totalEmployees : quickStats.thisYearTraining}
                </div>
                <div className="stat-label">
                  {user.role === 'admin' ? 'Total Pegawai' : 'Pelatihan Tahun Ini'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {quickStats.totalTraining}
                </div>
                <div className="stat-label">
                  Total Pelatihan
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {quickStats.completionRate}%
                </div>
                <div className="stat-label">
                  {user.role === 'admin' ? 'Tingkat Kelengkapan' : 'Progress Sertifikat'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
