import { useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nip: '',
    nama: '',
    pangkat: '',
    golongan: '',
    jabatan: '',
    pendidikan: '',
    nilaiSKP: '',
    hukumanDisiplin: 'Tidak Pernah',
    diklatPIM: 'Belum',
    diklatFungsional: 'Belum'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useContext(AuthContext)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter')
      setLoading(false)
      return
    }

    if (!formData.nip || formData.nip.length !== 18) {
      setError('NIP harus 18 digit')
      setLoading(false)
      return
    }

    try {
      const result = await register(formData)
      if (result.success) {
        setSuccess('Registrasi berhasil! Silakan login dengan akun Anda.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
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
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Registrasi</h1>
          <p className="auth-subtitle">
            Buat akun baru untuk mengakses<br />
            sistem pengembangan kompetensi
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Informasi Akun</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username untuk login"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nip" className="form-label">
                  NIP *
                </label>
                <input
                  type="text"
                  id="nip"
                  name="nip"
                  className="form-input"
                  value={formData.nip}
                  onChange={handleChange}
                  required
                  placeholder="18 digit NIP"
                  maxLength={18}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Data Pegawai</h3>
            <div className="form-group">
              <label htmlFor="nama" className="form-label">
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                className="form-input"
                value={formData.nama}
                onChange={handleChange}
                required
                placeholder="Nama lengkap sesuai SK"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pangkat" className="form-label">
                  Pangkat *
                </label>
                <select
                  id="pangkat"
                  name="pangkat"
                  className="form-input"
                  value={formData.pangkat}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Pangkat</option>
                  <option value="Pengatur Muda">Pengatur Muda</option>
                  <option value="Pengatur Muda Tk. I">Pengatur Muda Tk. I</option>
                  <option value="Pengatur">Pengatur</option>
                  <option value="Pengatur Tk. I">Pengatur Tk. I</option>
                  <option value="Penata Muda">Penata Muda</option>
                  <option value="Penata Muda Tk. I">Penata Muda Tk. I</option>
                  <option value="Penata">Penata</option>
                  <option value="Penata Tk. I">Penata Tk. I</option>
                  <option value="Pembina">Pembina</option>
                  <option value="Pembina Tk. I">Pembina Tk. I</option>
                  <option value="Pembina Utama Muda">Pembina Utama Muda</option>
                  <option value="Pembina Utama Madya">Pembina Utama Madya</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="golongan" className="form-label">
                  Golongan/Ruang *
                </label>
                <select
                  id="golongan"
                  name="golongan"
                  className="form-input"
                  value={formData.golongan}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Golongan</option>
                  <option value="II/a">II/a</option>
                  <option value="II/b">II/b</option>
                  <option value="II/c">II/c</option>
                  <option value="II/d">II/d</option>
                  <option value="III/a">III/a</option>
                  <option value="III/b">III/b</option>
                  <option value="III/c">III/c</option>
                  <option value="III/d">III/d</option>
                  <option value="IV/a">IV/a</option>
                  <option value="IV/b">IV/b</option>
                  <option value="IV/c">IV/c</option>
                  <option value="IV/d">IV/d</option>
                  <option value="IV/e">IV/e</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="jabatan" className="form-label">
                Jabatan *
              </label>
              <input
                type="text"
                id="jabatan"
                name="jabatan"
                className="form-input"
                value={formData.jabatan}
                onChange={handleChange}
                required
                placeholder="Jabatan saat ini"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Informasi Akademik & Kinerja</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pendidikan" className="form-label">
                  Pendidikan Terakhir *
                </label>
                <select
                  id="pendidikan"
                  name="pendidikan"
                  className="form-input"
                  value={formData.pendidikan}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nilaiSKP" className="form-label">
                  Nilai SKP Tahun Sebelumnya
                </label>
                <input
                  type="number"
                  id="nilaiSKP"
                  name="nilaiSKP"
                  className="form-input"
                  value={formData.nilaiSKP}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hukumanDisiplin" className="form-label">
                  Hukuman Disiplin
                </label>
                <select
                  id="hukumanDisiplin"
                  name="hukumanDisiplin"
                  className="form-input"
                  value={formData.hukumanDisiplin}
                  onChange={handleChange}
                >
                  <option value="Tidak Pernah">Tidak Pernah</option>
                  <option value="Pernah">Pernah</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="diklatPIM" className="form-label">
                  Diklat PIM
                </label>
                <select
                  id="diklatPIM"
                  name="diklatPIM"
                  className="form-input"
                  value={formData.diklatPIM}
                  onChange={handleChange}
                >
                  <option value="Belum">Belum</option>
                  <option value="Sudah">Sudah</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="diklatFungsional" className="form-label">
                Diklat Fungsional
              </label>
              <select
                id="diklatFungsional"
                name="diklatFungsional"
                className="form-input"
                value={formData.diklatFungsional}
                onChange={handleChange}
              >
                <option value="Belum">Belum</option>
                <option value="Sudah">Sudah</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Keamanan Akun</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Ulangi password"
                />
              </div>
            </div>
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

          {success && (
            <div style={{ 
              color: 'var(--success)', 
              fontSize: '14px', 
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? 
          <a href="/login" className="auth-link"> Masuk sekarang</a>
        </div>
      </div>
    </div>
  )
}
