'use client'

import Link from 'next/link'
import { Book } from '@/types/book'
import { getBookCoverUrl } from '@/utils/bookCover'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <img
          src={getBookCoverUrl(book)}
          alt={book.title}
          className="aspect-[7/10] w-full object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-lg truncate">{book.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{book.author.username}</p>
          <div className="flex justify-between items-center">
            <span className="text-yellow-500 font-bold">
              ⭐ {book.average_rating.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">
              {book.total_pages} páginas
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
