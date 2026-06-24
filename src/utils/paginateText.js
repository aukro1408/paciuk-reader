export function paginateText(text, options = {}) {
  if (!text) return []

  const {
    containerWidth = window.innerWidth - 40,
    containerHeight = window.innerHeight - 180,
    fontSize = 20,
    lineHeight = 1.8
  } = options

  // создаем скрытый div для измерений
  const probe = document.createElement('div')

  Object.assign(probe.style, {
    position: 'absolute',
    visibility: 'hidden',
    left: '-9999px',
    top: '0',
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    overflow: 'hidden',
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    fontFamily: 'Arial, sans-serif',
    padding: '0',
    margin: '0',
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  })

  document.body.appendChild(probe)

  const words = text.split(/\s+/)
  const pages = []

  let start = 0

  while (start < words.length) {
    let low = start
    let high = words.length
    let best = start

    // binary search — ищем максимум слов, которые помещаются
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)

      probe.textContent = words.slice(start, mid).join(' ')

      if (probe.scrollHeight <= containerHeight) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    // защита от зависания
    if (best === start) {
      best = start + 1
    }

    pages.push(words.slice(start, best).join(' '))

    start = best
  }

  document.body.removeChild(probe)

  return pages
}