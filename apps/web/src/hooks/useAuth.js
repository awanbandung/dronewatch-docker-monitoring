import { useState, useCallback } from 'react'
import { api } from '@/lib/api.js'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dw_user')) } catch { return null }
  })

  const login = useCallback(async (identifier, password) => {
    const data = await api.login(identifier, password)
    localStorage.setItem('dw_token', data.access_token)
    localStorage.setItem('dw_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dw_token')
    localStorage.removeItem('dw_user')
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}
