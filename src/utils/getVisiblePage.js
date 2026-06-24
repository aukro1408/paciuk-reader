export function createProbe(containerWidth, containerHeight, fontSize, lineHeight) {
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
    lineHeight: String(lineHeight),
    fontFamily: 'Arial, sans-serif',
    padding: '0',
    margin: '0',
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  })
  document.body.appendChild(probe)
  return probe
}

export function destroyProbe(probe) {
  if (probe?.parentNode) {
    probe.parentNode.removeChild(probe)
  }
}

export function calculatePageForward(words, startWord, probe) {
  const len = words.length
  if (len === 0) return { start: 0, end: 0 }
  if (startWord >= len) return { start: len, end: len }

  const containerHeight = probe.clientHeight
  let low = startWord + 1
  let high = len
  let best = startWord + 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    probe.textContent = words.slice(startWord, mid).join(' ')

    if (probe.scrollHeight <= containerHeight) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  if (best === startWord) {
    best = Math.min(startWord + 1, len)
  }

  return { start: startWord, end: best }
}

export function calculatePageBackward(words, endWord, probe) {
  if (endWord <= 0) return { start: 0, end: 0 }

  const containerHeight = probe.clientHeight
  let low = 0
  let high = endWord - 1
  let best = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    probe.textContent = words.slice(mid, endWord).join(' ')

    if (probe.scrollHeight <= containerHeight) {
      best = mid
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  return { start: best, end: endWord }
}
