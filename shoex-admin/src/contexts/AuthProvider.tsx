import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation } from '@apollo/client'
import { AuthContext } from './AuthContext'
import type { AuthContextType, User } from './AuthContext'
import { LOGIN_MUTATION, LOGOUT_MUTATION } from '../graphql/mutations'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
        return null
      }
    }
    return null
  })
  const [loading] = useState(false)

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [logoutMutation] = useMutation(LOGOUT_MUTATION)

  const login = async (username: string, password: string) => {
    const { data } = await loginMutation({
      variables: { input: { username, password, rememberMe: true } },
    })

    if (data.login.success) {
      const { user: userData, tokens } = data.login
      setUser(userData)
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      throw new Error(data.login.message || 'Login failed')
    }
  }

  const logout = async () => {
    await logoutMutation()
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
