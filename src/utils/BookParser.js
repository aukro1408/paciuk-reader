async function readText(blob) {
  const text = await blob.text()
  return text
}

async function readAsArrayBuffer(file) {
  const buffer = await file.arrayBuffer()
  return buffer
}

function decodeWindows1251(buffer) {
  const bytes = new Uint8Array(buffer)
  let result = ''
  const map = {
    0xA8: 0x0401, 0xB8: 0x0451,  // Ё ё
    0x80: 0x0402, 0x81: 0x0403, 0x82: 0x201A, 0x83: 0x0453,
    0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
    0x88: 0x20AC, 0x89: 0x2030, 0x8A: 0x0409, 0x8B: 0x2039,
    0x8C: 0x040A, 0x8D: 0x040C, 0x8E: 0x040B, 0x8F: 0x040F,
    0x90: 0x0452, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
    0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x99: 0x2122, 0x9A: 0x0459, 0x9B: 0x203A, 0x9C: 0x045A,
    0x9D: 0x045C, 0x9E: 0x045B, 0x9F: 0x045F,
    0xA0: 0x00A0, 0xA1: 0x040E, 0xA2: 0x045E, 0xA3: 0x0408,
    0xA4: 0x00A4, 0xA5: 0x0490, 0xA6: 0x0491, 0xA7: 0x00A7,
    0xAA: 0x00AA, 0xAB: 0x00AB, 0xAC: 0x00AC, 0xAD: 0x00AD,
    0xAE: 0x00AE, 0xAF: 0x040F,
    0xB0: 0x00B0, 0xB1: 0x00B1, 0xB2: 0x0406, 0xB3: 0x0456,
    0xB4: 0x0491, 0xB5: 0x00B5, 0xB6: 0x00B6, 0xB7: 0x00B7,
    0xB9: 0x2116, 0xBA: 0x00BA, 0xBB: 0x00BB, 0xBC: 0x045A,
    0xBD: 0x045C, 0xBE: 0x0455, 0xBF: 0x0457,
  }
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i]
    if (code < 128) {
      result += String.fromCharCode(code)
    } else if (code >= 0xC0 && code <= 0xFF) {
      result += String.fromCharCode(0x0350 + code)
    } else {
      result += map[code] !== undefined ? String.fromCharCode(map[code]) : '\ufffd'
    }
  }
  return result
}

function detectEncoding(xmlText) {
  const match = xmlText.match(/<\?xml[^>]*encoding\s*=\s*["']([^"']+)["'][^>]*\?>/i)
  if (!match) return 'utf-8'
  const enc = match[1].toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (enc === 'windows-1251' || enc === 'cp1251' || enc === '1251') return 'windows-1251'
  return 'utf-8'
}

function first(parent, tag) {
  if (!parent) return null
  const list = parent.getElementsByTagName(tag)
  return list.length > 0 ? list[0] : null
}

function text(parent, tag) {
  const el = tag ? first(parent, tag) : parent
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''
}

function all(parent, tag) {
  if (!parent) return []
  return Array.from(parent.getElementsByTagName(tag))
}

function extractText(node, parts = []) {
  for (const child of node.childNodes) {
    if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase()

      if (tag === 'p') {
        const txt = child.textContent
          .replace(/\s+/g, ' ')
          .trim()

        if (txt) parts.push(txt)
      }

      extractText(child, parts)
    }
  }

  return parts
}

async function readFB2File(file) {
  const buffer = await readAsArrayBuffer(file)
  // Try UTF-8 first by reading the first few bytes to check for BOM or valid UTF-8
  const bytes = new Uint8Array(buffer)
  // Check for UTF-8 BOM
  const hasBOM = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF
  const offset = hasBOM ? 3 : 0

  // Read first 1024 bytes as Latin-1 to inspect XML declaration
  const headBytes = bytes.slice(offset, Math.min(offset + 2048, bytes.length))
  let headStr = ''
  for (let i = 0; i < headBytes.length; i++) {
    headStr += String.fromCharCode(headBytes[i])
  }

  const enc = detectEncoding(headStr)

  if (enc === 'windows-1251') {
    const fullStr = decodeWindows1251(bytes)
    return fullStr
  }

  // Default: use TextDecoder or blob.text() with UTF-8
  const blob = new Blob([buffer], { type: 'text/plain' })
  return readText(blob)
}

