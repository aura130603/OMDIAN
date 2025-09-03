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
  const [showPassword, setShowPassword] = useState(false)

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
      {/* Decorative background wave */}
      <div className="auth-waves" aria-hidden="true">
        <svg className="auth-wave auth-wave--front" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#CBD2A4" fillOpacity="1" d="M0,64L48,90.7C96,117,192,171,288,202.7C384,235,480,245,576,213.3C672,181,768,107,864,96C960,85,1056,139,1152,154.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
        </svg>
      </div>

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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Masukkan password"
                aria-label="Password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                onClick={() => setShowPassword(v => !v)}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error-message">
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

        <div className="auth-demo-hint">
          <strong>Demo:</strong> admin1/admin123 atau pegawai1/password123
        </div>

      </div>
    </div>
  )
}
