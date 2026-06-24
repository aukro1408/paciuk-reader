import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import { createProbe, destroyProbe, calculatePageForward, calculatePageBackward } from '../utils/getVisiblePage'

const styles = {
  page: {
    height: '100dvh',
    overflow: 'hidden',
    background: '#fafafa'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #eee',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
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
    position: 'fixed',
    top: '60px',
    bottom: '100px',
    left: 0,
    right: 0,
    overflow: 'hidden',
    padding: '0 20px',
    fontSize: '16px',
    lineHeight: 1.9,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
  },
  bottomBar: {
    background: '#fff',
    borderTop: '1px solid #eee',
    padding: '12px 20px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
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
  const wordsRef = useRef([])
  const probeRef = useRef(null)
  const pageCache = useRef(new Map())
  const endToStart = useRef(new Map())

  const [currentPage, setCurrentPage] = useState(null)
  const [immersiveMode, setImmersiveMode] = useState(false)
  const [estimatedTotalPages, setEstimatedTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const storageKey = 'readingProgress'
  const bookId = `${book.title}::${book.author}`

  useEffect(() => {
    const allWords = (book.content || '').split(/\s+/).filter(Boolean)
    wordsRef.current = allWords

    const containerWidth = window.innerWidth - 40
    const containerHeight = window.innerHeight - 180
    probeRef.current = createProbe(containerWidth, containerHeight, 16, 1.9)

    let startWord = 0
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const entry = saved[bookId]
      if (entry?.startWord >= 0 && entry.startWord < allWords.length) {
        startWord = entry.startWord
      }
    } catch {}

    const page = calculatePageForward(allWords, startWord, probeRef.current)
    pageCache.current.set(page.start, page)
    endToStart.current.set(page.end, page.start)

    setCurrentPage(page)
    const wordsOnPage = page.end - page.start || 1
    setEstimatedTotalPages(Math.ceil(allWords.length / wordsOnPage))
    setIsLoading(false)

    return () => {
      destroyProbe(probeRef.current)
    }
  }, [book])

  const goNext = useCallback(() => {
    setCurrentPage(prev => {
      if (!prev || prev.end >= wordsRef.current.length) return prev

      const nextStart = prev.end
      let page = pageCache.current.get(nextStart)

      if (!page) {
        page = calculatePageForward(wordsRef.current, nextStart, probeRef.current)
        pageCache.current.set(page.start, page)
        endToStart.current.set(page.end, page.start)
      }

      return page
    })
  }, [])

  const goPrev = useCallback(() => {
    setCurrentPage(prev => {
      if (!prev || prev.start <= 0) return prev

      const prevEnd = prev.start
      const cachedStart = endToStart.current.get(prevEnd)
      let page = cachedStart !== undefined ? pageCache.current.get(cachedStart) : null

      if (!page) {
        page = calculatePageBackward(wordsRef.current, prevEnd, probeRef.current)
        pageCache.current.set(page.start, page)
        endToStart.current.set(page.end, page.start)
      }

      return page
    })
  }, [])

  useEffect(() => {
    if (!currentPage) return

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      const totalWords = wordsRef.current.length
      const percentage = totalWords > 0
        ? Math.round((currentPage.end / totalWords) * 100)
        : 0

      saved[bookId] = {
        startWord: currentPage.start,
        percentage,
        isStarted: true
      }

      localStorage.setItem(storageKey, JSON.stringify(saved))
    } catch {}
  }, [currentPage, bookId])

  const contentRef = useRef(null)
  const [touchStartX, setTouchStartX] = useState(0)

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

  const totalWords = wordsRef.current.length
  const progressPct = totalWords > 0 && currentPage
    ? Math.round((currentPage.end / totalWords) * 100)
    : 0

  const estimatedCurrentPage = currentPage && totalWords > 0
    ? Math.floor(currentPage.start / (totalWords / estimatedTotalPages)) + 1
    : 1

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h2 style={styles.title}>{book.title}</h2>
        </div>
        <div style={{ ...styles.contentArea, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Загрузка...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.header, transform: immersiveMode ? 'translateY(-100%)' : 'translateY(0)' }}>
        <button style={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h2 style={styles.title}>{book.title}</h2>
      </div>

      <div ref={contentRef} style={styles.contentArea} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {currentPage ? wordsRef.current.slice(currentPage.start, currentPage.end).join(' ') : 'Пустая страница.'}
      </div>

      <div style={{ ...styles.bottomBar, transform: immersiveMode ? 'translateY(100%)' : 'translateY(0)' }}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        <div style={styles.pageCounter}>
          Страница {estimatedCurrentPage} из {estimatedTotalPages}
        </div>

        <div style={styles.navRow}>
          <button
            style={!currentPage || currentPage.start === 0 ? styles.navBtnDisabled : styles.navBtn}
            onClick={goPrev}
            disabled={!currentPage || currentPage.start === 0}
          >
            ← Назад
          </button>
          <button
            style={!currentPage || currentPage.end >= totalWords ? styles.navBtnDisabled : styles.navBtn}
            onClick={goNext}
            disabled={!currentPage || currentPage.end >= totalWords}
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>
  )
}
