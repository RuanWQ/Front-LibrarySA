import { api } from './api'
import { Profile, User } from '@/types/user'
import { Review } from '@/types/review'

export const usersService = {
  async getProfile(username: string) {
    const response = await api.get(`/profiles/${username}/`)
    return response.data as Profile
  },

  async updateProfile(username: string, data: FormData) {

  const response = await api.patch(
    `/profiles/${username}/`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data as Profile
},

  async createReview(bookId: number, rating: number, comment: string) {
    const response = await api.post('/reviews/', {
      book: bookId,
      rating,
      comment,
    })
    return response.data as Review
  },

  async getReviews(bookId?: number) {
    const response = await api.get('/reviews/', {
      params: bookId ? { book: bookId } : {},
    })
    return response.data as Review[]
  },

  async updateReview(reviewId: number, rating: number, comment: string) {
    const response = await api.patch(`/reviews/${reviewId}/`, {
      rating,
      comment,
    })
    return response.data as Review
  },

  async deleteReview(reviewId: number) {
    await api.delete(`/reviews/${reviewId}/`)
  },
}
