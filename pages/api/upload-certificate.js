import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
}

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Configure formidable
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 1,
      filter: function (part) {
        return part.name === 'certificate' && ALLOWED_TYPES.includes(part.mimetype)
      }
    })

    // Parse the form
    const [fields, files] = await form.parse(req)

    if (!files.certificate || files.certificate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid certificate file uploaded'
      })
    }

    const file = files.certificate[0]

    // Generate new filename to avoid conflicts
    const fileExtension = path.extname(file.originalFilename || '')
    const newFilename = `${uuidv4()}${fileExtension}`
    const newFilePath = path.join(uploadDir, newFilename)

    // Move file to new location with unique name
    fs.renameSync(file.filepath, newFilePath)

    // Return the web-accessible path
    const webPath = `/uploads/certificates/${newFilename}`

    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      filePath: webPath,
      originalName: file.originalFilename,
      size: file.size
    })

  } catch (error) {
    console.error('Upload certificate error:', error)

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      })
    }

    if (error.code === 'LIMIT_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate: ' + error.message
    })
  }
}
