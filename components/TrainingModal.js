import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function TrainingModal({ training, onSave, onClose }) {
  const { user } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    tema: '',
    penyelenggara: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    keterangan: '',
    sertifikat: null,
    statusSertifikat: 'belum_upload' // belum_upload, sudah_upload
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (training) {
      setFormData({
        tema: training.tema || '',
        penyelenggara: training.penyelenggara || '',
        tanggalMulai: training.tanggalMulai || '',
        tanggalSelesai: training.tanggalSelesai || '',
        keterangan: training.keterangan || '',
        sertifikat: training.sertifikat || null,
        statusSertifikat: training.sertifikat ? 'sudah_upload' : 'belum_upload'
      })
    }
  }, [training])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real application, you would upload the file to a server
      // For demo purposes, we'll just store the filename
      setFormData({
        ...formData,
        sertifikat: file.name,
        statusSertifikat: 'sudah_upload'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.tema.trim()) {
      setError('Tema diklat/workshop/seminar wajib diisi')
      setLoading(false)
      return
    }

    if (!formData.penyelenggara.trim()) {
      setError('Penyelenggara wajib diisi')
      setLoading(false)
      return
    }

    if (!formData.tanggalMulai) {
      setError('Tanggal mulai wajib diisi')
      setLoading(false)
      return
    }

    if (!formData.tanggalSelesai) {
      setError('Tanggal selesai wajib diisi')
      setLoading(false)
      return
    }

    if (new Date(formData.tanggalMulai) > new Date(formData.tanggalSelesai)) {
      setError('Tanggal mulai tidak boleh lebih dari tanggal selesai')
      setLoading(false)
      return
    }

    try {
      await onSave(formData)
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {training ? 'Edit Data Pelatihan' : 'Tambah Data Pelatihan'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user && (
              <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                NIP: {user.nip} - {user.nama}
              </div>
            )}
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tema" className="form-label">
              Tema Diklat/Workshop/Seminar *
            </label>
            <input
              type="text"
              id="tema"
              name="tema"
              className="form-input"
              value={formData.tema}
              onChange={handleChange}
              required
              placeholder="Contoh: Pelatihan Analisis Data dengan SPSS"
            />
          </div>

          <div className="form-group">
            <label htmlFor="penyelenggara" className="form-label">
              Penyelenggara *
            </label>
            <input
              type="text"
              id="penyelenggara"
              name="penyelenggara"
              className="form-input"
              value={formData.penyelenggara}
              onChange={handleChange}
              required
              placeholder="Contoh: BPS Pusat, Universitas Indonesia, dll."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tanggalMulai" className="form-label">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                id="tanggalMulai"
                name="tanggalMulai"
                className="form-input"
                value={formData.tanggalMulai}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tanggalSelesai" className="form-label">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                id="tanggalSelesai"
                name="tanggalSelesai"
                className="form-input"
                value={formData.tanggalSelesai}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="keterangan" className="form-label">
              Keterangan
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              className="form-input"
              value={formData.keterangan}
              onChange={handleChange}
              rows={4}
              placeholder="Deskripsi singkat tentang materi pelatihan, manfaat yang diperoleh, dll."
            />
          </div>

          <div className="form-group">
            <label htmlFor="sertifikat" className="form-label">
              Upload Sertifikat
              <span className={`status-badge ${formData.statusSertifikat === 'sudah_upload' ? 'status-active' : 'status-inactive'}`} style={{ marginLeft: '10px', fontSize: '11px' }}>
                {formData.statusSertifikat === 'sudah_upload' ? 'Sudah Upload' : 'Belum Upload'}
              </span>
            </label>
            <div className="file-upload">
              <input
                type="file"
                id="sertifikat"
                name="sertifikat"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="sertifikat" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                <div className="file-upload-text">
                  {formData.sertifikat ? (
                    <>
                      📄 {formData.sertifikat}
                      <br />
                      <small style={{ color: 'var(--success)' }}>✓ File sudah dipilih - Klik untuk mengganti</small>
                    </>
                  ) : (
                    <>
                      📁 Klik untuk upload sertifikat
                      <br />
                      <small>Format: PDF, JPG, PNG (Max 5MB) - Opsional</small>
                    </>
                  )}
                </div>
              </label>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-medium)', marginTop: '5px' }}>
              <strong>Catatan:</strong> Upload sertifikat bersifat opsional, namun sangat direkomendasikan untuk kelengkapan data kompetensi Anda.
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
