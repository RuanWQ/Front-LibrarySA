'use client'

import Link from 'next/link'
import { useState } from 'react'
import { authService } from '@/services/auth'

const getAuthErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data

  if (typeof data?.detail === 'string') return data.detail

  if (data && typeof data === 'object') {
    const firstError = Object.values(data).flat()[0]
    if (typeof firstError === 'string') return firstError
  }

  return fallback
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não correspondem.')
      return
    }

    setLoading(true)

    try {
      await authService.register(username.trim(), email.trim(), password)
      window.location.href = '/profile'
    } catch (err: any) {
      setError(getAuthErrorMessage(err, 'Erro ao cadastrar. Verifique os dados.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2d1e12] px-4 py-12 text-[#1a110a]">
      <section className="w-full max-w-md rounded-lg border border-[#d4a03d]/20 bg-[#f2e8d5] p-8 shadow-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b6b24]">
          Cadastro
        </span>
        <h1 className="mt-2 text-4xl font-black leading-tight">Criar conta</h1>
        <p className="mt-2 text-gray-600">
          Crie sua conta e entre automaticamente na biblioteca.
        </p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-1 font-bold">
            Nome de usuário
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-bold">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-bold">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-bold">
            Confirmar senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 h-12 rounded-lg bg-[#d4a03d] text-sm font-black text-[#1a110a] transition hover:bg-[#f0bd59] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar e entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link href="/login" className="font-bold text-[#8a5a2b] hover:text-[#1a110a]">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}
