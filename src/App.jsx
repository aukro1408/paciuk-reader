import { useState } from 'react'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import BookDetail from './pages/BookDetail'
import ReaderPage from './pages/ReaderPage'

function App() {
  const [page, setPage] = useState('home')
  const [selectedBook, setSelectedBook] = useState(null)

  const navigate = (to) => setPage(to)

  const handleBookClick = (book) => {
    // TASK 7 — check book opening logic
    console.group('[TASK7] === BOOK CLICK ===')
    console.log('[TASK7] Clicked book object:', JSON.stringify(book, null, 2))
    console.log('[TASK7] Book keys:', Object.keys(book))
    console.log('[TASK7] title:', book.title)
    console.log('[TASK7] author:', book.author)
    console.log('[TASK7] description length:', (book.description || '').length)
    console.log('[TASK7] has cover:', !!book.cover && book.cover.length > 0)
    console.log('[TASK7] cover URL (first 80 chars):', (book.cover || '').substring(0, 80))
    console.log('[TASK7] progress:', book.progress)
    console.log('[TASK7] isStarted:', book.isStarted)
    console.log('[TASK7] isFinished:', book.isFinished)
    console.log('[TASK7] has content:', !!book.content, '| content length:', (book.content || '').length)
    console.log('[TASK7] has fileContent:', !!book.fileContent, '| fileContent length:', (book.fileContent || '').length)
    console.groupEnd()

    setSelectedBook(book)
    setPage('detail')
  }

  const handleBack = () => {
    setPage('home')
  }

  const handleOpenReader = (book) => {
    console.log('[APP] Opening reader for:', book.title)
    console.log('[APP] book.content exists:', !!book.content, '| content length:', (book.content || '').length)
    console.log('[APP] book keys:', Object.keys(book))
    if (!book.content) {
      console.warn('[APP] CONTENT MISSING! Checking other fields...')
      console.log('[APP] fileContent available:', !!book.fileContent, '| fileContent length:', (book.fileContent || '').length)
    }

    try {
      localStorage.setItem(
        'lastOpenedBook',
        JSON.stringify({
          id: book.id,
          title: book.title,
          author: book.author
        })
      )
    } catch {}

    setSelectedBook(book)
    setPage('reader')
  }

  return (
    <>
      {page === 'home' && <Home onBookClick={handleBookClick} activePage={page} onNavigate={navigate} />}
      {page === 'favorites' && <Favorites onBookClick={handleBookClick} activePage={page} onNavigate={navigate} />}
      {page === 'detail' && selectedBook && (
        <BookDetail book={selectedBook} onBack={handleBack} onRead={handleOpenReader} />
      )}
      {page === 'reader' && selectedBook && (
        <ReaderPage book={selectedBook} onBack={handleBack} />
      )}
    </>
  )
}

export default App