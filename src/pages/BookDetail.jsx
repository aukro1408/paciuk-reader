import { useState, useEffect } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'
import '../styles/bookdetail.css'

function getReadingProgress(book) {
  try {
    const rp = JSON.parse(localStorage.getItem('readingProgress') || '{}')
    return rp[`${book.title}::${book.author}`] || null
  } catch { return null }
}

export default function BookDetail({ book, onBack, onRead }) {
  const [isFav, setIsFav] = useState(false)

  // Load reading progress (overrides book defaults)
  const rp = getReadingProgress(book)
  const [started, setStarted] = useState(rp ? rp.isStarted : (book.isStarted || false))
  const [progressPct, setProgressPct] = useState(rp ? rp.percentage : (book.progress || 0))
  const [totalPages, setTotalPages] = useState(rp ? rp.totalPages : null)

  const coverUrl = book.cover?.replace('-M', '-L') || book.cover

  useEffect(() => {
    const rp = getReadingProgress(book)
    if (rp) {
      setStarted(rp.isStarted)
      setProgressPct(rp.percentage)
      setTotalPages(rp.totalPages)
    }
  }, [book])

  const handleRead = () => {
    if (!started) {
      setStarted(true)
      try {
        // Mark isStarted in userBooks
        const saved = JSON.parse(localStorage.getItem('userBooks') || '[]')
        const idx = saved.findIndex(b => b.title === book.title && b.author === book.author)
        if (idx !== -1) {
          saved[idx].isStarted = true
          localStorage.setItem('userBooks', JSON.stringify(saved))
        }
        // Also init readingProgress if not present
        const rp = JSON.parse(localStorage.getItem('readingProgress') || '{}')
        const bookId = `${book.title}::${book.author}`
        if (!rp[bookId]) {
          rp[bookId] = { currentPage: 0, totalPages: 1, totalChars: 0, percentage: 0, isStarted: true }
          localStorage.setItem('readingProgress', JSON.stringify(rp))
        }
      } catch {}
    }
    if (onRead) onRead(book)
  }

  return (
    <div className="detail-page">

      <div className="hero">

        <img src={coverUrl} alt="" className="background-cover" />

        <div className="content">

          <div className="detail-top-bar">
            <button className="detail-top-btn" onClick={onBack}>
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              className="detail-top-btn"
              onClick={() => setIsFav(!isFav)}
            >
              <Heart
                size={22}
                strokeWidth={2.5}
                fill={isFav ? '#FF3B30' : 'none'}
                color={isFav ? '#FF3B30' : '#666'}
              />
            </button>
          </div>

          <div className="detail-cover-section">
            <div className="detail-cover-wrapper">
              <img src={coverUrl} alt={book.title} className="detail-cover" />
            </div>
            <button className="detail-continue-btn" onClick={handleRead}>
              {started ? 'Продолжить чтение' : 'Читать'}
            </button>
          </div>

        </div>

      </div>

      <div className="detail-body">

        <h1 className="detail-title">{book.title}</h1>
        <span className="detail-author">{book.author}</span>

        <div className="detail-meta">
          <div className="detail-pill">
            <span>📖</span>
            <span>{totalPages || '--'} стр</span>
          </div>
        </div>

        {started && (
          <div className="detail-progress-section">
            <div className="detail-progress-decoration-1"></div>
            <div className="detail-progress-decoration-2"></div>
            <div className="detail-progress-header">
              <span className="detail-progress-label">Прогресс чтения</span>
              <span className="detail-progress-value">{progressPct}%</span>
            </div>
            <div className="detail-progress-bar">
              <div className="detail-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        <div className="detail-description-card">
          <div className="detail-description-decoration-1"></div>
          <div className="detail-description-decoration-2"></div>
          <div className="detail-description-text">
            {book.description || 'Описание недоступно.'}
          </div>
        </div>

      </div>

    </div>
  )
}
