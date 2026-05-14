'use client'

import { ReactNode } from 'react'
import { User } from '@/types/user'

interface ProfileCardProps {
  profile: User
  favoriteCount?: number | string
  readingCount?: number | string
  finishedCount?: number | string
  myBooksCount?: number | string
  actions?: ReactNode
}

export function ProfileCard({
  profile,
  favoriteCount = 0,
  readingCount = profile.reading_books?.length || 0,
  finishedCount = profile.finished_books?.length || 0,
  myBooksCount = 0,
  actions,
}: ProfileCardProps) {
  const initial = profile.username.slice(0, 1).toUpperCase()

  return (
    <section className="overflow-hidden rounded-xl border border-[#d7c8b8] bg-white shadow-sm">
      
      {/* BANNER DINÂMICO CORRIGIDO */}
      {profile.banner ? (
        <img 
          src={profile.banner} 
          alt="Banner do perfil" 
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="h-32 bg-gradient-to-r from-[#6f2f38] via-[#d4a03d] to-[#1f332b]" />
      )}
    
      <div className="px-6 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4">
            <div className="-mt-20 flex gap-4 sm:items-start">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-32 w-32 rounded-full border-4 border-white bg-[#f7efe4] object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#1f332b] text-5xl font-black text-[#d4a03d] shadow-lg">
                  {initial}
                </div>
              )}

              <div className="mt-16 flex flex-col gap-1">
                <h1 className="text-3xl font-black text-[#17120d]">{profile.username}</h1>
                {profile.email && <p className="text-sm text-[#6e6256]">{profile.email}</p>}
              </div>
            </div>

            {profile.bio && (
              <p className="max-w-2xl text-sm leading-6 text-[#4b4036]">{profile.bio}</p>
            )}
          </div>

          {actions && <div className="flex flex-wrap gap-2 sm:mt-4">{actions}</div>}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 border-t border-[#eadfcd] pt-6">
          <ProfileStat label="Livros Publicados" value={myBooksCount} />
          <ProfileStat label="Favoritos" value={favoriteCount} />
          <ProfileStat label="Lendo" value={readingCount} />
          <ProfileStat label="Concluídos" value={finishedCount} />
        </div>
      </div>
    </section>
  )
}

function ProfileStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xl font-bold text-[#6f2f38]">{value}</div>
      <div className="mt-0.5 text-xs font-semibold text-[#7b6b5d]">{label}</div>
    </div>
  )
}