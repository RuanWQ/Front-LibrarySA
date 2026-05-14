'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { authService } from '@/services/auth'
import { storage } from '@/utils/storage'

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => storage.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const data = await authService.getMe()
          setUser(data)
        } catch (error) {
          authService.logout()
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    authService.logout()
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
