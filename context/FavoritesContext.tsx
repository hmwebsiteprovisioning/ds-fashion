'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface FavoritesContextType {
  favorites: string[]
  isLoading: boolean
  isFavorited: (productId: string) => boolean
  toggleFavorite: (productId: string) => Promise<boolean>
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const userId = user?.id || (user as any)?.userid || ''

  // Fetch favorites from API
  const fetchFavorites = async () => {
    if (!userId) {
      setFavorites([])
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/favorites?userId=${userId}`)
      const data = await res.json()
      if (data.success && data.productIds) {
        setFavorites(data.productIds.map(String))
      }
    } catch (err) {
      console.error('Error loading favorites in context:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchFavorites()
    } else {
      setFavorites([])
    }
  }, [isAuthenticated, userId])

  const isFavorited = (productId: string) => {
    return favorites.includes(String(productId))
  }

  const toggleFavorite = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      return false
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          productId: String(productId)
        })
      })

      const data = await response.json()
      if (data.success) {
        if (data.isFavorited) {
          setFavorites(prev => [...prev, String(productId)])
        } else {
          setFavorites(prev => prev.filter(id => id !== String(productId)))
        }
        return true
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
    return false
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      isFavorited,
      toggleFavorite,
      refreshFavorites: fetchFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
