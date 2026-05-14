'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

export function Navbar() {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="flex items-center justify-between gap-6 border-b border-white/10 bg-[#1a110a] px-5 py-3 text-white md:px-10">
      <Link href="/dashboard" className="flex items-center gap-3">
        <img
          src="/logo-library.jpeg"
          alt="SA Library"
          className="h-11 w-11 rounded-lg border border-[#d4a03d]/30 object-cover"
        />
        <span className="font-bold text-lg md:text-xl">SA Library</span>
      </Link>
      <div className="flex gap-4 text-sm font-medium md:gap-8">
        <Link href="/dashboard" className="hover:text-[#d4a03d]">
          Dashboard
        </Link>
        <Link href="/estante" className="hover:text-[#d4a03d]">
          Estante
        </Link>
        {mounted && user ? (
          <Link href="/books" className="hover:text-[#d4a03d]">
            Criar
          </Link>
        ) : null}
        {mounted && user ? (
          <>
            <Link href="/profile" className="hover:text-[#d4a03d]">
              Perfil
            </Link>
            <button type="button" onClick={logout} className="hover:text-[#d4a03d]">
              Sair
            </button>
          </>
        ) : mounted && !user ? (
          <Link href="/login" className="hover:text-[#d4a03d]">
            Login
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
