'use client'

import { useMemo } from 'react'
import { fallbackBooks } from '@/data/fallbackBooks'
import { useAuth } from '@/hooks/useAuth'
import { useBooks } from '@/hooks/useBooks'

export default function DashboardPage() {
  const { user } = useAuth()
  const { books, loading } = useBooks()
  const userName = user?.username || 'Visitante'
  const displayedBooks = books.length > 0 ? books : fallbackBooks
  const stats = useMemo(
    () => ({
      books: displayedBooks.length,
      reads: books.reduce((total, book) => total + (book.read_count || 0), 0),
      reviews: books.reduce((total, book) => total + book.review_count, 0),
    }),
    [books, displayedBooks.length]
  )
  const formatStat = (value: number) => (loading ? '...' : String(value))

  return (
    <main className="bg-[#2d1e12] min-h-screen text-white">
      <section className="px-10 py-16">
        <div className="bg-[#1b130d] rounded-[2rem] border border-[#3a2b1f] shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 items-center p-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
                Bem-vindo à sua biblioteca online, {userName}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Aqui você organiza livros, acompanha progresso de leitura e explora sua estante digital com facilidade.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Catálogo</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">{formatStat(stats.books)}</p>
                </div>
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Leituras</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">{formatStat(stats.reads)}</p>
                </div>
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Avaliações</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">{formatStat(stats.reviews)}</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#3b2714] to-[#1b1008] shadow-inner h-96 md:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,160,61,0.25),_transparent_40%)]" />
              <div className="relative z-10 text-center px-6 py-8">
                <div className="mx-auto mb-6 w-28 h-28 rounded-full bg-[#d4a03d] flex items-center justify-center text-4xl font-black text-[#1a110a]">
                 <img src="./logo-redonda-salibra.png" alt="logo da SA Library" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Biblioteca Digital</h2>
                <p className="text-gray-300">
                  Conecte-se aos seus livros favoritos, registre leituras e descubra novas obras com a estante personalizada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#1c120b] rounded-3xl border border-[#3d2b1d] p-8">
            <h3 className="text-xl font-bold mb-4">Sobre a Biblioteca</h3>
            <p className="text-gray-400 leading-relaxed">
              Biblioteca Digital é um ambiente para publicar, revisar e explorar leituras de forma clara.
              Encontre títulos novos, avalie obras e mantenha seu acervo sempre organizado.
            </p>
          </div>
          <div className="bg-[#1c120b] rounded-3xl border border-[#3d2b1d] p-8">
            <h3 className="text-xl font-bold mb-4">Estante Atualizada</h3>
            <ul className="space-y-4 text-gray-300">
              <li>Novos títulos adicionados semanalmente</li>
              <li>Avaliações e resenhas reais dos leitores</li>
              <li>Leituras recomendadas com base no seu gosto</li>
            </ul>
          </div>
          <div className="bg-[#1c120b] rounded-3xl border border-[#3d2b1d] p-8">
            <h3 className="text-xl font-bold mb-4">Como funciona</h3>
            <div className="text-gray-400 space-y-3">
              <p>Explore a estante para encontrar obras novas.</p>
              <p>Adicione aos favoritos para ler depois.</p>
              <p>Controle seu progresso e veja estatísticas pessoais no perfil.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
