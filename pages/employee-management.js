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
  const [filters, setFilters] = useState({
    pangkat: '',
    golongan: '',
    status: 'all'
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      const users = getAllUsers()
      const training = getAllTrainingData()
      setAllUsers(users)
      setAllTraining(training)
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
      const result = await deleteUser(employeeId)
      if (result.success) {
        const updatedUsers = getAllUsers()
        const updatedTraining = getAllTrainingData()
        setAllUsers(updatedUsers)
        setAllTraining(updatedTraining)
      } else {
        alert(result.message)
      }
    }
  }

  const handleSaveEmployee = async (employeeData) => {
    if (editingEmployee) {
      const result = await updateUser(editingEmployee.id, employeeData)
      if (result.success) {
        const updatedUsers = getAllUsers()
        setAllUsers(updatedUsers)
        setShowModal(false)
      } else {
        alert(result.message)
      }
    } else {
      const result = await addUser(employeeData)
      if (result.success) {
        const updatedUsers = getAllUsers()
        setAllUsers(updatedUsers)
        setShowModal(false)
      } else {
        alert(result.message)
      }
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getFilteredEmployees = () => {
    const currentYear = new Date().getFullYear()
    
    return allUsers.filter(employee => {
      const searchMatch = 
        employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.nip.includes(searchTerm) ||
        employee.jabatan.toLowerCase().includes(searchTerm.toLowerCase())

      const pangkatMatch = !filters.pangkat || employee.pangkat === filters.pangkat
      const golonganMatch = !filters.golongan || employee.golongan === filters.golongan

      let statusMatch = true
      if (filters.status !== 'all') {
        const hasCurrentYearTraining = allTraining.some(training => {
          const year = new Date(training.tanggalMulai).getFullYear()
          return training.pegawaiId === employee.id && year === currentYear
        })
        statusMatch = filters.status === 'complete' ? hasCurrentYearTraining : !hasCurrentYearTraining
      }

      return searchMatch && pangkatMatch && golonganMatch && statusMatch
    })
  }

  const filteredEmployees = getFilteredEmployees()
  const currentYear = new Date().getFullYear()
  
  // Get unique values for filter options
  const uniquePangkat = [...new Set(allUsers.map(u => u.pangkat))].sort()
  const uniqueGolongan = [...new Set(allUsers.map(u => u.golongan))].sort()

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
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 className="card-title">Data Pegawai ({filteredEmployees.length})</h2>
                <button className="btn-add" onClick={handleAddEmployee}>
                  + Tambah Pegawai
                </button>
              </div>

              {/* Filters */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: 'var(--light-gray)',
                borderRadius: '8px'
              }}>
                <input
                  type="text"
                  placeholder="Cari nama, NIP, jabatan..."
                  className="form-input"
                  style={{ marginBottom: '0' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="form-input"
                  style={{ marginBottom: '0' }}
                  value={filters.pangkat}
                  onChange={(e) => handleFilterChange('pangkat', e.target.value)}
                >
                  <option value="">Semua Pangkat</option>
                  {uniquePangkat.map(pangkat => (
                    <option key={pangkat} value={pangkat}>{pangkat}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  style={{ marginBottom: '0' }}
                  value={filters.golongan}
                  onChange={(e) => handleFilterChange('golongan', e.target.value)}
                >
                  <option value="">Semua Golongan</option>
                  {uniqueGolongan.map(golongan => (
                    <option key={golongan} value={golongan}>{golongan}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  style={{ marginBottom: '0' }}
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="complete">Sudah Lengkap {currentYear}</option>
                  <option value="incomplete">Belum Lengkap {currentYear}</option>
                </select>
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
                  {searchTerm || filters.pangkat || filters.golongan || filters.status !== 'all' 
                    ? 'Tidak ada data yang sesuai' 
                    : 'Belum ada data pegawai'}
                </h3>
                <p>
                  {searchTerm || filters.pangkat || filters.golongan || filters.status !== 'all'
                    ? 'Coba ubah kriteria filter atau pencarian'
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
                        return t.pegawaiId === pegawai.id && year === currentYear
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
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button 
                                className="btn btn-small btn-secondary"
                                onClick={() => handleEditEmployee(pegawai)}
                              >
                                Edit
                              </button>
                              {pegawai.role !== 'admin' && (
                                <button 
                                  className="btn btn-small"
                                  style={{ 
                                    backgroundColor: 'var(--error)',
                                    color: 'var(--white)',
                                    fontSize: '11px'
                                  }}
                                  onClick={() => handleDeleteEmployee(pegawai.id)}
                                >
                                  Hapus
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
