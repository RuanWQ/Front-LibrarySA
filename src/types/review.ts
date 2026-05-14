import { Book } from './book'
import { User } from './user'

export interface Review {
  id: number
  book: Book
  author: User
  rating: number
  comment: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}
