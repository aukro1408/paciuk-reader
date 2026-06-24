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
    justifyContent: 'space-between',
    gap: '10px',
    padding: '10px 16px',
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
    top: '38px',
    bottom: '42px',
    left: 0,
    right: 0,
    overflow: 'hidden',
    padding: '8px 16px',
    fontSize: '16px',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
  },
  pageAnimated: {
    transition: 'transform 190ms ease-out, opacity 190ms ease-out'
  },
  bottomBar: {
    background: '#fff',
    borderTop: '1px solid #eee',
    padding: '8px 16px',
    paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    transition: 'transform 0.3s ease'
  },
  pageCounter: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#888',
    marginBottom: '6px',
    fontWeight: 500
  },

  progressBar: {
    width: '100%',
    height: '3px',
    background: '#eee',
    borderRadius: '2px',
    marginBottom: '4px',
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
  const [pageAnimation, setPageAnimation] = useState('')
  const [animDirection, setAnimDirection] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('readerFontSize')) || 18
  })
  const [theme, setTheme] = useState('light')

  const themes = {
    light: { bg: '#fafafa', text: '#222222', surface: '#ffffff' },
    sepia: { bg: '#f4ecd8', text: '#4b3b2f', surface: '#efe4cb' },
    dark: { bg: '#121212', text: '#d6d6d6', surface: '#1e1e1e' }
  }
  const currentTheme = themes[theme]

  const storageKey = 'readingProgress'
  const bookId = `${book.title}::${book.author}`

  const increaseFont = () => {
    setFontSize(prev => Math.min(28, prev + 1))
  }

  const decreaseFont = () => {
    setFontSize(prev => Math.max(14, prev - 1))
  }

  useEffect(() => {
    localStorage.setItem('readerFontSize', fontSize)
  }, [fontSize])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setShowSettings(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showSettings])

  useEffect(() => {
    const allWords = (book.content || '').split(/\s+/).filter(Boolean)
    wordsRef.current = allWords

    const containerWidth = window.innerWidth - 32
    const containerHeight = window.innerHeight - 120
    probeRef.current = createProbe(containerWidth, containerHeight, 16, 1.65)

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
    if (!currentPage || currentPage.end >= wordsRef.current.length) return
    if (isAnimating) return

    setAnimDirection('left')
    setPageAnimation('next')
    setIsAnimating(true)

    setTimeout(() => {
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
      setPageAnimation('')
      setIsAnimating(false)
      setAnimDirection(null)
    }, 300)
  }, [currentPage, isAnimating])

  const goPrev = useCallback(() => {
    if (!currentPage || currentPage.start <= 0) return
    if (isAnimating) return

    setAnimDirection('right')
    setPageAnimation('prev')
    setIsAnimating(true)

    setTimeout(() => {
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
      setPageAnimation('')
      setIsAnimating(false)
      setAnimDirection(null)
    }, 300)
  }, [currentPage, isAnimating])

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
        totalPages: estimatedTotalPages,
        percentage,
        isStarted: true
      }

      localStorage.setItem(storageKey, JSON.stringify(saved))
    } catch {}
  }, [currentPage, bookId])

  const contentRef = useRef(null)
  const settingsRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = (e) => {
    if (isAnimating) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setIsDragging(true)
    setDragX(0)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || isAnimating) return
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
      setDragX(dx)
    }
  }

  const handleTouchEnd = (e) => {
    if (isAnimating) { setIsDragging(false); setDragX(0); return }

    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y

    setIsDragging(false)
    setDragX(0)

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -50) {
        goNext()
      } else if (dx > 50) {
        goPrev()
      }
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
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
      <div style={{ ...styles.page, background: currentTheme.bg }}>
        <div style={{ ...styles.header, background: currentTheme.surface }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <button style={styles.backBtn} onClick={onBack}>
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            <h2 style={{ ...styles.title, color: currentTheme.text }}>{book.title}</h2>
          </div>
        </div>
        <div style={{ ...styles.contentArea, display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentTheme.bg, color: currentTheme.text }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Загрузка...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.page, background: currentTheme.bg }}>
      <div style={{ ...styles.header, background: currentTheme.surface, transform: immersiveMode ? 'translateY(-100%)' : 'translateY(0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <button style={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <h2 style={{ ...styles.title, color: currentTheme.text }}>{book.title}</h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowSettings(prev => !prev)
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '22px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '4px 8px',
            color: currentTheme.text
          }}
        >
          A
        </button>
      </div>

      {showSettings && (
        <div ref={settingsRef} onClick={(e) => e.stopPropagation()} style={{
          position: 'fixed',
          top: '70px',
          right: '16px',
          width: '260px',
          background: currentTheme.surface,
          borderRadius: '18px',
          padding: '18px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          zIndex: 100,
          color: currentTheme.text
        }}>
          <div style={{ marginBottom: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Font Size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={decreaseFont}
                style={{
                  background: theme === 'dark' ? '#333' : '#f0f0f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: currentTheme.text
                }}
              >
                -
              </button>
              <span style={{ minWidth: '40px', textAlign: 'center' }}>{fontSize}px</span>
              <button
                onClick={increaseFont}
                style={{
                  background: theme === 'dark' ? '#333' : '#f0f0f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: currentTheme.text
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            Theme
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['light', 'sepia', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '10px',
                  border: theme === t ? '2px solid #f0b432' : `2px solid ${currentTheme.text}22`,
                  background: themes[t].bg,
                  color: themes[t].text,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        style={{
          ...styles.contentArea,
          fontSize: `${fontSize}px`,
          color: currentTheme.text,
          background: currentTheme.bg,
          transition: isDragging
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease',
          transform: isAnimating
            ? animDirection === 'left'
              ? 'translateX(-40px) scale(0.97)'
              : 'translateX(40px) scale(0.97)'
            : isDragging
            ? `translateX(${dragX * 0.3}px)`
            : 'translateX(0) scale(1)',
          opacity: isAnimating ? 0 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentPage ? wordsRef.current.slice(currentPage.start, currentPage.end).join(' ') : 'Пустая страница.'}
      </div>

      <div style={{ ...styles.bottomBar, background: currentTheme.surface, transform: immersiveMode ? 'translateY(100%)' : 'translateY(0)' }}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        <div style={{ ...styles.pageCounter, color: theme === 'dark' ? '#888' : '#888' }}>
          Страница {estimatedCurrentPage} из {estimatedTotalPages}
        </div>
      </div>
    </div>
  )
}
