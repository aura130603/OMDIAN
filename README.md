# OMDIAN

Pengembangan Kompetensi Diupdate Rutinan Pegawai BPS Kabupaten Kudus

# KODE PROGRAM YANG AKU HAPUS DI FILE statistics.js, yang ada tanda kalimat ini {/_ ini ada card yang dihapus, aku taruh di README YAA _/}

{/_ Yearly Breakdown Card (hidden for admin) _/}
{user.role !== 'admin' && (

<div className="card">
<div className="card-header">
<h2 className="card-title">Rincian Pelatihan 3 Tahun Terakhir</h2>
</div>

              <div className="profile-grid">
                {(() => {
                  const trainingData = user.role === 'admin' ? allTraining : userTraining
                  const yearlyData = getTrainingByYears(trainingData, 3)

                  return yearlyData.map((yearInfo) => {
                    const withCertificates = yearInfo.trainings.filter(t => t.sertifikat).length
                    const certificateRate = yearInfo.count > 0 ? ((withCertificates / yearInfo.count) * 100).toFixed(1) : 0

                    return (
                      <div key={yearInfo.year} className="profile-item">
                        <span className="profile-label">
                          Tahun {yearInfo.year}
                          {yearInfo.year === currentYear && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              color: 'var(--primary-dark)',
                              fontWeight: 'bold'
                            }}>
                              (AKTIF)
                            </span>
                          )}
                        </span>
                        <span className="profile-value">
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary-darkest)' }}>
                              {yearInfo.count} kegiatan
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                              {withCertificates} bersertifikat ({certificateRate}%)
                            </div>
                          </div>
                        </span>
                      </div>
                    )
                  })
                })()}

                <div className="profile-item">
                  <span className="profile-label">Total 3 Tahun</span>
                  <span className="profile-value">
                    {(() => {
                      const trainingData = user.role === 'admin' ? allTraining : userTraining
                      const yearlyData = getTrainingByYears(trainingData, 3)
                      const total = yearlyData.reduce((sum, year) => sum + year.count, 0)
                      const avgPerYear = (total / 3).toFixed(1)
                      return (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--primary-darkest)' }}>
                            {total} kegiatan
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                            Rata-rata: {avgPerYear}/tahun
                          </div>
                        </div>
                      )
                    })()}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="profile-label">Trend Pelatihan</span>
                  <span className="profile-value">
                    {(() => {
                      const trainingData = user.role === 'admin' ? allTraining : userTraining
                      const yearlyData = getTrainingByYears(trainingData, 3)
                      const lastYear = yearlyData[yearlyData.length - 1]?.count || 0
                      const previousYear = yearlyData[yearlyData.length - 2]?.count || 0

                      let trend = 'Stabil'
                      let trendColor = 'var(--text-medium)'
                      let trendIcon = '➡️'

                      if (lastYear > previousYear) {
                        trend = 'Meningkat'
                        trendColor = 'var(--success)'
                        trendIcon = '📈'
                      } else if (lastYear < previousYear) {
                        trend = 'Menurun'
                        trendColor = 'var(--warning)'
                        trendIcon = '📉'
                      }

                      return (
                        <div style={{ textAlign: 'right', color: trendColor }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {trendIcon} {trend}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            {lastYear} vs {previousYear} (tahun lalu)
                          </div>
                        </div>
                      )
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
