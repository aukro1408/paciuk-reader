import '../styles/bookcard.css'

export default function BookCard({ cover, title, author, progress }) {
  return (
    <div className="book-card">

      <div className="book-card-cover">
        <img
          src={cover}
          alt={title}
          className="book-card-image"
        />
        <div className="book-progress-ring">
          <div className="book-progress-inner">
            {progress || 42}%
          </div>
        </div>
      </div>

      <div className="book-card-info">
        <span className="book-card-title">{title}</span>
        <span className="book-card-author">{author}</span>
      </div>

    </div>
  )
}
