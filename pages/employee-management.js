import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'
import EmployeeModal from '../components/EmployeeModal'
import YearFilter from '../components/YearFilter'

export default function EmployeeManagement() {
  const { user, loading, getAllUsers, addUser, updateUser, deleteUser, getAllTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)
  const [notice, setNotice] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, employeeId: null })

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'kepala_bps'))) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'kepala_bps')) {
      const loadEmployeeData = async () => {
        try {
          const users = await getAllUsers()
          const training = await getAllTrainingData(selectedYear)
          setAllUsers(users)
          setAllTraining(training)
        } catch (error) {
          console.error('Error loading employee data:', error)
          setAllUsers([])
          setAllTraining([])
        }
      }
      loadEmployeeData()
    }
  }, [user, selectedYear, getAllUsers, getAllTrainingData])

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleDeleteEmployee = (employeeId) => {
    setConfirmDelete({ open: true, employeeId })
  }

  const confirmDeleteYes = async () => {
    const employeeId = confirmDelete.employeeId
    try {
      const result = await deleteUser(employeeId)
      if (result.success) {
        setAllUsers(prevUsers => prevUsers.filter(user => user.id !== employeeId))
        const updatedUsers = await getAllUsers()
        const updatedTraining = await getAllTrainingData()
        setAllUsers(updatedUsers)
        setAllTraining(updatedTraining)
        setNotice({ type: 'success', message: 'Pegawai berhasil dihapus' })
      } else {
        alert(result.message || 'Gagal menghapus pegawai')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Terjadi kesalahan saat menghapus pegawai')
    } finally {
      setConfirmDelete({ open: false, employeeId: null })
    }
  }

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        const result = await updateUser(editingEmployee.id, employeeData)
        if (result.success) {
          // Immediately update local state with edited data
          setAllUsers(prevUsers =>
            prevUsers.map(user =>
              user.id === editingEmployee.id
                ? { ...user, ...employeeData, id: editingEmployee.id }
                : user
            )
          )

          // Also refresh from API to ensure consistency
          const updatedUsers = await getAllUsers()
          setAllUsers(updatedUsers)

          setShowModal(false)
          setNotice({ type: 'success', message: 'Data berhasil diperbarui' })
        } else {
          alert(result.message || 'Gagal memperbarui data pegawai')
        }
      } else {
        // Add new employee
        const result = await addUser(employeeData)
        if (result.success) {
          // Refresh data from API to get the new employee with proper ID
          const updatedUsers = await getAllUsers()
          setAllUsers(updatedUsers)

          setShowModal(false)
          setNotice({ type: 'success', message: 'Berhasil akun menambahkan pegawai baru' })
        } else {
          alert(result.message || 'Gagal menambahkan pegawai')
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error)
      alert('Terjadi kesalahan saat menyimpan data pegawai')
    }
  }

  // Removed handleFilterChange as filters are no longer needed

  const getFilteredEmployees = () => {
    return allUsers.filter(employee => {
      const searchMatch =
        employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nip.includes(searchTerm) ||
        employee.jabatan.toLowerCase().includes(searchTerm.toLowerCase())

      return searchMatch
    })
  }

  const filteredEmployees = getFilteredEmployees()

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
          <p>Memuat data pegawai...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'kepala_bps')) {
    return null
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => router.push('/dashboard')}
                className="nav-back-button"
                aria-label="Kembali"
                title="Kembali"
              >
                <svg className="nav-back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">Kembali</span>
              </button>
              <h1 className="dashboard-title">
                {user.role === 'admin' ? 'Kelola Data Pegawai' : 'Data Pegawai BPS'}
              </h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          {notice && (
            <div className={`notice ${notice.type === 'success' ? 'notice-success' : ''}`} role="status" aria-live="polite">
              {notice.message}
            </div>
          )}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h2 className="card-title" style={{ margin: 0 }}>
                    Data Pegawai ({filteredEmployees.length})
                  </h2>
                </div>
              </div>
            </div>

            <div className="control-panel">
              <div style={{ flex: 1, minWidth: '250px' }}>
                <input
                  type="text"
                  placeholder="🔍 Cari nama, NIP, atau jabatan..."
                  className="control-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <YearFilter selectedYear={selectedYear} onYearChange={setSelectedYear} />
              </div>
              {user.role === 'admin' && (
                <button className="btn-add" onClick={handleAddEmployee}>
                  + Tambah Pegawai
                </button>
              )}
            </div>

            {filteredEmployees.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                color: 'var(--text-medium)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
                <h3 style={{ marginBottom: '10px', color: 'var(--primary-darkest)' }}>
                  {searchTerm
                    ? 'Tidak ada data yang sesuai'
                    : 'Belum ada data pegawai'}
                </h3>
                <p>
                  {searchTerm
                    ? 'Coba ubah kata kunci pencarian'
                    : 'Klik "Tambah Pegawai" untuk menambah data pegawai baru'
                  }
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="training-table">
                  <thead>
                    <tr>
                      <th>NIP</th>
                      <th>Nama</th>
                      <th>Pangkat/Gol</th>
                      <th>Jabatan</th>
                      <th>Pendidikan</th>
                      <th>Status</th>
                      {user.role === 'admin' && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((pegawai) => {
                      const thisYearCount = allTraining.filter(t => t.userId === pegawai.id).length

                      return (
                        <tr key={pegawai.id}>
                          <td>{pegawai.nip}</td>
                          <td><strong>{pegawai.nama}</strong></td>
                          <td>
                            {pegawai.pangkat}<br />
                            <small style={{ color: 'var(--text-medium)' }}>
                              {pegawai.golongan}
                            </small>
                          </td>
                          <td>{pegawai.jabatan}</td>
                          <td>{pegawai.pendidikan}</td>
                          <td>
                            <span className={`status-badge ${thisYearCount > 0 ? 'status-active' : 'status-inactive'}`}>
                              {thisYearCount > 0 ? `${thisYearCount} pelatihan` : 'Belum ada'}
                            </span>
                          </td>
                          {user.role === 'admin' && (
                            <td>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  className="btn btn-small btn-secondary"
                                  onClick={() => handleEditEmployee(pegawai)}
                                  style={{
                                    fontSize: '11px',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--primary-medium)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--primary-dark)',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'var(--primary-medium)'
                                    e.target.style.color = 'white'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'var(--primary-dark)'
                                  }}
                                  title="Edit data pegawai"
                                >
                                  ✏️ Edit
                                </button>
                                {pegawai.role !== 'admin' && (
                                  <button
                                    className="btn btn-small"
                                    style={{
                                      fontSize: '11px',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      border: '1px solid var(--error)',
                                      backgroundColor: 'transparent',
                                      color: 'var(--error)',
                                      cursor: 'pointer',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = 'var(--error)'
                                      e.target.style.color = 'white'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent'
                                      e.target.style.color = 'var(--error)'
                                    }}
                                    onClick={() => handleDeleteEmployee(pegawai.id)}
                                    title="Hapus pegawai"
                                  >
                                    🗑️ Hapus
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onClose={() => setShowModal(false)}
        />
      )}

      {confirmDelete.open && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete({ open: false, employeeId: null })}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Konfirmasi Hapus Pegawai</h2>
              <button className="btn-close" onClick={() => setConfirmDelete({ open: false, employeeId: null })}>✕</button>
            </div>
            <div style={{ padding: '10px 0', color: 'var(--primary-darkest)' }}>
              Apakah Anda yakin untuk menghapus Pegawai?
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete({ open: false, employeeId: null })}>Tidak</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmDeleteYes}>Iya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
