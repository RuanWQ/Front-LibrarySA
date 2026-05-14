'use client'

import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const userName = user?.username || 'Visitante'

  return (
    <main className="bg-[#2d1e12] min-h-screen text-white">
      <section className="px-10 py-16">
        <div className="bg-[#1b130d] rounded-[2rem] border border-[#3a2b1f] shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 items-center p-10">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#d4a03d]/10 text-[#d4a03d] font-bold uppercase text-xs tracking-widest mb-6">
                <span className="bg-[#d4a03d] text-[#1a110a] px-2 py-1 rounded">B</span>
                Biblioteca Digital
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
                Bem-vindo à sua biblioteca online, {userName}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Aqui você organiza livros, acompanha progresso de leitura e explora sua estante digital com facilidade.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Catálogo</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">1.248</p>
                </div>
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Leituras</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">+320</p>
                </div>
                <div className="bg-[#2a1e14] p-5 rounded-3xl border border-[#3d2b1d]">
                  <p className="text-sm text-gray-400">Avaliações</p>
                  <p className="text-2xl font-bold text-[#d4a03d]">4,8</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#3b2714] to-[#1b1008] shadow-inner h-96 md:h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,160,61,0.25),_transparent_40%)]" />
              <div className="relative z-10 text-center px-6 py-8">
                <div className="mx-auto mb-6 w-28 h-28 rounded-full bg-[#d4a03d] flex items-center justify-center text-4xl font-black text-[#1a110a]">
                  B
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

      {/* Quick Stats */}
      <section className="px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Seu Progresso</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Lendo</p>
              <p className="text-3xl font-bold text-[#d4a03d]">3</p>
              <p className="text-gray-500 text-xs mt-2">livros em progresso</p>
            </div>
            <div className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Concluídos</p>
              <p className="text-3xl font-bold text-[#d4a03d]">12</p>
              <p className="text-gray-500 text-xs mt-2">neste mês</p>
            </div>
            <div className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Favoritos</p>
              <p className="text-3xl font-bold text-[#d4a03d]">28</p>
              <p className="text-gray-500 text-xs mt-2">guardados</p>
            </div>
            <div className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Streak</p>
              <p className="text-3xl font-bold text-[#d4a03d]">15</p>
              <p className="text-gray-500 text-xs mt-2">dias lendo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/estante"
              className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6 hover:border-[#d4a03d] transition text-center"
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-white mb-2">Explorar Estante</h3>
              <p className="text-gray-400 text-sm">Navegue pela sua coleção de livros</p>
            </a>
            <a
              href="/favorites"
              className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6 hover:border-[#d4a03d] transition text-center"
            >
              <div className="text-3xl mb-3">❤️</div>
              <h3 className="font-bold text-white mb-2">Favoritos</h3>
              <p className="text-gray-400 text-sm">Veja seus livros salvos</p>
            </a>
            <a
              href="/profile"
              className="bg-[#1b130d] border border-[#3a2b1f] rounded-lg p-6 hover:border-[#d4a03d] transition text-center"
            >
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-bold text-white mb-2">Meu Perfil</h3>
              <p className="text-gray-400 text-sm">Configure sua conta e preferências</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