async function parseFB2(file) {
  console.log('>>> FB2 PARSER CALLED — file:', file.name)

  const raw = await readFB2File(file)
  console.log('[FB2] File size:', raw.length, 'bytes')
  console.log('[FB2] First 500 chars:', raw.substring(0, 500))

  const cleaned = raw.replace(/<\?xml[^>]*\?>/i, '')
  let doc
  try {
    doc = new DOMParser().parseFromString(cleaned, 'text/xml')
  } catch (e) {
    throw new Error('DOMParser failed: ' + e.message)
  }

  if (!doc) throw new Error('DOMParser returned null')
  console.log('[FB2] documentElement:', doc.documentElement?.tagName)

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    console.error('[FB2] XML parsererror:', parseError.textContent)
    throw new Error('XML parse error: ' + parseError.textContent)
  }

  if (doc.documentElement?.tagName?.toLowerCase() === 'parsererror') {
    const msg = doc.documentElement.textContent || 'unknown parse error'
    console.error('[FB2] documentElement is parsererror:', msg)
    throw new Error('XML parse error: ' + msg)
  }

  if (!doc.documentElement) {
    throw new Error('XML document has no documentElement — empty or invalid file')
  }

  const desc = first(doc, 'description')
  console.log('[FB2] description found via getElementsByTagName:', !!desc)

  if (!desc) {
    const desc2 = doc.querySelector('description')
    console.log('[FB2] description found via querySelector:', !!desc2)
    if (!desc2) throw new Error('No <description> found in FB2 document')
    throw new Error('<description> not found — not a valid FB2 file')
  }

  const info = first(desc, 'title-info')
  console.log('[FB2] title-info found:', !!info)
  if (!info) throw new Error('No <title-info> found in <description>')

  const title = text(info, 'book-title')
  console.log('[FB2] book-title:', JSON.stringify(title))
  if (!title) throw new Error('book-title is empty — aborting import')

  const authorEl = first(info, 'author')
  const firstN = text(authorEl, 'first-name')
  const middleN = text(authorEl, 'middle-name')
  const lastN = text(authorEl, 'last-name')
  const author = [firstN, middleN, lastN].filter(Boolean).join(' ')
  console.log('[FB2] author parts:', { firstN, middleN, lastN, combined: author })
  if (!author) throw new Error('No author found in FB2 metadata')

  const annotationEl = first(info, 'annotation')
  let description = ''
  if (annotationEl) {
    const ps = all(annotationEl, 'p')
    description = ps.length > 0
      ? ps.map(p => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n')
      : annotationEl.textContent.replace(/\s+/g, ' ').trim()
  }
  console.log('[FB2] description length:', description.length)

  const body = doc.getElementsByTagName('body')[0]
  if (!body) throw new Error('No <body> tag found in FB2 document')

  const parts = extractText(body)
  const content = parts.join('\n\n')

  console.log('[FB2 DEBUG]', content.substring(0, 5000))

  let cover = null
  const coverpage = first(info, 'coverpage')
  console.log('[FB2] coverpage:', !!coverpage)
  if (coverpage) {
    const imageEl = first(coverpage, 'image')
    console.log('[FB2] image in coverpage:', !!imageEl)
    if (imageEl) {
      let href =
        imageEl.getAttribute('l:href') ||
        imageEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
        imageEl.getAttribute('href') ||
        ''
      console.log('[FB2] raw href:', href)
      href = href.replace(/^#/, '').trim()
      console.log('[FB2] cleaned href:', href)

      if (href) {
        const binaries = all(doc, 'binary')
        console.log('[FB2] binaries found:', binaries.length)
        for (const bin of binaries) {
          const id = bin.getAttribute('id') || ''
          if (id === href || id.replace(/\.\w+$/, '') === href.replace(/\.\w+$/, '')) {
            const ct = bin.getAttribute('content-type') || 'image/jpeg'
            const b64 = bin.textContent.replace(/\s/g, '')
            console.log('[FB2] BINARY MATCHED id:', id, 'content-type:', ct, 'b64 length:', b64.length)
            cover = `data:${ct};base64,${b64}`
            break
          }
        }
        if (!cover) {
          console.warn('[FB2] No matching binary for href:', href)
        }
      }
    }
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  const result = {
    id,
    cover,
    title,
    author,
    description,
    content,
    pages: '0',
    progress: 0,
    isStarted: false,
    isFinished: false,
    fileContent: raw,
    fileType: 'fb2',
    filePath: file.name,
    fileName: file.name
  }
  console.log('[FB2] FINAL BOOK OBJECT id:', result.id, '| title:', result.title, '| filePath:', result.filePath, '| content length:', result.content.length)
  return result
}

async function parseEPUB(file) {
  console.log('>>> EPUB PARSER CALLED — file:', file.name)
  throw new Error('EPUB parsing not yet implemented')
}

async function parseTXT(file) {
  console.log('>>> TXT PARSER CALLED — file:', file.name)
  const raw = await readText(file)
  const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  return {
    id,
    cover: null,
    title: name,
    author: 'Unknown Author',
    description: '',
    content: raw,
    pages: '0',
    progress: 0,
    isStarted: false,
    isFinished: false,
    fileContent: raw,
    fileType: 'txt',
    filePath: file.name,
    fileName: file.name
  }
}

async function parsePDF(file) {
  console.log('>>> PDF PARSER CALLED — file:', file.name)
  throw new Error('PDF parsing not yet implemented')
}

export async function parseBook(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  console.log('[parseBook] File:', file.name, '| Extracted extension:', JSON.stringify(ext))

  switch (ext) {
    case 'fb2':
      console.log('[parseBook] Routing to parseFB2')
      return parseFB2(file)
    case 'epub':
      console.log('[parseBook] Routing to parseEPUB')
      return parseEPUB(file)
    case 'txt':
      console.log('[parseBook] Routing to parseTXT')
      return parseTXT(file)
    case 'pdf':
      console.log('[parseBook] Routing to parsePDF')
      return parsePDF(file)
    default:
      console.log('[parseBook] No match for extension "' + ext + '" — falling to default (TXT)')
      return parseTXT(file)
  }
}
