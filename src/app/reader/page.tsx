'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import Link from 'next/link'

import { api } from '@/services/api'

import {
  ChevronLeft,
  ThumbsUp,
} from 'lucide-react'

import { Reader } from '@/components/Reader'
import { ReviewCard } from '@/components/ReviewCard'

import { fallbackBooks, getFallbackBookById } from '@/data/fallbackBooks'

import { bookThemes } from '@/data/bookThemes'

import { booksService } from '@/services/books'

import {
  Book,
  BookPage,
  ReadingProgress,
  Review,
} from '@/types/book'

import { storage } from '@/utils/storage'

const buildReadingText = (book: Book) => {
  const intro =
    book.description ||
    'Este livro ainda nao possui conteudo cadastrado.'

  return [
    `${book.title}\n\n${intro}`,
    'A leitura comeca quando uma ideia encontra espaco para respirar.',
    'Use os controles laterais para mudar o tamanho da fonte.',
    'O progresso e salvo automaticamente.',
    'Ao finalizar a leitura, voce pode avaliar a obra.',
  ].join('\n\n')
}

const createFallbackPages = (
  book: Book
): BookPage[] => {
  const text = buildReadingText(book)

  const paragraphs = text.split('\n\n')

  const pages: BookPage[] = []

  for (
    let index = 0;
    index < paragraphs.length;
    index += 2
  ) {
    pages.push({
      id: Number(`${book.id}${index + 1}`),
      book: book.id,
      page_number: pages.length + 1,
      content: paragraphs
        .slice(index, index + 2)
        .join('\n\n'),
      created_at: book.created_at,
    })
  }

  return pages
}

