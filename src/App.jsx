import { useState } from 'react'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import BookDetail from './pages/BookDetail'

function App() {
  const [page, setPage] = useState('home')
  const [selectedBook, setSelectedBook] = useState(null)

  const navigate = (to) => setPage(to)

  const handleBookClick = (book) => {
    setSelectedBook(book)
    setPage('detail')
  }

  const handleBack = () => {
    setPage('home')
  }

  return (
    <>
      {page === 'home' && <Home onBookClick={handleBookClick} activePage={page} onNavigate={navigate} />}
      {page === 'favorites' && <Favorites onBookClick={handleBookClick} activePage={page} onNavigate={navigate} />}
      {page === 'detail' && selectedBook && (
        <BookDetail book={selectedBook} onBack={handleBack} />
      )}
    </>
  )
}

export default App