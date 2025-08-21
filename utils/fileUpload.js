import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Allowed file types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf'
]

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.' 
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File size too large. Maximum size is 5MB.' 
    }
  }

  return { valid: true }
}

export const saveFile = async (file) => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const filename = `${uuidv4()}${fileExtension}`
    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer if needed
    let buffer
    if (file.arrayBuffer) {
      buffer = Buffer.from(await file.arrayBuffer())
    } else if (file.buffer) {
      buffer = file.buffer
    } else {
      throw new Error('Unable to process file data')
    }

    // Save file to disk
    fs.writeFileSync(filepath, buffer)

    // Return relative path that can be accessed via web
    return `/uploads/certificates/${filename}`
  } catch (error) {
    console.error('File save error:', error)
    throw new Error('Failed to save file')
  }
}

export const deleteFile = (filePath) => {
  try {
    if (filePath && filePath.startsWith('/uploads/certificates/')) {
      const fullPath = path.join(process.cwd(), 'public', filePath)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        return true
      }
    }
    return false
  } catch (error) {
    console.error('File delete error:', error)
    return false
  }
}

export const getFileUrl = (filePath) => {
  if (!filePath) return null
  return filePath.startsWith('http') ? filePath : filePath
}
