// Export utility functions for generating reports

export const exportToCSV = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor')
      return
    }

    // Get headers from first object
    const headers = Object.keys(data[0])
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          // Escape quotes and wrap in quotes if contains comma
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Error exporting CSV:', error)
    alert('Terjadi kesalahan saat mengekspor data')
    return false
  }
}

export const exportEmployeeReport = (employees, trainingData) => {
  const currentYear = new Date().getFullYear()
  
  const reportData = employees.map(employee => {
    const employeeTraining = trainingData.filter(t => t.pegawaiId === employee.id)
    const thisYearTraining = employeeTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })

    return {
      'NIP': employee.nip,
      'Nama': employee.nama,
      'Pangkat': employee.pangkat,
      'Golongan': employee.golongan,
      'Jabatan': employee.jabatan,
      'Pendidikan': employee.pendidikan,
      'Nilai SKP': employee.nilaiSKP || '-',
      'Hukuman Disiplin': employee.hukumanDisiplin,
      'Diklat PIM': employee.diklatPIM,
      'Diklat Fungsional': employee.diklatFungsional,
      'Total Pelatihan': employeeTraining.length,
      [`Pelatihan ${currentYear}`]: thisYearTraining.length,
      'Status Kelengkapan': thisYearTraining.length > 0 ? 'Lengkap' : 'Belum Lengkap'
    }
  })

  return exportToCSV(reportData, `Laporan_Pegawai_OMDIAN_${currentYear}`)
}

export const exportTrainingReport = (trainingData) => {
  const reportData = trainingData.map(training => ({
    'NIP Pegawai': training.pegawaiNIP || '-',
    'Nama Pegawai': training.pegawaiNama || '-',
    'Tema Pelatihan': training.tema,
    'Penyelenggara': training.penyelenggara,
    'Tanggal Mulai': formatDate(training.tanggalMulai),
    'Tanggal Selesai': formatDate(training.tanggalSelesai),
    'Durasi (Hari)': calculateDuration(training.tanggalMulai, training.tanggalSelesai),
    'Status Sertifikat': training.sertifikat ? 'Sudah Upload' : 'Belum Upload',
    'Keterangan': training.keterangan || '-',
    'Tahun Pelaksanaan': new Date(training.tanggalMulai).getFullYear()
  }))

  return exportToCSV(reportData, `Laporan_Pelatihan_OMDIAN_${new Date().getFullYear()}`)
}

export const exportMonitoringReport = (employees, trainingData) => {
  const currentYear = new Date().getFullYear()
  
  const monitoringData = employees.map(employee => {
    const employeeTraining = trainingData.filter(t => t.pegawaiId === employee.id)
    const thisYearTraining = employeeTraining.filter(t => {
      const year = new Date(t.tanggalMulai).getFullYear()
      return year === currentYear
    })
    
    const lastTraining = employeeTraining.sort((a, b) => 
      new Date(b.tanggalMulai) - new Date(a.tanggalMulai)
    )[0]

    return {
      'NIP': employee.nip,
      'Nama': employee.nama,
      'Jabatan': employee.jabatan,
      'Pangkat': employee.pangkat,
      'Golongan': employee.golongan,
      [`Jumlah Pelatihan ${currentYear}`]: thisYearTraining.length,
      'Status': thisYearTraining.length > 0 ? 'Sudah Mengisi' : 'Belum Mengisi',
      'Total Pelatihan Keseluruhan': employeeTraining.length,
      'Pelatihan Terakhir': lastTraining ? lastTraining.tema : 'Belum ada',
      'Tanggal Pelatihan Terakhir': lastTraining ? formatDate(lastTraining.tanggalMulai) : '-',
      'Sertifikat Tersedia': employeeTraining.filter(t => t.sertifikat).length,
      'Persentase Kelengkapan Sertifikat': employeeTraining.length > 0 
        ? `${((employeeTraining.filter(t => t.sertifikat).length / employeeTraining.length) * 100).toFixed(1)}%`
        : '0%'
    }
  })

  return exportToCSV(monitoringData, `Monitoring_Kompetensi_${currentYear}`)
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '-'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end date
  return diffDays
}

// PDF Export functionality (simplified - in production you'd use libraries like jsPDF)
export const exportToPDF = (title, data) => {
  // For now, show alert - in production, integrate with jsPDF
  alert(`Fitur PDF Export untuk "${title}" akan segera tersedia. Sementara ini gunakan CSV Export yang sudah berfungsi.`)
}

// Generate summary statistics for reports
export const generateSummaryStats = (employees, trainingData) => {
  const currentYear = new Date().getFullYear()
  
  const thisYearTraining = trainingData.filter(t => {
    const year = new Date(t.tanggalMulai).getFullYear()
    return year === currentYear
  })

  const employeesWithTraining = new Set(thisYearTraining.map(t => t.pegawaiId)).size
  const totalTrainingHours = thisYearTraining.reduce((total, training) => {
    const duration = calculateDuration(training.tanggalMulai, training.tanggalSelesai)
    return total + (isNaN(duration) ? 0 : duration)
  }, 0)

  return {
    totalEmployees: employees.length,
    totalTraining: trainingData.length,
    thisYearTraining: thisYearTraining.length,
    employeesWithTraining,
    employeesWithoutTraining: employees.length - employeesWithTraining,
    completionRate: employees.length > 0 ? ((employeesWithTraining / employees.length) * 100).toFixed(1) : 0,
    certificateCount: trainingData.filter(t => t.sertifikat).length,
    certificateRate: trainingData.length > 0 ? ((trainingData.filter(t => t.sertifikat).length / trainingData.length) * 100).toFixed(1) : 0,
    uniqueOrganizers: [...new Set(trainingData.map(t => t.penyelenggara))].length,
    averageTrainingPerEmployee: employees.length > 0 ? (trainingData.length / employees.length).toFixed(1) : 0,
    totalTrainingDays: totalTrainingHours
  }
}
