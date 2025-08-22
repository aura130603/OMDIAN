import { useState, useEffect } from 'react'

export default function YearFilter({ selectedYear, onYearChange, showAllOption = true }) {
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    // Generate years from 2023 to current year + 1 (for future planning)
    const currentYear = new Date().getFullYear()
    const startYear = 2023
    const endYear = currentYear + 1
    
    const years = []
    for (let year = endYear; year >= startYear; year--) {
      years.push(year)
    }
    
    setAvailableYears(years)
  }, [])

  const handleYearChange = (event) => {
    const value = event.target.value
    onYearChange(value === 'all' ? null : parseInt(value))
  }

  return (
    <div className="year-filter-container">
      <label htmlFor="year-filter" className="form-label" style={{ marginBottom: '5px', display: 'block' }}>
        Filter Tahun:
      </label>
      <select
        id="year-filter"
        className="form-input year-filter-select"
        value={selectedYear || 'all'}
        onChange={handleYearChange}
        style={{ 
          maxWidth: '200px',
          marginBottom: '0'
        }}
      >
        {showAllOption && (
          <option value="all">Semua Tahun</option>
        )}
        {availableYears.map(year => (
          <option key={year} value={year}>
            Tahun {year}
          </option>
        ))}
      </select>
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--text-medium)', 
        marginTop: '5px' 
      }}>
        {selectedYear 
          ? `Menampilkan data tahun ${selectedYear}` 
          : 'Menampilkan semua data'
        }
      </div>
    </div>
  )
}
