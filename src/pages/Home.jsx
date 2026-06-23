import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { parseBook } from '../utils/BookParser'
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

  const handleRemoveBook = (book) => {
    console.log('')
    console.log('=== SHELF REMOVE DEBUG ===')
    console.log('BOOKS BEFORE:', JSON.stringify(books.map(b => ({ id: b.id, title: b.title }))))
    console.log('SELECTED ID:', book?.id, '| SELECTED TITLE:', book?.title, '| book is:', typeof book, book === null ? 'null' : 'object')

    if (!book || !book.id) {
      console.error('[SHELF REMOVE] book or book.id is missing — aborting')
      return
    }

    const updated = books.filter(b => b.id !== book.id)
    console.log('FILTER RESULT — before:', books.length, 'after:', updated.length)

    console.log('BOOKS AFTER:', JSON.stringify(updated.map(b => ({ id: b.id, title: b.title }))))
    console.log('=== END SHELF REMOVE ===')
    console.log('')

    setBooks(updated)
    localStorage.setItem('books', JSON.stringify(sanitizeForStorage(updated)))
  }

  const handleDeleteBook = () => {
    console.log('[DEVICE DELETE] disabled — testing shelf removal only')
  }

  const fileInputRef = useRef(null)

  const handleFilePick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    try {
      console.log('[IMPORT START] handleFileChange fired')
      const input = e.currentTarget
      const files = input.files
      if (!files || files.length === 0) {
        console.log('[IMPORT START] no files selected — aborting')
        return
      }
      console.log('[FILE SELECTED] count:', files.length, '| names:', Array.from(files).map(f => f.name))

      const fileArray = Array.from(files)
      console.log('[IMPORT] calling parseBook on', fileArray.length, 'files')
      const settled = await Promise.allSettled(fileArray.map(parseBook))
      console.log('[IMPORT] allSettled complete — results:', settled.length)

      const imported = []

      for (let i = 0; i < settled.length; i++) {
        const s = settled[i]
        const fileName = fileArray[i].name
        if (s.status === 'fulfilled') {
          console.log('[FB2 PARSED] file:', fileName, '| title:', s.value.title, '| id:', s.value.id, '| cover:', !!s.value.cover)
          imported.push(s.value)
        } else {
          console.error('[PARSE FAILED] file:', fileName, '| error:', s.reason?.message || s.reason)
        }
      }

      if (imported.length) {
        console.log('[BOOK ADDED] imported', imported.length, 'books — updating state')
        setBooks(prev => {
          const merged = [...imported, ...prev]
          localStorage.setItem('books', JSON.stringify(sanitizeForStorage(merged)))
          console.log('[BOOK ADDED] state updated — total books:', merged.length)
          return merged
        })
      } else {
        console.warn('[BOOK ADDED] no books were successfully imported')
      }

      input.value = ''
      console.log('[IMPORT END]')
    } catch (err) {
      console.error('[IMPORT CRASH] unhandled error:', err)
    }
  }

  const readingCount = books.filter(b => b.isStarted).length

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
              src="https://covers.openlibrary.org/b/id/8259296-L.jpg"
              alt="book"
            />
          </div>

          <div className="featured-info">

            <span className="featured-title">
              Мизери
            </span>

            <span className="featured-author">
              Стивен Кинг
            </span>

            <span className="featured-progress-text">
              42% прочитано
            </span>

            <div className="featured-progress">
              <div className="featured-progress-fill"></div>
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
