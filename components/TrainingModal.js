import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function TrainingModal({ training, onSave, onClose }) {
  const { user } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    tema: '',
    penyelenggara: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    jamPelajaran: '',
    sertifikat: null,
    statusSertifikat: 'belum_upload' // belum_upload, sudah_upload
  })
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (training) {
      setFormData({
        tema: training.tema || '',
        penyelenggara: training.penyelenggara || '',
        tanggalMulai: training.tanggalMulai || '',
        tanggalSelesai: training.tanggalSelesai || '',
        jamPelajaran: training.keterangan || '',
        sertifikat: training.sertifikat || null,
        statusSertifikat: training.sertifikat ? 'sudah_upload' : 'belum_upload'
      })

      // Set uploaded file info if certificate exists
      if (training.sertifikat) {
        setUploadedFile({
          name: training.sertifikat.split('/').pop(),
          path: training.sertifikat,
          size: 0 // Size unknown for existing files
        })
      } else {
        setUploadedFile(null)
      }
    }
  }, [training])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      setError('')

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('File harus berformat JPG, PNG, atau PDF')
        setUploading(false)
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Ukuran file maksimal 5MB')
        setUploading(false)
        return
      }

      // Upload file to server
      const formData = new FormData()
      formData.append('certificate', file)

      const response = await fetch('/api/upload-certificate', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          sertifikat: result.filePath,
          statusSertifikat: 'sudah_upload'
        }))
        setUploadedFile({
          name: result.originalName,
          path: result.filePath,
          size: result.size
        })
      } else {
        setError(result.message || 'Gagal mengupload file')
      }
    } catch (error) {
      console.error('File upload error:', error)
      setError('Terjadi kesalahan saat mengupload file')
    } finally {
      setUploading(false)
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
      // Map jamPelajaran back to keterangan for backend compatibility
      const dataToSave = {
        ...formData,
        keterangan: formData.jamPelajaran
      }
      delete dataToSave.jamPelajaran
      await onSave(dataToSave)
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
            <label htmlFor="jamPelajaran" className="form-label">
              Jam Pelajaran
            </label>
            <input
              type="number"
              id="jamPelajaran"
              name="jamPelajaran"
              className="form-input"
              value={formData.jamPelajaran}
              onChange={handleChange}
              min="1"
              placeholder="Jumlah jam pelajaran yang diikuti"
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
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="sertifikat"
                style={{
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  display: 'block',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                <div className="file-upload-text">
                  {uploading ? (
                    <>
                      ⏳ Mengupload file...
                      <br />
                      <small style={{ color: 'var(--primary-medium)' }}>Mohon tunggu sebentar</small>
                    </>
                  ) : uploadedFile ? (
                    <>
                      📄 {uploadedFile.name}
                      <br />
                      <small style={{ color: 'var(--success)' }}>
                        ✓ File berhasil diupload ({(uploadedFile.size / 1024).toFixed(1)} KB) - Klik untuk mengganti
                      </small>
                    </>
                  ) : formData.sertifikat ? (
                    <>
                      📄 {formData.sertifikat.split('/').pop()}
                      <br />
                      <small style={{ color: 'var(--success)' }}>✓ File sudah tersimpan - Klik untuk mengganti</small>
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
