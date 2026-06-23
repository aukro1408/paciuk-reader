import { useState } from 'react'
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'

function App() {
  const [page, setPage] = useState('home')
  const [selectedBook, setSelectedBook] = useState(null)

  const handleBookClick = (book) => {
    setSelectedBook(book)
    setPage('detail')
  }

  const handleBack = () => {
    setPage('home')
  }

  return (
    <>
      {page === 'home' && <Home onBookClick={handleBookClick} />}
      {page === 'detail' && selectedBook && (
        <BookDetail book={selectedBook} onBack={handleBack} />
      )}
    </>
  )
}

export default App