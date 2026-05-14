import { Book } from '@/types/book'

const palettes = [
  ['#22140f', '#a43a2f', '#f3c76a'],
  ['#111827', '#2563eb', '#f8fafc'],
  ['#13251c', '#2e7d55', '#f7d77b'],
  ['#211331', '#7c3aed', '#f1e7ff'],
  ['#26160d', '#c66a2d', '#ffe6b0'],
  ['#081b20', '#2f6f7e', '#d6f7ff'],
  ['#24121a', '#9d5c63', '#ffe4e6'],
  ['#111111', '#8a5a2b', '#fff7d6'],
]

const hashText = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const splitTitle = (title: string) => {
  const words = title.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word

    if (nextLine.length > 18 && currentLine) {
      lines.push(currentLine)
      currentLine = word
      return
    }

    currentLine = nextLine
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.slice(0, 4)
}

export function getBookCoverUrl(book: Book) {
  if (book.cover) return book.cover

  const title = book.title || 'Livro'
  const genre = book.genre || 'Geral'
  const author = book.author?.username || 'Biblioteca Digital'
  const palette = palettes[hashText(`${title}-${author}`) % palettes.length]
  const lines = splitTitle(title)
  const titleSpans = lines
    .map(
      (line, index) =>
        `<tspan x="48" dy="${index === 0 ? 0 : 42}">${escapeXml(line)}</tspan>`
    )
    .join('')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="920" viewBox="0 0 640 920">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="100%" stop-color="${palette[1]}"/>
        </linearGradient>
        <radialGradient id="light" cx="72%" cy="18%" r="55%">
          <stop offset="0%" stop-color="${palette[2]}" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="640" height="920" rx="34" fill="url(#bg)"/>
      <rect width="640" height="920" rx="34" fill="url(#light)"/>
      <rect x="34" y="34" width="572" height="852" rx="24" fill="none" stroke="${palette[2]}" stroke-width="4" opacity="0.55"/>
      <path d="M95 220 C180 162 252 162 320 220 C388 162 460 162 545 220 L545 625 C460 575 388 575 320 632 C252 575 180 575 95 625 Z" fill="${palette[2]}" opacity="0.16"/>
      <path d="M320 220 L320 632" stroke="${palette[2]}" stroke-width="5" opacity="0.34"/>
      <text x="48" y="120" fill="${palette[2]}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" letter-spacing="4">${escapeXml(genre.toUpperCase())}</text>
      <text x="48" y="380" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900">${titleSpans}</text>
      <text x="48" y="790" fill="#ffffff" opacity="0.86" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${escapeXml(author)}</text>
      <text x="48" y="840" fill="${palette[2]}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" letter-spacing="5">SA LIBRARY</text>
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
