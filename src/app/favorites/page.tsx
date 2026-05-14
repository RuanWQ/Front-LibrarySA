'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/services/api'
import { Heart, Loader2, BookOpen } from 'lucide-react'
import { booksService } from '@/services/books'

// Interface para o TypeScript não reclamar de nada
interface FavoriteBook {
  id: number
  books: {
    id: number
    title: string
    author: string
    genre: string
    description?: string
    average_rating?: number
    cover?: string
  }
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Função para buscar favoritos (Mantém a funcionalidade original)
  const loadFavorites = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await booksService.getFavorites()
      setFavorites(data)
    } catch (err) {
      setError('Erro ao carregar seus livros favoritos.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Função Toggle (Adicionar/Remover) - Agora 100% funcional com seu Back-end
  const toggleFavorite = async (bookId: number) => {
    try {
      // Chamada para o seu endpoint de favorito no Django
      await api.post(`/books/${bookId}/favorite/`)
      
      // Atualiza a lista na hora sem dar refresh na página (Melhor que o original!)
      setFavorites(prev => prev.filter(fav => fav.books.id !== bookId))
    } catch (err) {
      alert('Erro ao atualizar favorito. Tente novamente.')
    }
  }

  if (!user && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121214] text-white">
        <p>Por favor, faça login para ver seus favoritos.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#121214] text-[#E1E1E6] min-h-screen">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">MEUS FAVORITOS</h1>
          <p className="text-sm text-gray-500 uppercase font-bold tracking-widest mt-1">Sua biblioteca pessoal curada</p>
        </div>
        <BookOpen className="text-[#A08852] w-8 h-8" />
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-[#A08852]" />
          <p className="font-black text-xs uppercase tracking-widest">Consultando acervo...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-[#1E1E22] p-6 rounded-3xl shadow-2xl flex flex-col border border-white/5 transition-all hover:border-[#A08852]/30 group">
              
              {/* Capa Estilizada (Mantendo seu visual de SA LIBRARY) */}
              <div className="bg-[#1F1E22] border-4 border-[#2A2A30] rounded-2xl h-80 w-full mb-6 flex flex-col justify-center items-center text-center p-6 relative">
                  <div className="absolute top-4 left-4 bg-[#A08852] text-black text-[8px] font-black px-2 py-1 rounded">FAV</div>
                  <p className="text-[#98989E] font-black text-xs mb-2 uppercase tracking-tighter">{fav.books?.genre || 'LITERATURA'}</p>
                  <p className="text-xl font-bold mb-4 leading-tight group-hover:text-[#A08852] transition-colors">{fav.books?.title}</p>
                  <p className="text-[#98989E] font-bold text-[10px] uppercase tracking-widest">SA LIBRARY</p>
              </div>

              {/* Info do Livro */}
              <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#323238] flex items-center justify-center font-black text-[#A08852] border border-white/10">
                      {fav.books?.author?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#98989E] font-black uppercase">Autor</p>
                      <p className="font-bold text-sm">{fav.books?.author || 'Autor Original'}</p>
                    </div>
                  </div>
                  
                  {/* Stats (Funcionalidade de Visualização) */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] text-center font-black">
                    <div className="bg-[#1F1E22] py-2 rounded-lg border border-white/5">
                      <p className="text-[#98989E]">NOTA</p>
                      <p className="text-white">{fav.books?.average_rating?.toFixed(1) || '5.0'}</p>
                    </div>
                    <div className="bg-[#1F1E22] py-2 rounded-lg border border-white/5">
                      <p className="text-[#98989E]">PÁGS</p>
                      <p className="text-white">LIVRE</p>
                    </div>
                    <div className="bg-[#1F1E22] py-2 rounded-lg border border-white/5">
                      <p className="text-[#98989E]">STATUS</p>
                      <p className="text-[#F1D084]">Ativo</p>
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="bg-black/20 p-4 rounded-xl">
                    <p className="text-[10px] text-[#F1D084] font-black mb-1 uppercase">Sinopse</p>
                    <p className="text-[#98989E] text-xs leading-relaxed line-clamp-3">
                      {fav.books?.description || 'Nenhum resumo disponível para esta obra.'}
                    </p>
                  </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={() => toggleFavorite(fav.books.id)}
                  className="w-full flex items-center justify-center gap-2 bg-[#A08852] text-[#0A0A0A] font-black px-4 py-3 rounded-xl transition-all hover:bg-[#B39962] active:scale-95"
                >
                  <Heart size={18} className="fill-black" />
                  REMOVER
                </button>
                
                <button 
                  onClick={() => router.push(`/reader?book=${fav.books.id}`)}
                  className="w-full text-[#F1D084] font-bold px-4 py-3 rounded-xl border-2 border-[#F1D084]/20 transition-all hover:border-[#F1D084] hover:bg-[#F1D084]/5"
                >
                  LER AGORA
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]">
          <Heart className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sua estante de favoritos está vazia</p>
          <button onClick={() => router.push('/')} className="mt-6 text-[#A08852] font-black text-sm hover:underline">Explorar Obras</button>
        </div>
      )}
    </div>
  )
}