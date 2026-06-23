import { useState } from 'react'
import { Heart } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import BookCard from '../components/BookCard'
import '../styles/favorites.css'

const books = [
  {
    cover:'https://covers.openlibrary.org/b/id/8259296-M.jpg',
    title:'Мизери',
    author:'Стивен Кинг',
    description:'Знаменитый роман Стивена Кинга о писателе, который попадает в плен к своей обезумевшей поклоннице. Заставит ли она его воскресить любимую героиню или уничтожит автора вместе с ней? Мрак, безумие и безграничная власть одержимости.'
  },
  {
    cover:'https://covers.openlibrary.org/b/id/12947486-M.jpg',
    title:'Мастер и Маргарита',
    author:'Михаил Булгаков',
    description:'В Москву 1930-х годов прибывает загадочный иностранец — Воланд, который оказывается самим дьяволом. Вместе со своей свитой он устраивает череду невероятных событий, обнажая человеческие пороки.'
  },
  {
    cover:'https://covers.openlibrary.org/b/id/240726-M.jpg',
    title:'1984',
    author:'George Orwell',
    description:'Роман-антиутопия Джорджа Оруэлла, рисующий тоталитарное общество будущего, где Большой Брат следит за каждым шагом граждан. Главный герой Уинстон Смит пытается сохранить человеческое достоинство.'
  }
]

export default function Favorites({ onBookClick, activePage, onNavigate }) {
  const [sheetBook, setSheetBook] = useState(null)

  const openSheet = (book) => {
    setSheetBook(book)
  }

  const closeSheet = () => {
    setSheetBook(null)
  }

  return (
    <div className="fav-page">

      <div className="fav-hero">

        <div className="fav-hero-icon">
          <Heart size={26} fill="white" color="white" strokeWidth={2.5} />
        </div>

        <div className="fav-hero-text">
          <span className="fav-hero-title">Избранное</span>
          <span className="fav-hero-subtitle">Любимые книги всегда под рукой</span>
        </div>

      </div>

      <div className="fav-grid">
        {books.map((book, index) => (
          <div key={index} className="fav-card-wrap">
            <BookCard
              cover={book.cover}
              title={book.title}
              author={book.author}
              onClick={() => openSheet(book)}
            />
            <button
              className="fav-card-heart"
              onClick={(e) => { e.stopPropagation() }}
            >
              <Heart size={14} fill="#FF3B30" color="#FF3B30" />
            </button>
          </div>
        ))}
      </div>

      <div
        className={`sheet-overlay ${sheetBook ? 'sheet-overlay--open' : ''}`}
        onClick={closeSheet}
      />

      <div className={`bottom-sheet ${sheetBook ? 'bottom-sheet--open' : ''}`}>
        {sheetBook && (
          <>
            <div className="sheet-handle" />

            <div className="sheet-body">
              <div className="sheet-cover">
                <img src={sheetBook.cover} alt={sheetBook.title} />
              </div>
              <div className="sheet-info">
                <h2 className="sheet-title">{sheetBook.title}</h2>
                <span className="sheet-author">{sheetBook.author}</span>
                <p className="sheet-desc">{sheetBook.description}</p>
              </div>
            </div>

            <div className="sheet-actions">
              <button className="sheet-read-btn">Читать сейчас</button>
              <button className="sheet-remove-btn">Удалить из избранного</button>
            </div>
          </>
        )}
      </div>

      <BottomNav activePage={activePage} onNavigate={onNavigate} />

    </div>
  )
}
