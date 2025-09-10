import { executeQuery } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear()

    // Attempt DB-backed aggregation first
    const usersCountQuery = `
      SELECT COUNT(*) AS cnt
      FROM users
      WHERE status = 'aktif' AND role <> 'admin'
    `
    const trainingsYearQuery = `
      SELECT 
        COUNT(*) AS trainings,
        COALESCE(SUM(CASE WHEN keterangan REGEXP '^[0-9]+' THEN CAST(keterangan AS UNSIGNED) ELSE 0 END), 0) AS hours,
        COUNT(DISTINCT user_id) AS participants
      FROM training_data
      WHERE YEAR(tanggal_mulai) = ?
    `

    const usersCountRes = await executeQuery(usersCountQuery)
    const trainingsYearRes = await executeQuery(trainingsYearQuery, [year])

    if (usersCountRes.success && trainingsYearRes.success) {
      const totalEmployees = usersCountRes.data[0]?.cnt || 0
      const thisYearTraining = trainingsYearRes.data[0]?.trainings || 0
      const totalHours = trainingsYearRes.data[0]?.hours || 0
      const participants = trainingsYearRes.data[0]?.participants || 0
      const completionRate = totalEmployees > 0 ? Number(((participants / totalEmployees) * 100).toFixed(1)) : 0

      return res.status(200).json({
        success: true,
        data: {
          year,
          totalEmployees,
          thisYearTraining,
          totalHours,
          completionRate,
          participants
        }
      })
    }

    // Fallback to in-memory dummy data
    const { DUMMY_USERS } = await import('../../users/dummy-operations')
    const { getFallbackTrainingData } = await import('../../training/fallback')

    const activeEmployees = DUMMY_USERS.filter(u => u.status === 'aktif' && u.role !== 'admin')
    const allTraining = getFallbackTrainingData('0', 'admin')

    const thisYear = allTraining.filter(t => new Date(t.tanggalMulai).getFullYear() === year)
    const participants = new Set(thisYear.map(t => t.userId)).size
    const totalHours = thisYear.reduce((sum, t) => sum + (parseInt(t.keterangan) || 0), 0)

    const payload = {
      year,
      totalEmployees: activeEmployees.length,
      thisYearTraining: thisYear.length,
      totalHours,
      completionRate: activeEmployees.length > 0 ? Number(((participants / activeEmployees.length) * 100).toFixed(1)) : 0,
      participants
    }

    return res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error('Advanced report API error:', error)
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' })
  }
}
