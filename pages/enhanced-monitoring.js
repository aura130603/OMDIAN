import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import EnhancedKepalaMonitoring from '../components/EnhancedKepalaMonitoring'

export default function EnhancedMonitoring() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user && user.role !== 'kepala_bps') {
      // Redirect non-kepala_bps users to appropriate dashboard
      router.push('/dashboard')
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
          <p>Memuat monitoring lanjutan...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'kepala_bps') {
    return null
  }

  return <EnhancedKepalaMonitoring user={user} />
}
