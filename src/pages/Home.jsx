import '../styles/home.css'
import SearchBar from '../components/SearchBar'
import BookCard from '../components/BookCard'
import BottomNav from '../components/BottomNav'

const books = [
  {
    cover:'https://covers.openlibrary.org/b/id/8259296-M.jpg',
    title:'Мизери',
    author:'Стивен Кинг'
  },
  {
    cover:'https://covers.openlibrary.org/b/id/12947486-M.jpg',
    title:'Мастер и Маргарита',
    author:'Михаил Булгаков'
  },
  {
    cover:'https://covers.openlibrary.org/b/id/240726-M.jpg',
    title:'1984',
    author:'George Orwell'
  }
]

export default function Home() {
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
          />
        ))}

      </div>

      <BottomNav />

    </div>
  )
}
