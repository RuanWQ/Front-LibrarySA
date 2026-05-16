import { Book } from './book'
import { User } from './user'

export interface Review {
  id: number
  book: Book | number
  parent_review?: number | null
  author: User
  rating?: number | null
  comment: string
  status: 'pending' | 'accepted' | 'rejected'
  replies?: Review[]
  can_edit?: boolean
  can_delete?: boolean
  created_at: string
  updated_at: string
}
