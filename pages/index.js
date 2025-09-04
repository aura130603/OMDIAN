import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'

export default function Home() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="auth-container">
      <div className="auth-waves" aria-hidden="true">
        <svg className="auth-wave auth-wave--front" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#CBD2A4" fillOpacity="1" d="M0,64L48,90.7C96,117,192,171,288,202.7C384,235,480,245,576,213.3C672,181,768,107,864,96C960,85,1056,139,1152,154.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
      </div>

      <div className="auth-card" role="status" aria-live="polite">
        <div className="auth-header">
          <h1 className="auth-title">OMDIAN</h1>
          <p className="auth-subtitle">Mengalihkan ke halaman yang sesuai...</p>
        </div>
        <a href="/login" className="btn btn-primary btn-full-width">
          Buka Halaman Login
        </a>
      </div>
    </div>
  )
}
