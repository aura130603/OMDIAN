import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import EmployeeDashboard from '../components/EmployeeDashboard'
import EnhancedAdminDashboard from '../components/EnhancedAdminDashboard'

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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

  return (
    <div className="dashboard-container">
      {user.role === 'admin' ? (
        <EnhancedAdminDashboard user={user} />
      ) : (
        <EmployeeDashboard user={user} />
      )}
    </div>
  )
}
