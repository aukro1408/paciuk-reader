import { useRef } from 'react'

export function useReaderSwipe({ onNext, onPrev, onToggleUI }) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY

    const diffX = endX - touchStartX.current
    const diffY = endY - touchStartY.current

    // если движение слишком вертикальное → игнор
    if (Math.abs(diffY) > Math.abs(diffX)) {
      return
    }

    // свайп вправо → назад
    if (diffX > 70) {
      onPrev?.()
      return
    }

    // свайп влево → вперед
    if (diffX < -70) {
      onNext?.()
      return
    }

    // если почти не двигал пальцем → считаем tap
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
      onToggleUI?.()
    }
  }

  return {
    handleTouchStart,
    handleTouchEnd
  }
}