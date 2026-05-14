'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, ThumbsUp } from 'lucide-react'

import { isFallbackBookId } from '@/data/fallbackBooks'
import { booksService } from '@/services/books'
import { Book } from '@/types/book'
import { getBookCoverUrl } from '@/utils/bookCover'

interface BookModalProps {
  isOpen: boolean
  book: Book | null
  onClose: () => void
}

export function BookModal({
  isOpen,
  book,
  onClose,
}: BookModalProps) {
  const [favoriteStatus, setFavoriteStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  useEffect(() => {
    setFavoriteStatus('idle')
  }, [book?.id])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !book) return null

  const cover = getBookCoverUrl(book)

  const authorInitial = book.author?.username
    ?.slice(0, 1)
    .toUpperCase() || 'A'

  const genre = book.genre || 'Geral'

  const realPageCount =
    book.total_pages ??
    (Array.isArray(book.pages) ? book.pages.length : 0)

  const isDemoBook = isFallbackBookId(book.id)

  const handleFavorite = async () => {
    if (isDemoBook) {
      setFavoriteStatus('error')
      return
    }

    try {
      setFavoriteStatus('saving')

      await booksService.addToFavorites(book.id)

      setFavoriteStatus('saved')
    } catch (error) {
      console.error('Erro ao favoritar livro:', error)
      setFavoriteStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fundo */}
      <button
        type="button"
        aria-label="Fechar detalhes do livro"
        className="fixed inset-0 bg-[#070503]/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <section className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-[#17120d] text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
          {/* Botão fechar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-2xl leading-none text-white transition hover:border-[#f3c76a] hover:text-[#f3c76a]"
          >
            ×
          </button>

          <div className="grid lg:grid-cols-[430px_1fr]">
            {/* Lado esquerdo */}
            <div className="bg-[#0f0b08] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#d4a03d]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#f3c76a]">
                  {genre}
                </span>

                <span className="text-sm font-semibold text-[#d8cec2]">
                  {realPageCount}{' '}
                  {realPageCount === 1
                    ? 'página'
                    : 'páginas'}
                </span>
              </div>

              <div className="mx-auto w-full max-w-[360px] rounded-lg border border-white/10 bg-[#f4efe7] p-3">
                <img
                  src={cover}
                  alt={`Capa de ${book.title}`}
                  className="aspect-[7/10] w-full rounded-md object-cover shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>

            {/* Lado direito */}
            <div className="flex min-h-[560px] flex-col p-6 md:p-8">
              <div>
                {/* Autor */}
                <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
                  {book.author?.avatar ? (
                    <img
                      src={book.author.avatar}
                      alt={book.author.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a03d] text-lg font-black text-[#17120d]">
                      {authorInitial}
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#b9aa99]">
                      Autor
                    </p>

                    <p className="font-bold text-white">
                      {book.author?.username || 'Autor desconhecido'}
                    </p>
                  </div>
                </div>

                {/* Título */}
                <h1 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl">
                  {book.title}
                </h1>

                {/* Informações */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoBlock
                    label="Avaliação"
                    value={
                      typeof book.average_rating === 'number'
                        ? book.average_rating.toFixed(1)
                        : '0.0'
                    }
                  />

                  <InfoBlock
                    label="Resenhas"
                    value={String(book.review_count || 0)}
                  />

                  <InfoBlock
                    label="Status"
                    value={
                      book.status === 'published'
                        ? 'Publicado'
                        : book.status || 'Desconhecido'
                    }
                  />
                </div>

                {/* Resumo */}
                <div className="mt-7">
                  <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#f3c76a]">
                    Resumo
                  </h2>

                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#d8cec2]">
                    {book.description ||
                      'Este livro ainda não possui resumo cadastrado.'}
                  </p>
                </div>
              </div>

              {/* Likes */}
              <div className="mt-6 flex items-center gap-2 text-[#d8cec2]">
                <ThumbsUp size={18} />
                <span>{book.likes_count || 0} likes</span>
              </div>

              {/* Botões */}
              <div className="mt-auto border-t border-white/10 pt-6">
                {favoriteStatus === 'error' && (
                  <p className="mb-3 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {isDemoBook
                      ? 'Livros de demonstração não podem ser favoritados.'
                      : 'Erro ao favoritar. Verifique sua conexão.'}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Favoritar */}
                  <button
                    type="button"
                    onClick={handleFavorite}
                    disabled={favoriteStatus === 'saving'}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f3c76a] px-5 text-sm font-black text-[#17120d] transition hover:bg-[#ffd983] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favoriteStatus === 'saved'
                          ? 'fill-[#17120d]'
                          : 'fill-none'
                      }`}
                    />

                    {favoriteStatus === 'saving'
                      ? 'Salvando...'
                      : favoriteStatus === 'saved'
                      ? 'Favoritado'
                      : 'Favoritar'}
                  </button>

                  {/* Ler livro */}
                  <Link
                    href={`/reader?book=${book.id}`}
                    className="flex h-12 items-center justify-center rounded-lg border border-[#f3c76a]/60 px-5 text-sm font-black text-[#f3c76a] transition hover:bg-[#f3c76a]/10"
                  >
                    Ler livro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

interface InfoBlockProps {
  label: string
  value: string
}

function InfoBlock({
  label,
  value,
}: InfoBlockProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-widest text-[#b9aa99]">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-[#f3c76a]">
        {value}
      </p>
    </div>
  )
}