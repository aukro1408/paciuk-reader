import { useState } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'
import '../styles/bookdetail.css'

export default function BookDetail({ book, onBack }) {
  const [isFav, setIsFav] = useState(false)

  const coverUrl = book.cover?.replace('-M', '-L') || book.cover
  console.log("BOOK COVER:", book.cover)
  console.log("FINAL COVER URL:", coverUrl)
  const pct = book.progress || 42

  return (
    <div className="detail-page">

      <div className="hero">

        <img src={coverUrl} alt="" className="background-cover" />

        <div className="content">

          <div className="detail-top-bar">
            <button className="detail-top-btn" onClick={onBack}>
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <button
              className="detail-top-btn"
              onClick={() => setIsFav(!isFav)}
            >
              <Heart
                size={22}
                strokeWidth={2.5}
                fill={isFav ? '#FF3B30' : 'none'}
                color={isFav ? '#FF3B30' : '#666'}
              />
            </button>
          </div>

          <div className="detail-cover-section">
            <div className="detail-cover-wrapper">
              <img src={coverUrl} alt={book.title} className="detail-cover" />
            </div>
          </div>

        </div>

      </div>

      <div className="detail-body">

        <h1 className="detail-title">{book.title}</h1>
        <span className="detail-author">{book.author}</span>

        <div className="detail-meta">
          <div className="detail-pill">
            <span>📖</span>
            <span>{book.pages || '320'} стр</span>
          </div>
        </div>

        <div className="detail-progress-section">
          <div className="detail-progress-left">
            <div className="detail-progress-label">Прогресс чтения</div>
            <div className="detail-progress-sub">Продолжайте с того же места</div>
          </div>
          <div className="detail-progress-ring">
            <div
              className="detail-progress-ring-fill"
              style={{
                background: `conic-gradient(#3D8BFF ${pct}%, #e8ecf0 ${pct}%)`
              }}
            />
            <div className="detail-progress-inner">
              <span className="detail-progress-pct">{pct}%</span>
            </div>
          </div>
        </div>

        <div className="detail-description-card">
          <div className="detail-description-text">
            {book.description || 'Описание недоступно.'}
          </div>
        </div>

      </div>

      <div className="detail-bottom">
        <button className="detail-continue-btn">Продолжить чтение</button>
      </div>

    </div>
  )
}
