import '../styles/home.css'
import SearchBar from '../components/SearchBar'
import BookCard from '../components/BookCard'
import BottomNav from '../components/BottomNav'

const books = [
  {
    cover:'https://covers.openlibrary.org/b/id/8259296-M.jpg',
    title:'Мизери',
    author:'Стивен Кинг',
    description:'Знаменитый роман Стивена Кинга о писателе, который попадает в плен к своей обезумевшей поклоннице. Заставит ли она его воскресить любимую героиню или уничтожит автора вместе с ней? Мрак, безумие и безграничная власть одержимости.',
    rating:'4.6',
    pages:'398',
    language:'Russian',
    progress:42
  },
  {
    cover:'https://covers.openlibrary.org/b/id/12947486-M.jpg',
    title:'Мастер и Маргарита',
    author:'Михаил Булгаков',
    description:'В Москву 1930-х годов прибывает загадочный иностранец — Воланд, который оказывается самим дьяволом. Вместе со своей свитой он устраивает череду невероятных событий, обнажая человеческие пороки и переплетая судьбы москвичей с трагической историей Мастера и его возлюбленной Маргариты.',
    rating:'4.8',
    pages:'480',
    language:'Russian',
    progress:42
  },
  {
    cover:'https://covers.openlibrary.org/b/id/240726-M.jpg',
    title:'1984',
    author:'George Orwell',
    description:'Роман-антиутопия Джорджа Оруэлла, рисующий тоталитарное общество будущего, где Большой Брат следит за каждым шагом граждан. Главный герой Уинстон Смит пытается сохранить человеческое достоинство и любовь в мире, где мыслепреступление карается смертью.',
    rating:'4.7',
    pages:'328',
    language:'English',
    progress:42
  }
]

export default function Home({ onBookClick }) {
  return (
    <div className="home-page">

      <div className="dashboard-card">

        <img 
          src="/assets/paciuk.png" 
          alt="Paciuk mascot" 
          className="mascot-image" 
        />

        <div className="dashboard-info">
          <span className="dashboard-title">
            Paciuk Reader
          </span>
          <span className="dashboard-subtitle">
            6 книг • 2 читаются сейчас
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
          6 книг
        </span>

      </div>

      <div className="books-grid">

        {books.map((book,index)=>(
          <BookCard
            key={index}
            cover={book.cover}
            title={book.title}
            author={book.author}
            progress={book.progress}
            onClick={() => onBookClick(book)}
          />
        ))}

      </div>

      <BottomNav />

    </div>
  )
}
