import axios, { AxiosInstance, AxiosError } from 'axios'
import { storage } from '@/utils/storage'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://back-librarysa.onrender.com/api'
  
let isRefreshing = false
let failedQueue: Array<{
  onSuccess: (token: string) => void
  onFailed: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error)
    } else {
      prom.onSuccess(token!)
    }
  })

  isRefreshing = false
  failedQueue = []
}

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use((config) => {
      const token = storage.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401) {
          if (!isRefreshing) {
            isRefreshing = true

            try {
              const refreshToken = storage.getRefreshToken()
              if (!refreshToken) {
                throw new Error('No refresh token')
              }

              const response = await axios.post(
                `${API_URL}/auth/token/refresh/`,
                { refresh: refreshToken }
              )

              const newAccessToken = response.data.access
              storage.setToken(newAccessToken)
              processQueue(null, newAccessToken)
              return this.client(originalRequest)
            } catch (err) {
              processQueue(err as AxiosError)
              storage.clearAuth()
              window.location.href = '/login'
              return Promise.reject(err)
            }
          }

          return new Promise((resolve, reject) => {
            failedQueue.push({
              onSuccess: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.client(originalRequest))
              },
              onFailed: (error: AxiosError) => {
                reject(error)
              },
            })
          })
        }

        return Promise.reject(error)
      }
    )
  }

  get(url: string, config?: any) {
    return this.client.get(url, config)
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config)
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config)
  }

  patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config)
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config)
  }
}

export const api = new APIClient()
