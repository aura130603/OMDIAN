import React from 'react'

export default function Pagination({ currentPage, totalItems, pageSize = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalPages <= 1) return null

  const goTo = (page) => {
    const p = Math.min(totalPages, Math.max(1, page))
    if (p !== currentPage) onPageChange(p)
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxButtons = 5
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let end = start + maxButtons - 1
    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxButtons + 1)
    }

    if (start > 1) pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>)
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => goTo(i)}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      )
    }
    if (end < totalPages) pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>)

    return pages
  }

  return (
    <div className="pagination-bar" role="navigation" aria-label="Pagination Navigation">
      <div className="pagination-info">Halaman {currentPage} dari {totalPages}</div>
      <div className="pagination-controls">
        <button className="pagination-button" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
          ←
        </button>
        {renderPageNumbers()}
        <button className="pagination-button" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>
          →
        </button>
      </div>
    </div>
  )
}
