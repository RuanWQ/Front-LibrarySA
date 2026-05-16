export interface Book {
  id: number

  title: string

  description: string

  author: {
    id: number
    username: string
    avatar?: string | null
  }

  genre?: string

  styles?: {
    fontFamily?: string
    borderRadius?: number
    borderWidth?: number
    theme?: string
  }

  total_pages: number

  average_rating: number

  review_count: number

  read_count?: number

  status: 'draft' | 'published'

  cover?: string | null

  pages?: BookPage[]

  reviews?: Review[]

  created_at: string

  updated_at: string

  likes_count?: number

  liked?: boolean
}
export interface BookPage {
  id: number
  book: number
  page_number: number
  content: string
  created_at?: string
}

export interface Favorite {
  id: number
  user: number
  book: number
  book_detail?: Book
  created_at: string
}

export interface ReadingProgress {
  id: number
  user: number
  book: number
  book_detail?: Book
  current_page: number
  finished: boolean
  updated_at: string
}

export interface PageBookmark {
  id: number
  user: number
  page: BookPage
  created_at: string
}

export interface Review {
  id: number

  book: number | { id: number }

  parent_review?: number | null

  author: {
    id: number
    username: string
    avatar?: string | null
    bio?: string | null
  }

  rating?: number | null

  comment: string

  status: 'pending' | 'accepted' | 'rejected'

  replies?: Review[]

  can_edit?: boolean

  can_delete?: boolean

  created_at: string

  updated_at: string
}