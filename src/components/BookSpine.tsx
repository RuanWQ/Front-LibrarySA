'use client'

interface BookSpineProps {
  title: string
  author?: string
  genre?: string
  bookColor: string
  onClick: () => void
}

export function BookSpine({ title, author, genre, bookColor, onClick }: BookSpineProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-[238px] w-[58px] shrink-0 cursor-pointer rounded-sm text-left shadow-[10px_0_18px_rgba(0,0,0,0.28)] outline-none transition duration-300 hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:ring-4 focus-visible:ring-[#f3c76a]/40"
      style={{
        backgroundColor: bookColor,
      }}
      aria-label={`Abrir detalhes de ${title}`}
    >
      <span className="absolute inset-y-0 left-0 w-2 rounded-l-sm bg-black/20" />
      <span className="absolute inset-y-0 right-0 w-1 bg-white/15" />
      <span className="absolute left-1/2 top-4 flex h-[168px] -translate-x-1/2 items-center justify-center">
        <span
          className="line-clamp-2 max-h-[160px] text-center text-sm font-black uppercase leading-tight text-white drop-shadow"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {title}
        </span>
      </span>
      <span className="absolute bottom-4 left-2 right-2 h-7 rounded bg-white/12" />

      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-[#100c09] p-3 text-white opacity-0 shadow-2xl transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block text-sm font-bold">{title}</span>
        {author && <span className="mt-1 block text-xs text-[#d8cec2]">{author}</span>}
        {genre && (
          <span className="mt-2 inline-flex rounded-full bg-[#d4a03d]/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#f3c76a]">
            {genre}
          </span>
        )}
      </span>
    </button>
  )
}
