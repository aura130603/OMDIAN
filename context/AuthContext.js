import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('omdian_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('omdian_user', JSON.stringify(data.user))
        }
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omdian_user')
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const getAllUsers = async () => {
    if (!user || user.role !== 'admin') {
      return []
    }

    try {
      const response = await fetch(`/api/users?role=${user.role}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('Get users error:', error)
      return []
    }
  }

  const getUserTrainingData = async (userId) => {
    try {
      const response = await fetch(`/api/training?userId=${userId}&role=${user.role}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('Get user training data error:', error)
      return []
    }
  }

  const getAllTrainingData = async () => {
    if (!user || user.role !== 'admin') {
      return []
    }

    try {
      const response = await fetch(`/api/training?userId=${user.id}&role=${user.role}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error('Get all training data error:', error)
      return []
    }
  }

  const addTrainingData = async (trainingData) => {
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...trainingData,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Add training data error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const updateTrainingData = async (trainingId, trainingData) => {
    try {
      const response = await fetch('/api/training', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: trainingId,
          ...trainingData,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update training data error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const deleteTrainingData = async (trainingId) => {
    try {
      const response = await fetch(`/api/training?id=${trainingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete training data error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const addUser = async (userData) => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Akses ditolak' }
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestorRole: user.role,
          ...userData,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Add user error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const updateUser = async (userId, userData) => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Akses ditolak' }
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestorRole: user.role,
          id: userId,
          ...userData,
        }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const deleteUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Akses ditolak' }
    }

    try {
      const response = await fetch(`/api/users?id=${userId}&requestorRole=${user.role}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, message: 'Terjadi kesalahan koneksi' }
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    getAllUsers,
    getUserTrainingData,
    getAllTrainingData,
    addTrainingData,
    updateTrainingData,
    deleteTrainingData,
    addUser,
    updateUser,
    deleteUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
