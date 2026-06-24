import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { parseBook } from '../utils/BookParser'
import { saveBook, getAllBooks, deleteBook } from '../utils/db'
import '../styles/home.css'
import SearchBar from '../components/SearchBar'
import BookCard from '../components/BookCard'
import BottomNav from '../components/BottomNav'

const defaultBooks = [
  {
    id: 'demo-0',
    cover:'https://covers.openlibrary.org/b/id/8259296-M.jpg',
    title:'Мизери',
    author:'Стивен Кинг',
    description:'Знаменитый роман Стивена Кинга о писателе, который попадает в плен к своей обезумевшей поклоннице. Заставит ли она его воскресить любимую героиню или уничтожит автора вместе с ней? Мрак, безумие и безграничная власть одержимости.',
    rating:'4.6',
    pages:'398',
    language:'Russian',
    progress:42,
    isStarted:true,
    content:null,
    filePath: null,
    fileName: null
  },
  {
    id: 'demo-1',
    cover:'https://covers.openlibrary.org/b/id/12947486-M.jpg',
    title:'Мастер и Маргарита',
    author:'Михаил Булгаков',
    description:'В Москву 1930-х годов прибывает загадочный иностранец — Воланд, который оказывается самим дьяволом. Вместе со своей свитой он устраивает череду невероятных событий, обнажая человеческие пороки и переплетая судьбы москвичей с трагической историей Мастера и его возлюбленной Маргариты.',
    rating:'4.8',
    pages:'480',
    language:'Russian',
    progress:42,
    isStarted:true,
    content:null,
    filePath: null,
    fileName: null
  },
  {
    id: 'demo-2',
    cover:'https://covers.openlibrary.org/b/id/240726-M.jpg',
    title:'1984',
    author:'George Orwell',
    description:'Роман-антиутопия Джорджа Оруэлла, рисующий тоталитарное общество будущего, где Большой Брат следит за каждым шагом граждан. Главный герой Уинстон Смит пытается сохранить человеческое достоинство и любовь в мире, где мыслепреступление карается смертью.',
    rating:'4.7',
    pages:'328',
    language:'English',
    progress:42,
    isStarted:true,
    content:null,
    filePath: null,
    fileName: null
  }
]

function sanitizeForStorage(books) {
  return books.map(({ content, fileContent, ...rest }) => rest)
}

