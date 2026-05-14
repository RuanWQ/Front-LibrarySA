import { api } from './api'
import { storage } from '@/utils/storage'

interface LoginResponse {
  access: string
  refresh: string
  user: any
}

export const authService = {
  async register(username: string, email: string, password: string) {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
    })
    const data: LoginResponse = response.data
    storage.setToken(data.access)
    storage.setRefreshToken(data.refresh)
    storage.setUser(data.user)
    return data
  },

  async login(login: string, password: string) {
    const response = await api.post('/auth/login/', {
      login,
      password,
    })

    const data: LoginResponse = response.data
    storage.setToken(data.access)
    storage.setRefreshToken(data.refresh)
    storage.setUser(data.user)
    return data
  },

  async logout() {
    storage.clearAuth()
  },

  async getMe() {
    const response = await api.get('/auth/me/')
    storage.setUser(response.data)
    return response.data
  },

  isAuthenticated(): boolean {
    return !!storage.getToken()
  },
}