function ReaderScreen() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawBookId = searchParams.get('book')

  const parsedBookId = rawBookId
    ? Number(rawBookId)
    : fallbackBooks[0].id

  const bookId = Number.isFinite(parsedBookId)
    ? parsedBookId
    : fallbackBooks[0].id

  const [book, setBook] = useState<Book | null>(null)

  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(0)

  const [fontSize, setFontSize] = useState(18)

  const [saving, setSaving] = useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saved' | 'error'
  >('idle')

  const [progressHydrated, setProgressHydrated] =
    useState(false)

  const [savedPage, setSavedPage] = useState<
    number | null
  >(null)

  const [canSaveProgress, setCanSaveProgress] =
    useState(false)

  const [liked, setLiked] = useState(false)

  const [favorited, setFavorited] = useState(false)

  const [likesCount, setLikesCount] = useState(0)

  const [rating, setRating] = useState(0)

  const [comment, setComment] = useState('')

  const [reviews, setReviews] = useState<Review[]>(
    []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)


  const recalcBookStats = (nextReviews: Review[]) => {
    const ratedReviews = nextReviews.filter(
      (review) => review.rating !== undefined && review.rating !== null
    )

    const reviewCount = ratedReviews.length
    const averageRating = reviewCount
      ? ratedReviews.reduce(
          (sum, review) => sum + (review.rating || 0),
          0
        ) / reviewCount
      : 0

    setBook((prev) =>
      prev
        ? {
            ...prev,
            review_count: reviewCount,
            average_rating: parseFloat(averageRating.toFixed(1)),
          }
        : prev
    )
  }

  useEffect(() => {
    let isActive = true

    const loadBook = async () => {
      const hasToken = Boolean(storage.getToken())

      const emptyProgress: ReadingProgress[] = []

      setLoading(true)

      const fallbackBook =
        getFallbackBookById(bookId)

      if (fallbackBook) {
        setBook(fallbackBook)

        setLoading(false)

        setProgressHydrated(true)

        return
      }

      try {
        const [
          apiBook,
          progressItems,
          apiReviews,
          favorites,
          likes,
        ] = await Promise.all([
          booksService.getBook(bookId),

          hasToken
            ? booksService
                .getProgress()
                .catch(() => emptyProgress)
            : Promise.resolve(emptyProgress),

          booksService
            .getBookReviews(bookId)
            .catch(() => []),

          hasToken
            ? booksService
                .getFavorites()
                .catch(() => [])
            : Promise.resolve([]),

          hasToken
            ? booksService
                .getLikes()
                .catch(() => [])
            : Promise.resolve([]),
        ])

        if (!isActive) return

        const progress = progressItems.find(
          (item) => item.book === bookId
        )

        const bookWithTheme = {
          ...apiBook,
          genre:
            apiBook.genre ||
            bookThemes[
              bookId % bookThemes.length
            ],
        }

        setBook(bookWithTheme)

        setReviews(apiReviews)

        setSavedPage(
          progress?.current_page || null
        )

        setLikesCount(
          apiBook.likes_count || 0
        )

        setLiked(
          likes.some(
            (item: any) =>
              item.book === bookId
          )
        )

        setFavorited(
          favorites.some(
            (item: any) =>
              item.book === bookId
          )
        )

        setCanSaveProgress(hasToken)

        setProgressHydrated(true)
      } catch (error) {
        console.error(error)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadBook()

    return () => {
      isActive = false
    }
  }, [bookId])

  const pages = useMemo(() => {
    if (!book) return []

    if (
      book.pages &&
      book.pages.length > 0
    ) {
      return [...book.pages].sort(
        (a, b) =>
          a.page_number - b.page_number
      )
    }

    return createFallbackPages(book)
  }, [book])

  useEffect(() => {
    const incrementView = async () => {
      try {
        await api.post(`/books/${bookId}/increment_view/`)
      } catch (e) { /* silencioso */ }
    }
    if (bookId) incrementView()
  }, [bookId])
  

  useEffect(() => {
    if (
      !book ||
      pages.length === 0 ||
      progressHydrated
    ) return

    if (savedPage) {
      setCurrentPage(
        Math.min(
          Math.max(savedPage - 1, 0),
          pages.length - 1
        )
      )
    }

    setProgressHydrated(true)
  }, [
    book,
    pages.length,
    progressHydrated,
    savedPage,
  ])

  useEffect(() => {
    if (
      !book ||
      !progressHydrated ||
      !canSaveProgress
    ) return

    const timeoutId =
      window.setTimeout(async () => {
        try {
          setSaving(true)

          await booksService.updateReadingProgress(
            book.id,
            currentPage + 1,
            currentPage === pages.length - 1
          )

          setSaveStatus('saved')
        } catch (error) {
          console.error(error)

          setSaveStatus('error')
        } finally {
          setSaving(false)
        }
      }, 450)

    return () =>
      window.clearTimeout(timeoutId)
  }, [
    book,
    currentPage,
    pages.length,
    progressHydrated,
    canSaveProgress,
  ])

  const handleLike = async () => {
    if (!book) return

    try {
      const response =
        await booksService.toggleLike(
          book.id
        )

      if (response.liked) {
        setLiked(true)

        setLikesCount((prev) => prev + 1)
      } else {
        setLiked(false)

        setLikesCount((prev) =>
          Math.max(prev - 1, 0)
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFavorite = async () => {
    if (!book) return

    try {
      await booksService.addToFavorites(
        book.id
      )

      setFavorited((prev) => !prev)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFinishReading = async () => {
    router.push('/estante')
  }

  const handleSendReview = async () => {
    if (!book || rating === 0 || isSubmitting) return

    setIsSubmitting(true)

    try {
      const review =
        await booksService.createReview({
          book: book.id,
          rating,
          comment,
        })

      setReviews((prev) => {
        const next = [review, ...prev]
        recalcBookStats(next)
        return next
      })

      setComment('')
      setRating(0)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (
    loading ||
    !book ||
    pages.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#17120d] text-white">
        Carregando leitura...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#17120d] text-white">
      <div className="border-b border-white/10 bg-[#221910] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/estante"
            className="flex items-center gap-2 text-[#f3c76a]"
          >
            <ChevronLeft size={18} />
            Voltar para estante
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                liked
                  ? 'bg-red-500'
                  : 'bg-white/10'
              }`}
            >
              <ThumbsUp size={18} />

              {likesCount}
            </button>

            <button
              onClick={handleFavorite}
              className={`rounded-xl px-4 py-2 ${
                favorited
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10'
              }`}
            >
              ❤️ Favorito
            </button>
          </div>
        </div>
      </div>

      <Reader
          book={book}
          pages={pages}
          currentPage={currentPage}
          fontSize={fontSize}
          saving={saving}
          saveStatus={saveStatus}
          canSaveProgress={canSaveProgress} 
          onSaveProgress={() => { console.log('Progresso salvo!') }} 
          onPageChange={setCurrentPage}
          onFontSizeChange={setFontSize}
          onFinishReading={handleFinishReading}
        />

      <section className="mx-auto mt-10 max-w-5xl px-6 pb-20">
        <div className="mb-6 flex items-center gap-4">
          <div className="text-2xl">
            ⭐{' '}
            {book.average_rating?.toFixed(
              1
            )}
          </div>

          <div className="text-white/60">
            ({book.review_count}{' '}
            avaliacoes)
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex gap-2">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  key={star}
                  onClick={() =>
                    setRating(star)
                  }
                  className={`text-3xl ${
                    rating >= star
                      ? 'text-yellow-400'
                      : 'text-white/30'
                  }`}
                >
                  ★
                </button>
              )
            )}
          </div>

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Escreva um comentario..."
            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-[#120d09] p-4"
          />

          <button
            onClick={handleSendReview}
            disabled={isSubmitting || rating === 0}
            className="mt-4 rounded-2xl bg-[#f3c76a] px-6 py-3 font-bold text-[#1a110a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e5b857] transition"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar comentario'}
          </button>
        </div>

        <div className="mt-10 space-y-5">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onUpdate={(updated) => {
                setReviews((prev) => {
                  const next = prev.map((r) =>
                    r.id === updated.id ? updated : r
                  )
                  recalcBookStats(next)
                  return next
                })
              }}
              onDelete={(reviewId, parentReviewId) => {
                setReviews((prev) => {
                  const next = parentReviewId
                    ? prev.map((r) =>
                        r.id === parentReviewId
                          ? {
                              ...r,
                              replies: r.replies?.filter(
                                (reply) => reply.id !== reviewId
                              ),
                            }
                          : r
                      )
                    : prev.filter((r) => r.id !== reviewId)

                  if (!parentReviewId) {
                    recalcBookStats(next)
                  }

                  return next
                })
              }}
              onReplyAdded={(reply) => {
                setReviews((prev) =>
                  prev.map((r) =>
                    r.id === reply.parent_review
                      ? {
                          ...r,
                          replies: [...(r.replies || []), reply],
                        }
                      : r
                  )
                )
              }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#17120d] text-white">
          Carregando leitura...
        </main>
      }
    >
      <ReaderScreen />
    </Suspense>
  )
}