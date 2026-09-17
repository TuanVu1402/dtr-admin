import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { categories as seedCategories } from '../data/dtrData'
import type { Category } from '../types/dtr'
import { readShared, subscribeShared, writeShared } from '../utils/sharedStore'

const STORAGE_KEY = 'dtr-categories-v10'

type CategoriesContextValue = {
  categories: Category[]
  updateCategory: (id: string, updates: Partial<Category>) => void
  resetCategories: () => void
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

function normalize(raw: unknown): Category[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return seedCategories.map((c) => ({ ...c, enabled: c.enabled !== false }))
  }
  return raw.map((item) => {
    const c = item as Category
    return { ...c, enabled: c.enabled !== false }
  })
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => normalize(readShared(STORAGE_KEY, seedCategories)))

  useEffect(() => {
    writeShared(STORAGE_KEY, categories)
  }, [categories])

  useEffect(() => {
    return subscribeShared(STORAGE_KEY, () => {
      const next = normalize(readShared(STORAGE_KEY, seedCategories))
      setCategories((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    })
  }, [])

  function updateCategory(id: string, updates: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  function resetCategories() {
    setCategories(seedCategories.map((c) => ({ ...c, enabled: true })))
  }

  return (
    <CategoriesContext.Provider value={{ categories, updateCategory, resetCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}
