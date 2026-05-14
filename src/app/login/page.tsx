'use client'

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

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingRegister, setLoadingRegister] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoadingLogin(true)
    setLoginError('')

    try {
      await authService.login(loginIdentifier.trim(), loginPassword)
      window.location.href = '/profile'
    } catch (error: any) {
      setLoginError(getAuthErrorMessage(error, 'Usuário/email ou senha incorretos.'))
    } finally {
      setLoadingLogin(false)
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoadingRegister(true)
    setRegisterError('')

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('As senhas não correspondem.')
      setLoadingRegister(false)
      return
    }

    try {
      await authService.register(registerName.trim(), registerEmail.trim(), registerPassword)
      window.location.href = '/profile'
    } catch (error: any) {
      setRegisterError(getAuthErrorMessage(error, 'Erro ao cadastrar. Verifique os dados.'))
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#2d1e12] px-4 py-12 text-[#1a110a]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-[#d4a03d]/20 bg-[#f2e8d5] p-8 shadow-2xl md:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b6b24]">
            Conta
          </span>
          <h1 className="mt-2 text-4xl font-black leading-tight">Entrar na plataforma</h1>
          <p className="mt-2 text-gray-600">Use seu usuário ou email e a senha cadastrada.</p>

          {loginError && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {loginError}
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1 font-bold">
              Usuário ou email
              <input
                type="text"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="seu usuário ou email"
                autoComplete="username"
                className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
                required
              />
            </label>

            <label className="flex flex-col gap-1 font-bold">
              Senha
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loadingLogin}
              className="mt-3 h-12 rounded-lg bg-[#d4a03d] text-sm font-black text-[#1a110a] transition hover:bg-[#f0bd59] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingLogin ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-[#d4a03d]/20 bg-[#f2e8d5] p-8 shadow-2xl md:p-10">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b6b24]">
            Cadastro
          </span>
          <h2 className="mt-2 text-4xl font-black leading-tight">Criar conta</h2>
          <p className="mt-2 text-gray-600">
            Depois do cadastro você já entra na biblioteca automaticamente.
          </p>

          {registerError && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {registerError}
            </p>
          )}

          <form onSubmit={handleRegister} className="mt-7 flex flex-col gap-4">
            <label className="flex flex-col gap-1 font-bold">
              Nome de usuário
              <input
                type="text"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                placeholder="Seu nome"
                autoComplete="username"
                className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
                required
              />
            </label>

            <label className="flex flex-col gap-1 font-bold">
              Email
              <input
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
                required
              />
            </label>

            <label className="flex flex-col gap-1 font-bold">
              Senha
              <input
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
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
                value={registerConfirmPassword}
                onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                placeholder="Repita sua senha"
                minLength={6}
                autoComplete="new-password"
                className="rounded-lg border border-[#cbbda8] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#d4a03d] focus:ring-4 focus:ring-[#d4a03d]/20"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loadingRegister}
              className="mt-3 h-12 rounded-lg bg-[#d4a03d] text-sm font-black text-[#1a110a] transition hover:bg-[#f0bd59] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingRegister ? 'Cadastrando...' : 'Cadastrar e entrar'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
