import { useState, useEffect } from 'react'

export default function EmployeeModal({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nip: '',
    nama: '',
    pangkat: '',
    golongan: '',
    jabatan: '',
    pendidikan: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        username: employee.username || '',
        password: '', // Don't show existing password
        nip: employee.nip || '',
        nama: employee.nama || '',
        pangkat: employee.pangkat || '',
        golongan: employee.golongan || '',
        jabatan: employee.jabatan || '',
        pendidikan: employee.pendidikan || ''
      })
    }
  }, [employee])

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

    // Validation
    if (!formData.username.trim()) {
      setError('Username wajib diisi')
      setLoading(false)
      return
    }

    if (!employee && !formData.password) {
      setError('Password wajib diisi untuk pegawai baru')
      setLoading(false)
      return
    }

    if (!formData.nip || formData.nip.length !== 18) {
      setError('NIP harus 18 digit')
      setLoading(false)
      return
    }

    if (!formData.nama.trim()) {
      setError('Nama lengkap wajib diisi')
      setLoading(false)
      return
    }

    if (!formData.pangkat || !formData.golongan || !formData.jabatan || !formData.pendidikan) {
      setError('Semua field wajib diisi')
      setLoading(false)
      return
    }

    try {
      // Only include password in data if it's provided
      const dataToSave = { ...formData }
      if (!dataToSave.password) {
        delete dataToSave.password
      }
      
      await onSave(dataToSave)
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {employee ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
          </h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
              <label htmlFor="password" className="form-label">
                Password {employee ? '(kosongkan jika tidak ingin mengubah)' : '*'}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required={!employee}
                  placeholder={employee ? "Biarkan kosong jika tidak mengubah" : "Minimal 6 karakter"}
                  minLength={6}
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
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
                disabled={employee ? true : false} // NIP cannot be changed for existing employees
                style={employee ? { backgroundColor: 'var(--light-gray)', cursor: 'not-allowed' } : {}}
              />
              {employee && (
                <small style={{ color: 'var(--text-medium)', fontSize: '12px' }}>
                  NIP tidak dapat diubah
                </small>
              )}
            </div>

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

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
