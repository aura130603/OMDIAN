import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useContext(AuthContext)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await login(formData.username, formData.password)
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">OMDIAN</h1>
          <p className="auth-subtitle">
            Sistem Pengembangan Kompetensi<br />
            BPS Kabupaten Kudus
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username/NIP
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Masukkan username atau NIP"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Masukkan password"
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--error)', 
              fontSize: '14px', 
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="auth-footer">
          Belum punya akun?
          <a href="/register" className="auth-link"> Daftar sekarang</a>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: 'rgba(203, 210, 164, 0.1)',
          borderRadius: '8px',
          fontSize: '11px',
          color: 'var(--text-medium)',
          textAlign: 'center',
          border: '1px solid rgba(203, 210, 164, 0.2)'
        }}>
          <strong>Demo:</strong> admin1/admin123 atau pegawai1/password123
        </div>

      </div>
    </div>
  )
}
