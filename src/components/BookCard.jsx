import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Archive, Trash2 } from 'lucide-react'
import '../styles/bookcard.css'

export default function BookCard({ book, onClick, onRemove, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 })
  const menuRef = useRef(null)
  const btnRef = useRef(null)
  const cardRef = useRef(null)

  const { cover, title, author, progress, isStarted } = book || {}
  const hasMenu = onRemove || onDelete

  const closeMenu = useCallback(() => setShowMenu(false), [])

  useEffect(() => {
    if (!showMenu) return
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [showMenu, closeMenu])

  const handleMenuClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPopupPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right
      })
    }
    setShowMenu(prev => !prev)
  }

  const handleCardClick = () => {
    if (showMenu) {
      closeMenu()
      return
    }
    if (onClick) onClick()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    closeMenu()
    setConfirmAction('remove')
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    closeMenu()
    setConfirmAction('delete')
  }

  const handleConfirmYes = (e) => {
    e.stopPropagation()
    console.log('[BOOKCARD] confirm yes — action:', confirmAction, '| onRemove:', !!onRemove, '| onDelete:', !!onDelete, '| book.id:', book?.id, '| book.title:', book?.title)
    try {
      if (confirmAction === 'remove') {
        if (onRemove) {
          console.log('[BOOKCARD] calling onRemove(book)')
          onRemove(book)
        } else {
          console.error('[BOOKCARD] onRemove is null/undefined')
        }
      } else if (confirmAction === 'delete') {
        if (onDelete) {
          console.log('[BOOKCARD] calling onDelete(book)')
          onDelete(book)
        } else {
          console.error('[BOOKCARD] onDelete is null/undefined')
        }
      } else {
        console.error('[BOOKCARD] unknown confirmAction:', confirmAction)
      }
    } catch (err) {
      console.error('[BOOKCARD] error in handleConfirmYes:', err)
    }
    setConfirmAction(null)
  }

  const handleConfirmNo = (e) => {
    e.stopPropagation()
    setConfirmAction(null)
  }

  return (
    <div className="book-card" ref={cardRef} onClick={handleCardClick}>

      <div className="book-card-cover">
        {cover ? (
          <img src={cover} alt={title} className="book-card-image" />
        ) : (
          <div className="book-card-image-placeholder">
            <span className="book-card-placeholder-text">{title?.charAt(0) || '?'}</span>
          </div>
        )}
        {isStarted && (
          <div className="book-progress-ring">
            <div className="book-progress-inner">{progress || 0}%</div>
          </div>
        )}
      </div>

      <div className="book-card-info">
        <span className="book-card-title">{title}</span>
        <span className="book-card-author">{author}</span>
      </div>

      {hasMenu && (
        <button
          ref={btnRef}
          className="book-card-menu-btn"
          onClick={handleMenuClick}
          aria-label="Меню книги"
        >
          ⋮
        </button>
      )}

      {hasMenu && showMenu && createPortal(
        <div
          className="book-card-menu-popup"
          ref={menuRef}
          style={{ top: popupPos.top, right: popupPos.right }}
        >
          <button className="book-card-menu-item" onClick={handleRemove}>
            <Archive size={16} strokeWidth={1.8} className="book-card-menu-icon" />
            <span>Убрать с полки</span>
          </button>
          <div className="book-card-menu-divider" />
          <button className="book-card-menu-item book-card-menu-item-danger" onClick={handleDelete}>
            <Trash2 size={16} strokeWidth={1.8} className="book-card-menu-icon" />
            <span>Удалить с устройства</span>
          </button>
        </div>,
        document.body
      )}

      {confirmAction && createPortal(
        <div className="book-card-confirm-overlay" onClick={handleConfirmNo}>
          <div className="book-card-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="book-card-confirm-title">
              {confirmAction === 'remove' ? 'Убрать с полки' : 'Удалить с устройства'}
            </div>
            <div className="book-card-confirm-text">
              {confirmAction === 'remove'
                ? 'Убрать книгу с полки?'
                : 'Удалить книгу с устройства навсегда?'}
            </div>
            <div className="book-card-confirm-actions">
              <button className="book-card-confirm-btn book-card-confirm-cancel" onClick={handleConfirmNo}>
                Отмена
              </button>
              <button className="book-card-confirm-btn book-card-confirm-delete" onClick={(e) => {
                console.log('CONFIRM DELETE CLICKED — action:', confirmAction)
                handleConfirmYes(e)
              }}>
                Удалить
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
