import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { apiFetch } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export type AuthContext = {
  user: any
  subscription: any
  signup: (
    email: string,
    password: string,
  ) => Promise<{ user?: any; errors?: any }>
  login: (
    email: string,
    password: string,
  ) => Promise<{ user?: any; errors?: any }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const result = await apiFetch('accounts/_allauth/browser/v1/auth/session')

      if (result.error) {
        return null
      }

      return result.data.data.user
    },
    retry: false,
    staleTime: Infinity,
  })

  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const result = await apiFetch('subscriptions/subscription/')

      if (result.error) {
        return null
      }

      return result.data
    },
    enabled: !!user,
    retry: false,
    staleTime: Infinity,
  })

  const signup = async (email: string, password: string) => {
    const result = await apiFetch('accounts/_allauth/browser/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (result.error) {
      return { errors: result.error.errors }
    }

    queryClient.invalidateQueries({ queryKey: ['session'] })
    queryClient.invalidateQueries({ queryKey: ['subscription'] })

    return { user: result.data.data.user }
  }

  const login = async (email: string, password: string) => {
    const result = await apiFetch('accounts/_allauth/browser/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (result.error) {
      return { errors: result.error.errors }
    }

    queryClient.invalidateQueries({ queryKey: ['session'] })
    queryClient.invalidateQueries({ queryKey: ['subscription'] })

    return { user: result.data.data.user }
  }

  const logout = async () => {
    const result = await apiFetch('accounts/_allauth/browser/v1/auth/session', {
      method: 'DELETE',
    })

    if (result.error) {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    }
  }

  if (isUserLoading || (!!user && isSubscriptionLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, subscription, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
