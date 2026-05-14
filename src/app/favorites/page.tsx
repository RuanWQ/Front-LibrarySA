'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase' 
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  loadFavorites()
  }, [])

  async function loadFavorites() {
    const response = await api.get('/favorites/')
    setFavorites(response.data)
}

  // Função para carregar os favoritos do usuário
  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return

      try {
        setLoading(true)
        // Buscamos os favoritos e os dados dos livros relacionados
        const { data, error } = await supabase
          .from('favorites')
          .select('*, books(*)') 
          .eq('user_id', user.id)

        if (error) throw error
        setFavorites(data || [])
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  // Função para adicionar ou remover um livro dos favoritos
  const toggleFavorite = async (bookId) => {
    if (!user) {
      alert('Faça login para favoritar este livro!')
      return
    }

    try {
      const { data: existingFavorite, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingFavorite) {
        // Se já for favorito, removemos
        const { error: removeError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id)

        if (removeError) throw removeError

        setFavorites(favorites.filter(fav => fav.id !== existingFavorite.id))
      } else {
        // Se não for favorito, adicionamos
        const { data: newFavorite, error: addError } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, book_id: bookId })
          .single()

        if (addError) throw addError

        // Você pode querer recarregar a lista aqui ou adicionar o novo favorito ao estado local
        // Para simplificar, vou recarregar a lista:
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar livro:', error.message)
    }
  }

  // Se o usuário não estiver logado, exibe uma mensagem
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-600">Faça login para ver seus favoritos.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-[#121214] text-[#E1E1E6] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meus Favoritos</h1>
        {/* Você pode adicionar um botão de fechar aqui, se necessário, como na imagem */}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-[#1E1E22] p-6 rounded-2xl shadow-lg flex flex-col">
              {/* Capa do Livro (Simulada para demonstração) */}
              <div className="bg-[#1F1E22] border-4 border-[#2A2A30] rounded-2xl h-80 w-full mb-6 flex flex-col justify-center items-center text-center p-4">
                 <p className="text-[#98989E] font-bold text-lg mb-2">{fav.books?.genre || 'ROMANCE'}</p>
                 <p className="text-2xl font-bold mb-4">{fav.books?.title}</p>
                 <p className="text-[#98989E] font-bold text-sm">{fav.books?.author}</p>
                 <p className="text-[#98989E] font-bold text-sm mt-1">SA LIBRARY</p>
              </div>

              {/* Informações do Livro */}
              <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#323238] flex items-center justify-center mr-3 text-sm font-bold text-[#E1E1E6]">
                      {fav.books?.author?.[0]}
                    </div>
                    <div>
                      <p className="text-sm text-[#98989E] font-bold">AUTOR</p>
                      <p className="font-semibold">{fav.books?.author}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{fav.books?.title}</h2>
                  
                  {/* Avaliação, Resenhas e Status (Dados simulados) */}
                  <div className="grid grid-cols-3 gap-2 text-sm text-center mb-6">
                    <div className="bg-[#1F1E22] p-3 rounded-lg">
                      <p className="text-[#98989E]">AVALIAÇÃO</p>
                      <p className="text-[#E1E1E6] font-bold">4.2</p>
                    </div>
                    <div className="bg-[#1F1E22] p-3 rounded-lg">
                      <p className="text-[#98989E]">RESENHAS</p>
                      <p className="text-[#E1E1E6] font-bold">31</p>
                    </div>
                    <div className="bg-[#1F1E22] p-3 rounded-lg">
                      <p className="text-[#98989E]">STATUS</p>
                      <p className="text-[#F1D084] font-bold">Publicado</p>
                    </div>
                  </div>

                  {/* Resumo (Simulado) */}
                  <div className="mb-6">
                    <p className="text-sm text-[#F1D084] font-bold mb-1">RESUMO</p>
                    <p className="text-[#E1E1E6] text-sm">Duas pessoas se encontram por acaso em uma cidade antiga e descobrem que afeto também pode ser coragem.</p>
                  </div>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-3 mt-auto">
                {/* Botão de Favoritar (agora no lugar de 'Livro de demonstração') */}
                <button 
                  onClick={() => toggleFavorite(fav.books?.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#A08852] text-[#0A0A0A] font-bold px-4 py-3 rounded-lg transition-all hover:bg-[#B39962]"
                >
                  <Heart className={`w-5 h-5 ${favorites.some(f => f.books.id === fav.books.id) ? 'fill-[#E1E1E6]' : 'fill-none'}`} color='#E1E1E6'/>
                  {favorites.some(f => f.books.id === fav.books.id) ? 'Desfavoritar' : 'Favoritar'}
                </button>
                
                <button className="flex-1 text-[#F1D084] font-bold px-4 py-3 rounded-lg border-2 border-[#F1D084] transition-all hover:bg-[#2A2A30]">
                  Ler livro
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Você ainda não tem favoritos.</p>
      )}
    </div>
  )
}