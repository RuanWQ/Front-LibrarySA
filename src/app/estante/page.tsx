'use client'

import { useMemo, useState } from 'react'
import { BookModal } from '@/components/BookModal'
import { BookSpine } from '@/components/BookSpine'
import { fallbackBooks } from '@/data/fallbackBooks'
import { bookThemes } from '@/data/bookThemes'
import { useBooks } from '@/hooks/useBooks'
import { Book } from '@/types/book'
import { getBookCoverUrl } from '@/utils/bookCover'

const bookColors = [
  '#8B2F39',
  '#C66A2D',
  '#2F6F7E',
  '#6B4FA3',
  '#2E7D55',
  '#A43A2F',
  '#345995',
  '#8A5A2B',
  '#4D7C8A',
  '#9D5C63',
]

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const chunkBooks = (books: Book[], size: number) => {
  const chunks: Book[][] = []

  for (let index = 0; index < books.length; index += size) {
    chunks.push(books.slice(index, index + size))
  }

  return chunks
}

const getReadCount = (book: Book) => book.read_count || 0

export default function EstantePage() {
  const { books, loading, error } = useBooks()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('Todos')

  const publicBooks = books.length > 0 ? books : fallbackBooks
  const catalogBooks = useMemo(
    () =>
      publicBooks.map((book, index) => ({
        ...book,
        genre: book.genre || bookThemes[index % bookThemes.length],
      })),
    [publicBooks]
  )

  const filteredBooks = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim())
    const normalizedTheme = normalizeText(selectedTheme)

    return catalogBooks.filter((book) => {
      const genre = book.genre || 'Geral'
      const matchesTheme = selectedTheme === 'Todos' || normalizeText(genre) === normalizedTheme
      const searchableText = normalizeText(
        [book.title, book.author.username, genre, book.description].join(' ')
      )

      return matchesTheme && searchableText.includes(normalizedSearch)
    })
  }, [catalogBooks, search, selectedTheme])

  const shelves = chunkBooks(filteredBooks, 6)
  const mostReadBooks = useMemo(
    () =>
      [...filteredBooks]
        .sort((first, second) => {
          const readDifference = getReadCount(second) - getReadCount(first)

          if (readDifference !== 0) return readDifference

          return first.title.localeCompare(second.title)
        })
        .slice(0, 8),
    [filteredBooks]
  )

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#17120d] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(212,160,61,0.16),_transparent_34%),linear-gradient(135deg,_#24170f,_#101820_55%,_#15100c)]">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-[#d4a03d]/40 bg-[#d4a03d]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f3c76a]">
                Acervo público
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                Estante pública de livros
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8cec2] md:text-lg">
                Explore obras publicadas pela comunidade, filtre por tema e abra cada livro para ver detalhes antes de ler.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <InfoStat label="Livros" value={publicBooks.length} />
              <InfoStat label="Temas" value={bookThemes.length} />
              <InfoStat label="Exibindo" value={filteredBooks.length} />
            </div>
          </div>

          <div className="mt-9 grid gap-4 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d4a03d]">
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar por título, autor, tema ou resumo"
                className="h-14 w-full rounded-lg border border-white/10 bg-[#0f0c09]/80 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-[#8b7d70] focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/10"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSelectedTheme('Todos')
              }}
              className="h-14 rounded-lg border border-white/10 px-5 text-sm font-bold text-[#f2dfc5] transition hover:border-[#d4a03d]/60 hover:bg-white/5"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {['Todos', ...bookThemes].map((theme) => {
            const isSelected = selectedTheme === theme

            return (
              <button
                key={theme}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-[#f3c76a] bg-[#f3c76a] text-[#17120d]'
                    : 'border-white/10 bg-white/[0.04] text-[#d8cec2] hover:border-[#d4a03d]/60 hover:text-white'
                }`}
              >
                {theme}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Livros mais lidos</h2>
            <p className="mt-1 text-sm text-[#b9aa99]">Obras com maior movimento da comunidade.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {mostReadBooks.map((book) => (
            <button
              type="button"
              key={`cover-${book.id}`}
              onClick={() => handleSelectBook(book)}
              className="group text-left"
            >
              <img
                src={getBookCoverUrl(book)}
                alt={`Capa de ${book.title}`}
                className="aspect-[7/10] w-full rounded-lg object-cover shadow-[0_16px_34px_rgba(0,0,0,0.36)] transition group-hover:-translate-y-1 group-hover:shadow-[0_22px_44px_rgba(0,0,0,0.45)]"
              />
              <span className="mt-2 line-clamp-2 block text-xs font-bold text-[#f2dfc5]">
                {book.title}
              </span>
              <span className="mt-1 block text-xs text-[#b9aa99]">
                {getReadCount(book)} {getReadCount(book) === 1 ? 'leitura' : 'leituras'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        {loading && books.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center text-[#d8cec2]">
            Carregando acervo público...
          </div>
        ) : (
          <>
            {error && books.length === 0 && (
              <div className="mb-5 rounded-lg border border-[#d4a03d]/30 bg-[#d4a03d]/10 p-4 text-sm text-[#f2dfc5]">
                Não consegui carregar a API agora, então estou mostrando livros de exemplo.
              </div>
            )}

            {filteredBooks.length > 0 ? (
              <div className="rounded-lg border-[10px] border-[#3b291d] bg-[#24170f] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
                {shelves.map((shelfBooks, shelfIndex) => (
                  <div
                    key={`${selectedTheme}-${shelfIndex}`}
                    className="relative min-h-[310px] border-b-[12px] border-[#3b291d] bg-[#110d09] px-4 pt-8 last:border-b-0"
                    style={{
                      boxShadow: 'inset 0 24px 40px rgba(0,0,0,0.62)',
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04),_transparent_22%,_rgba(255,255,255,0.025)_54%,_transparent)]" />
                    <div className="relative flex min-h-[252px] items-end gap-3 overflow-x-auto pb-4">
                      {shelfBooks.map((book, bookIndex) => (
                        <BookSpine
                          key={book.id}
                          title={book.title}
                          author={book.author.username}
                          genre={book.genre}
                          bookColor={bookColors[(shelfIndex * 6 + bookIndex) % bookColors.length]}
                          onClick={() => handleSelectBook(book)}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#2d1d13] shadow-[0_-8px_22px_rgba(0,0,0,0.45)]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center">
                <h2 className="text-2xl font-black text-white">Nenhum livro encontrado</h2>
                <p className="mt-2 text-[#b9aa99]">
                  Tente outro termo na busca ou escolha um tema diferente.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      <BookModal
        isOpen={isModalOpen}
        book={selectedBook}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  )
}

function InfoStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[#b9aa99]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#f3c76a]">{value}</p>
    </div>
  )
}
