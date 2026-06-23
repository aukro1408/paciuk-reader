const DB_NAME = 'paciukReaderDB'
const DB_VERSION = 1
const STORE_NAME = 'books'

let dbInstance = null

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = (e) => {
      dbInstance = e.target.result
      resolve(dbInstance)
    }

    request.onerror = (e) => {
      reject(new Error('IndexedDB open error: ' + (e.target.error?.message || 'unknown')))
    }
  })
}

export async function initDB() {
  return openDB()
}

function getStore(db, mode = 'readonly') {
  const tx = db.transaction(STORE_NAME, mode)
  return tx.objectStore(STORE_NAME)
}

export async function saveBook(book) {
  const db = dbInstance || await openDB()
  return new Promise((resolve, reject) => {
    const store = getStore(db, 'readwrite')
    const request = store.put(book)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('saveBook error: ' + (request.error?.message || 'unknown')))
  })
}

export async function getAllBooks() {
  const db = dbInstance || await openDB()
  return new Promise((resolve, reject) => {
    const store = getStore(db, 'readonly')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('getAllBooks error: ' + (request.error?.message || 'unknown')))
  })
}

export async function getBook(id) {
  const db = dbInstance || await openDB()
  return new Promise((resolve, reject) => {
    const store = getStore(db, 'readonly')
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(new Error('getBook error: ' + (request.error?.message || 'unknown')))
  })
}

export async function deleteBook(id) {
  const db = dbInstance || await openDB()
  return new Promise((resolve, reject) => {
    const store = getStore(db, 'readwrite')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('deleteBook error: ' + (request.error?.message || 'unknown')))
  })
}
