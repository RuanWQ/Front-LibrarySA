import { api } from './api'

import {
  Book,
  BookPage,
  ReadingProgress,
  Review,
} from '@/types/book'

export const booksService = {
  async getMyBooks() {
    const response = await api.get('/books/my_books/')
    return response.data as Book[]
  },

  async getBooks(filters?: Record<string, any>) {
    const response = await api.get('/books/', {
      params: filters,
    })

    return response.data as Book[]
  },

  async getBook(id: number) {
    const response = await api.get(`/books/${id}/`)
    return response.data as Book
  },

  async createBook(data: Partial<Book>) {
    const response = await api.post('/books/', data)
    return response.data as Book
  },

  async updateBook(id: number, data: Partial<Book>) {
    const response = await api.put(`/books/${id}/`, data)
    return response.data as Book
  },

  async deleteBook(id: number) {
    await api.delete(`/books/${id}/`)
  },

  async addToFavorites(bookId: number) {
    const response = await api.post('/favorites/', {
      book: bookId,
    })

    return response.data
  },

  async removeFromFavorites(favoriteId: number) {
    await api.delete(`/favorites/${favoriteId}/`)
  },

  async getFavorites() {
    const response = await api.get('/favorites/')
    return response.data
  },

  async updateReadingProgress(
    bookId: number,
    currentPage: number,
    finished: boolean
  ) {
    const response = await api.post('/progress/', {
      book: bookId,
      current_page: currentPage,
      finished,
    })

    return response.data
  },

  async getProgress() {
    const response = await api.get('/progress/')
    return response.data as ReadingProgress[]
  },

  async getPages(bookId: number) {
    const response = await api.get('/pages/', {
      params: {
        book: bookId,
      },
    })

    return response.data as BookPage[]
  },

  async createPage(
    data: Pick<
      BookPage,
      'book' | 'page_number' | 'content'
    >
  ) {
    const response = await api.post('/pages/', data)

    return response.data as BookPage
  },

  async updatePage(
    id: number,
    data: Partial<
      Pick<BookPage, 'page_number' | 'content'>
    >
  ) {
    const response = await api.patch(
      `/pages/${id}/`,
      data
    )

    return response.data as BookPage
  },

  async deletePage(id: number) {
    await api.delete(`/pages/${id}/`)
  },

  async addBookmark(pageId: number) {
    const response = await api.post('/bookmarks/', {
      page: pageId,
    })

    return response.data
  },

  // =========================
  // REVIEWS / COMENTARIOS
  // =========================

  async getBookReviews(bookId: number) {
    const response = await api.get('/reviews/', {
      params: {
        book: bookId,
      },
    })

    return response.data as Review[]
  },

  async createReview(data: {
    book: number
    rating: number
    comment: string
  }) {
    const response = await api.post('/reviews/', data)

    return response.data as Review
  },

  async deleteReview(reviewId: number) {
    await api.delete(`/reviews/${reviewId}/`)
  },

  // =========================
  // LIKE / LEGAL
  // =========================

  async likeBook(bookId: number) {
    const response = await api.post(`/books/${bookId}/like/`)

    return response.data
  },

  async toggleLike(bookId: number) {
  const response = await api.post('/likes/', {
    book: bookId,
  })

  return response.data
  },

  async getLikes() {
    const response = await api.get('/likes/')
    return response.data
  },
}

