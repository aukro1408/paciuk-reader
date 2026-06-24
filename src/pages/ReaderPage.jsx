import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'

const CHARS_PER_PAGE = 1800

const styles = {
  page: {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#fafafa'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    transition: 'transform 0.3s ease'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    padding: '24px 20px',
    fontSize: '16px',
    lineHeight: 1.9,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  bottomBar: {
    background: '#fff',
    borderTop: '1px solid #eee',
    padding: '12px 20px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
    transition: 'transform 0.3s ease'
  },
  pageCounter: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginBottom: '10px',
    fontWeight: 500
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  navBtn: {
    flex: 1,
    height: '44px',
    border: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(90deg,#3fa9f5,#3d7eff)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s ease, filter 0.15s ease',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none'
  },
  navBtnDisabled: {
    flex: 1,
    height: '44px',
    border: '1px solid #ddd',
    borderRadius: '999px',
    background: '#f5f5f5',
    color: '#bbb',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'not-allowed',
    outline: 'none'
  },
  progressBar: {
    width: '100%',
    height: '3px',
    background: '#eee',
    borderRadius: '2px',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg,#3fa9f5,#3d7eff)',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  }
}

export default function ReaderPage({ book, onBack }) {
  const text = book.content || ''
  const totalChars = text.length
  const totalPages = Math.max(1, Math.ceil(totalChars / CHARS_PER_PAGE))

  // Generate pages
  const pages = []
  for (let i = 0; i < totalPages; i++) {
    pages.push(text.slice(i * CHARS_PER_PAGE, (i + 1) * CHARS_PER_PAGE))
  }

  const storageKey = 'readingProgress'
  const bookId = `${book.title}::${book.author}`

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const entry = saved[bookId]
      if (entry && typeof entry.currentPage === 'number') {
        // Validate saved page is within bounds
        if (entry.currentPage >= 0 && entry.currentPage < Math.max(1, Math.ceil((book.content || '').length / CHARS_PER_PAGE))) {
          return entry.currentPage
        }
      }
    } catch {}
    return 0
  })

  const saveProgress = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const percentage = totalPages > 1 ? Math.round(((currentPage + 1) / totalPages) * 100) : (currentPage >= 0 ? 100 : 0)
      saved[bookId] = {
        currentPage,
        totalPages,
        totalChars,
        percentage,
        isStarted: true
      }
      localStorage.setItem(storageKey, JSON.stringify(saved))

      // Also update isStarted in userBooks
      try {
        const userBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
        let changed = false
        for (let i = 0; i < userBooks.length; i++) {
          if (userBooks[i].title === book.title && userBooks[i].author === book.author) {
            if (!userBooks[i].isStarted) {
              userBooks[i].isStarted = true
              changed = true
            }
            if (userBooks[i].progress !== percentage) {
              userBooks[i].progress = percentage
              changed = true
            }
            break
          }
        }
        if (changed) {
          localStorage.setItem('userBooks', JSON.stringify(userBooks))
        }
      } catch {}
    } catch {}
  }, [currentPage, totalPages, totalChars, bookId, book.title, book.author])

  // Save progress whenever page changes
  useEffect(() => {
    saveProgress()
  }, [currentPage, saveProgress])

  useEffect(() => {
    console.log("CONTENT HEIGHT:", contentRef.current.clientHeight)
  })

  useEffect(() => {
    const words = text.split(/\s+/).slice(0, 500)
    if (words.length === 0) return

    const el = document.createElement('div')
    el.style.cssText = `
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      width: ${contentRef.current.clientWidth}px;
      font-size: 16px;
      line-height: 1.9;
      white-space: pre-wrap;
    `
    document.body.appendChild(el)

    let fitCount = 0
    for (let i = 0; i < words.length; i++) {
      el.textContent = words.slice(0, i + 1).join(' ')
      if (el.scrollHeight > 686) break
      fitCount = i + 1
    }

    console.log("WORDS FIT:", fitCount)
    document.body.removeChild(el)
  }, [])

  const goPrev = () => {
    setCurrentPage(p => Math.max(0, p - 1))
  }

  const goNext = () => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1))
  }

  const contentRef = useRef(null)

  const [touchStartX, setTouchStartX] = useState(0)
  const [immersiveMode, setImmersiveMode] = useState(false)

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext()
      } else {
        goPrev()
      }
    } else if (Math.abs(diff) < 10) {
      setImmersiveMode(prev => !prev)
    }
  }

  const progressPct = totalPages > 1 ? ((currentPage + 1) / totalPages) * 100 : 100

  return (
    <div style={styles.page}>
      <div style={{ ...styles.header, transform: immersiveMode ? 'translateY(-100%)' : 'translateY(0)' }}>
        <button style={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h2 style={styles.title}>{book.title}</h2>
      </div>

      <div ref={contentRef} style={styles.contentArea} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {pages[currentPage] || 'Пустая страница.'}
      </div>

      <div style={{ ...styles.bottomBar, transform: immersiveMode ? 'translateY(100%)' : 'translateY(0)' }}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        <div style={styles.pageCounter}>
          Страница {currentPage + 1} из {totalPages}
        </div>

        <div style={styles.navRow}>
          <button
            style={currentPage === 0 ? styles.navBtnDisabled : styles.navBtn}
            onClick={goPrev}
            disabled={currentPage === 0}
          >
            ← Назад
          </button>
          <button
            style={currentPage >= totalPages - 1 ? styles.navBtnDisabled : styles.navBtn}
            onClick={goNext}
            disabled={currentPage >= totalPages - 1}
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>
  )
}
