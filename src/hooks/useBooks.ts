'use client'

import { useState, useEffect } from 'react'
import { Book } from '@/types/book'
import { booksService } from '@/services/books'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await booksService.getBooks()
        setBooks(data)
      } catch (err) {
        setError('Erro ao carregar livros')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  return { books, loading, error }
}
