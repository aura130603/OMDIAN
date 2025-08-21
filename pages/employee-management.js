import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from '../components/ProfileDropdown'
import EmployeeModal from '../components/EmployeeModal'

export default function EmployeeManagement() {
  const { user, loading, getAllUsers, addUser, updateUser, deleteUser, getAllTrainingData } = useContext(AuthContext)
  const router = useRouter()
  const [allUsers, setAllUsers] = useState([])
  const [allTraining, setAllTraining] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  // Removed filters state as filters are no longer needed

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const loadEmployeeData = async () => {
        try {
          const users = await getAllUsers()
          const training = await getAllTrainingData()
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
  }, [user, getAllUsers, getAllTrainingData])

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
      try {
        const result = await deleteUser(employeeId)
        if (result.success) {
          // Immediately update the local state to remove the deleted employee
          setAllUsers(prevUsers => prevUsers.filter(user => user.id !== employeeId))

          // Also refresh data from API to ensure consistency
          const updatedUsers = await getAllUsers()
          const updatedTraining = await getAllTrainingData()
          setAllUsers(updatedUsers)
          setAllTraining(updatedTraining)

          alert('Pegawai berhasil dihapus')
        } else {
          alert(result.message || 'Gagal menghapus pegawai')
        }
      } catch (error) {
        console.error('Error deleting employee:', error)
        alert('Terjadi kesalahan saat menghapus pegawai')
      }
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
          alert('Data pegawai berhasil diperbarui')
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
          alert('Pegawai berhasil ditambahkan')
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
  const currentYear = new Date().getFullYear()
  
  // Removed unique values for filters as they are no longer needed

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

  if (!user || user.role !== 'admin') {
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
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← Kembali
              </button>
              <h1 className="dashboard-title">Kelola Data Pegawai</h1>
            </div>
            <div className="dashboard-user">
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              {/* Single row with title, search, and add button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <h2 className="card-title" style={{ margin: 0, minWidth: 'fit-content' }}>
                  Data Pegawai ({filteredEmployees.length})
                </h2>

                <div style={{ flex: 1, maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Cari nama, NIP, jabatan..."
                    className="form-input"
                    style={{
                      marginBottom: '0',
                      paddingLeft: '12px',
                      fontSize: '14px',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary-medium)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(203, 210, 164, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <button
                  className="btn-add"
                  onClick={handleAddEmployee}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    minWidth: 'fit-content',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  + Tambah Pegawai
                </button>
              </div>
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
                      <th>SKP</th>
                      <th>Status {currentYear}</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((pegawai) => {
                      const thisYearCount = allTraining.filter(t => {
                        const year = new Date(t.tanggalMulai).getFullYear()
                        return t.userId === pegawai.id && year === currentYear
                      }).length

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
                          <td>{pegawai.nilaiSKP || '-'}</td>
                          <td>
                            <span className={`status-badge ${thisYearCount > 0 ? 'status-active' : 'status-inactive'}`}>
                              {thisYearCount > 0 ? `${thisYearCount} pelatihan` : 'Belum ada'}
                            </span>
                          </td>
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
    </div>
  )
}
