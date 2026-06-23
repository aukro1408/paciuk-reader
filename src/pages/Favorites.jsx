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

      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '3%', left: '6%', width: 110, transform: 'rotate(-20deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '2%', right: '10%', width: 85, transform: 'rotate(30deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '18%', left: '2%', width: 130, transform: 'rotate(-5deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '15%', right: '3%', width: 95, transform: 'rotate(50deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '35%', left: '12%', width: 120, transform: 'rotate(10deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '40%', right: '8%', width: 100, transform: 'rotate(-35deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '55%', left: '4%', width: 90, transform: 'rotate(25deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '58%', right: '15%', width: 115, transform: 'rotate(-15deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '75%', left: '18%', width: 105, transform: 'rotate(-40deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '78%', right: '5%', width: 80, transform: 'rotate(15deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '92%', left: '8%', width: 100, transform: 'rotate(5deg)' }} />
      <img src="/assets/paw.png" alt="" className="fav-paw" style={{ top: '95%', right: '12%', width: 75, transform: 'rotate(-25deg)' }} />

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
              book={book}
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