export default function Home({ onBookClick, activePage, onNavigate }) {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('books')
      if (saved) return JSON.parse(saved)
    } catch {}
    return defaultBooks
  })
  const [isImporting, setIsImporting] = useState(false)
  const [inputKey, setInputKey] = useState(0)
  const [activeBook, setActiveBook] = useState(null)

  useEffect(() => {
    console.log('[INDEXEDDB] LOADING BOOKS')
    getAllBooks().then((indexedBooks) => {
      if (indexedBooks && indexedBooks.length > 0) {
        console.log('[INDEXEDDB] BOOKS FOUND:', indexedBooks.length)
        setBooks(indexedBooks)
      } else {
        console.log('[INDEXEDDB] no books found — keeping localStorage/defaults')
      }
    }).catch((err) => {
      console.error('[INDEXEDDB] load error:', err)
    })
  }, [])

  useEffect(() => {
    try {
      const lastOpened = JSON.parse(
        localStorage.getItem('lastOpenedBook')
      )

      const progressData = JSON.parse(
        localStorage.getItem('readingProgress') || '{}'
      )

      if (!lastOpened) return

      const foundBook = books.find(
        b =>
          b.title === lastOpened.title &&
          b.author === lastOpened.author
      )

      if (!foundBook) return

      const key = `${foundBook.title}::${foundBook.author}`
      const savedProgress = progressData[key]

      setActiveBook({
        ...foundBook,
        progress: savedProgress?.percentage || 0
      })
    } catch {}
  }, [books])

  const handleRemoveBook = async (book) => {
    console.log('')
    console.log('=== SHELF REMOVE DEBUG ===')
    console.log('BOOKS BEFORE:', JSON.stringify(books.map(b => ({ id: b.id, title: b.title }))))
    console.log('SELECTED ID:', book?.id, '| SELECTED TITLE:', book?.title)

    if (!book || !book.id) {
      console.error('[SHELF REMOVE] book or book.id is missing — aborting')
      return
    }

    const updated = books.filter(b => b.id !== book.id)
    console.log('FILTER RESULT — before:', books.length, 'after:', updated.length)

    setBooks(updated)
    localStorage.setItem('books', JSON.stringify(sanitizeForStorage(updated)))

    try {
      await deleteBook(book.id)
      console.log('[INDEXEDDB DELETE SUCCESS] id:', book.id, '| title:', book.title)
    } catch (err) {
      console.error('[INDEXEDDB DELETE FAILED] id:', book.id, '| error:', err.message || err)
    }
  }

  const handleDeleteBook = () => {
    console.log('[DEVICE DELETE] disabled — testing shelf removal only')
  }

  const fileInputRef = useRef(null)

  const handleFilePick = () => {
    if (isImporting) {
      console.log('[FAB] import in progress — ignoring click')
      return
    }
    console.log('[FAB] opening file picker')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    console.log('[IMPORT START] handleFileChange fired | isImporting:', isImporting)

    if (isImporting) {
      console.warn('[IMPORT] already importing — skipping concurrent call')
      return
    }

    setIsImporting(true)

    try {
      const inputEl = fileInputRef.current
      if (!inputEl) {
        console.error('[IMPORT] input element not found')
        return
      }
      const files = inputEl.files
      if (!files || files.length === 0) {
        console.log('[IMPORT START] no files selected — aborting')
        return
      }
      console.log('[FILE SELECTED] count:', files.length, '| names:', Array.from(files).map(f => f.name))

      const fileArray = Array.from(files)
      const settled = await Promise.allSettled(fileArray.map(parseBook))

      const imported = []

      for (let i = 0; i < settled.length; i++) {
        const s = settled[i]
        const fileName = fileArray[i].name
        if (s.status === 'fulfilled') {
          console.log('[FB2 PARSED] file:', fileName, '| title:', s.value.title, '| id:', s.value.id, '| cover:', !!s.value.cover)

          const bookForDB = {
            ...s.value,
            currentPage: 0
          }

          try {
            await saveBook(bookForDB)
            console.log('[INDEXEDDB SAVE SUCCESS] id:', bookForDB.id, '| title:', bookForDB.title)
          } catch (err) {
            console.error('[INDEXEDDB SAVE FAILED] id:', bookForDB.id, '| error:', err.message || err)
          }

          imported.push(s.value)
        } else {
          console.error('[PARSE FAILED] file:', fileName, '| error:', s.reason?.reason || s.reason?.message || s.reason)
        }
      }

      if (imported.length) {
        console.log('[BOOK ADDED] imported', imported.length, 'books — reloading from IndexedDB')

        try {
          const allBooks = await getAllBooks()
          console.log('[TOTAL BOOKS] IndexedDB count:', allBooks ? allBooks.length : 0)
          if (allBooks && allBooks.length) {
            setBooks(allBooks)
            localStorage.setItem('books', JSON.stringify(sanitizeForStorage(allBooks)))
            console.log('[BOOK ADDED] state updated from IndexedDB — total books:', allBooks.length)
          } else {
            console.warn('[BOOK ADDED] getAllBooks returned empty — falling back to merge')
            setBooks(prev => {
              const merged = [...imported, ...prev]
              localStorage.setItem('books', JSON.stringify(sanitizeForStorage(merged)))
              return merged
            })
          }
        } catch (reloadErr) {
          console.error('[BOOK ADDED] getAllBooks failed:', reloadErr)
          setBooks(prev => {
            const merged = [...imported, ...prev]
            localStorage.setItem('books', JSON.stringify(sanitizeForStorage(merged)))
            return merged
          })
        }
      } else {
        console.warn('[BOOK ADDED] no books were successfully imported')
      }

      console.log('[IMPORT COMPLETE]')
    } catch (err) {
      console.error('[IMPORT CRASH] unhandled error:', err)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
      setInputKey(prev => prev + 1)
    }
  }

  const readingProgress = JSON.parse(localStorage.getItem('readingProgress') || '{}')
  const readingCount = Object.values(readingProgress).filter(item => item.isStarted === true).length

  return (
    <div className="home-page">

      <div className="dashboard-card">

        <div className="paw-container">
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'8%', left:'6%', width:'18px', opacity:'0.12', transform:'rotate(-15deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'4%', left:'52%', width:'16px', opacity:'0.10', transform:'rotate(25deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'14%', left:'80%', width:'14px', opacity:'0.13', transform:'rotate(-40deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'35%', left:'3%', width:'20px', opacity:'0.10', transform:'rotate(60deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'42%', left:'70%', width:'18px', opacity:'0.11', transform:'rotate(-5deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'60%', left:'15%', width:'16px', opacity:'0.14', transform:'rotate(35deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'55%', left:'85%', width:'15px', opacity:'0.12', transform:'rotate(-65deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'78%', left:'8%', width:'19px', opacity:'0.10', transform:'rotate(10deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'85%', left:'55%', width:'14px', opacity:'0.13', transform:'rotate(-25deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'50%', left:'42%', width:'12px', opacity:'0.11', transform:'rotate(80deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'22%', left:'35%', width:'13px', opacity:'0.10', transform:'rotate(-50deg)' }} />
          <img src="/assets/paw.png" alt="" className="paw-print" style={{ top:'70%', left:'40%', width:'17px', opacity:'0.14', transform:'rotate(45deg)' }} />
        </div>

        <img 
          src="/assets/paciuk.png" 
          alt="Paciuk mascot" 
          className="mascot-image" 
        />

        <div className="dashboard-info">
          <span className="dashboard-title">
            <span className="logo-paciuk">Paciuk</span>
            <span className="logo-reader">Reader</span>
          </span>
          <span className="dashboard-subtitle">
            {books.length} книг • {readingCount} читаются сейчас
          </span>
        </div>

      </div>

      <div className="search-wrapper">
        <SearchBar />
      </div>

      <div className="featured-section">

        <div className="featured-card">

          <div className="featured-decoration-1"></div>
          <div className="featured-decoration-2"></div>

          <div className="featured-cover">
            <img
              src={activeBook ? activeBook.cover : "https://covers.openlibrary.org/b/id/8259296-L.jpg"}
              alt="book"
            />
          </div>

          <div className="featured-info">

            <span className="featured-title">
              {activeBook ? activeBook.title : 'Мизери'}
            </span>

            <span className="featured-author">
              {activeBook ? activeBook.author : 'Стивен Кинг'}
            </span>

            <span className="featured-progress-text">
              {activeBook ? `${activeBook.progress}% прочитано` : '42% прочитано'}
            </span>

            <div className="featured-progress">
              <div className="featured-progress-fill" style={activeBook ? { width: `${activeBook.progress}%` } : undefined}></div>
            </div>

            <button className="featured-button">
              Продолжить чтение
            </button>

          </div>

        </div>

      </div>

      <div className="collection-header">

        <h2 className="collection-title">
          Коллекция
        </h2>

        <span className="collection-count">
          {books.length} книг
        </span>

      </div>

      <div className="books-grid">

        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onBookClick(book)}
            onRemove={handleRemoveBook}
            onDelete={handleDeleteBook}
          />
        ))}

      </div>

      <input
        key={inputKey}
        ref={fileInputRef}
        type="file"
        accept=".fb2,.epub,.txt,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />

      <button className="fab-add" onClick={handleFilePick}>
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <BottomNav activePage={activePage} onNavigate={onNavigate} />

    </div>
  )
}
