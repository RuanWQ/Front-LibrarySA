'use client'

import Link from 'next/link'
import { Book, BookPage } from '@/types/book'
import { getBookCoverUrl } from '@/utils/bookCover'

interface ReaderProps {
  book: Book
  pages: BookPage[]
  currentPage: number
  fontSize: number
  saving: boolean
  canSaveProgress: boolean
  onFinishReading: () => void
  saveStatus: 'idle' | 'saved' | 'error'
  onPageChange: (page: number) => void
  onFontSizeChange: (size: number) => void
  onSaveProgress: () => void
}

export function Reader({
  book,
  pages,
  currentPage,
  fontSize,
  saveStatus,
  onPageChange,
  onFontSizeChange,
  onFinishReading, // Adicionado na desestruturação
}: ReaderProps) {
  const page = pages?.[currentPage]
  const progress = pages?.length > 0 ? Math.round(((currentPage + 1) / pages.length) * 100) : 0

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <main className="min-h-screen bg-[#17120d] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 md:px-8 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-lg border border-white/10 bg-[#100c09] p-5 shadow-2xl">
          <div className="flex gap-4 lg:block">
            <img
              src={getBookCoverUrl(book)}
              alt={`Capa de ${book.title}`}
              className="aspect-[7/10] w-32 shrink-0 rounded-lg object-cover shadow-xl lg:w-full"
            />
            <div className="min-w-0 lg:mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f3c76a]">
                {book.genre || 'Geral'}
              </p>
              <h1 className="mt-2 text-xl font-black leading-tight">{book.title}</h1>
              <p className="mt-2 text-sm text-[#b9aa99]">{book.author.username}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#b9aa99]">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#f3c76a]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.max(16, fontSize - 1))}
              className="h-10 rounded-lg border border-white/10 text-sm font-bold text-[#f2dfc5] transition hover:border-[#f3c76a]/60"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
              className="h-10 rounded-lg border border-white/10 text-sm font-bold text-[#f2dfc5] transition hover:border-[#f3c76a]/60"
            >
              A+
            </button>
          </div>

          {saveStatus === 'saved' && (
            <p className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              Progresso salvo.
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
              Não consegui salvar. Verifique se você está logado.
            </p>
          )}

          <div className="mt-6 max-h-72 space-y-2 overflow-y-auto pr-1">
            {pages?.map((item, index) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onPageChange(index)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  currentPage === index
                    ? 'bg-[#f3c76a] font-black text-[#17120d]'
                    : 'bg-white/[0.04] text-[#d8cec2] hover:bg-white/[0.08]'
                }`}
              >
                Página {item?.page_number || index + 1}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-[#d4a03d]/20 bg-[#f7efe2] text-[#24170f] shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
          <div className="border-b border-[#24170f]/10 px-5 py-4 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/books" className="text-sm font-black text-[#8a5a2b] hover:text-[#24170f]">
                Voltar para estante
              </Link>
              <span className="text-sm font-bold text-[#6f5b45]">
                Página {currentPage + 1} de {pages?.length || 0}
              </span>
            </div>
          </div>

          <article className="mx-auto min-h-[620px] max-w-3xl px-6 py-10 md:px-10 md:py-14">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#9b6b24]">
              Página {page?.page_number || currentPage + 1}
            </p>
            <div
              className="whitespace-pre-line leading-9 text-[#2c2118]"
              style={{ fontSize: `${fontSize}px` }}
            >
              {page?.content || 'Conteúdo indisponível para esta página.'}
            </div>
          </article>

          <div className="grid gap-3 border-t border-[#24170f]/10 p-5 md:grid-cols-3 md:px-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="h-12 rounded-lg border border-[#8a5a2b]/30 text-sm font-black text-[#6b4a2b] transition hover:bg-[#8a5a2b]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            
            <div className="flex items-center justify-center rounded-lg bg-[#24170f]/5 px-4 text-sm font-bold text-[#6f5b45]">
              {progress}% lido
            </div>

            {/* AJUSTE 3: Lógica do botão dinâmico na última página */}
            {currentPage === pages.length - 1 ? (
              <button
                type="button"
                onClick={onFinishReading}
                className="h-12 rounded-lg bg-[#f3c76a] text-sm font-black text-[#17120d] transition hover:bg-[#d4a03d] shadow-lg"
              >
                Voltar para estante
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!pages || currentPage === pages.length - 1}
                className="h-12 rounded-lg bg-[#24170f] text-sm font-black text-[#f7efe2] transition hover:bg-[#3a291b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}