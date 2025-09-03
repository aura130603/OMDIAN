import { useState, useContext, useRef, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function ProfileDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useContext(AuthContext)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-avatar">
          {user.nama.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.nama}</div>
          <div className="profile-role">
            {user.role === 'admin' ? 'Administrator' :
             user.role === 'kepala_bps' ? 'Kepala BPS' : 'Pegawai'}
          </div>
        </div>
        <div className="profile-arrow">
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-avatar-large">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="profile-details">
              <h3>{user.nama}</h3>
              <p>NIP: {user.nip}</p>
              <p>{user.jabatan}</p>
            </div>
          </div>
          
          {/* <div className="profile-dropdown-body">
            <div className="profile-item">
              <span className="profile-label">Pangkat</span>
              <span className="profile-value">{user.pangkat}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Golongan</span>
              <span className="profile-value">{user.golongan}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Pendidikan</span>
              <span className="profile-value">{user.pendidikan}</span>
            </div>
          </div> */}

          <div className="profile-dropdown-footer">
            <button 
              className="btn btn-primary" 
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
