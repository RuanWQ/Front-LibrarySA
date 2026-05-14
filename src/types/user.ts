import { Book } from './book'

export interface User {
  id: number
  username: string
  email?: string
  bio?: string
  avatar?: string | null
  published_books?: Book[]
  reading_books?: Book[]
  finished_books?: Book[]
  created_at: string
  updated_at?: string
}

export interface Profile extends User {
  followers_count?: number
  following_count?: number
}
