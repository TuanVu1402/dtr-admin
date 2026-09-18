import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { categories as seedCategories } from '../data/dtrData'
import type { Category } from '../types/dtr'
import { readShared, subscribeShared, writeShared } from '../utils/sharedStore'

const STORAGE_KEY = 'dtr-categories-v11'

export type NewCategoryInput = {
  title: string
  description: string
  pointOptions: Category['pointOptions']
  icon?: Category['icon']
  evidenceType?: Category['evidenceType']
}

type CategoriesContextValue = {
  categories: Category[]
  addCategory: (input: NewCategoryInput) => Category
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  resetCategories: () => void
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

function withDefaults(c: Category): Category {
  return { ...c, enabled: c.enabled !== false }
}

function normalize(raw: unknown): Category[] {
  if (!Array.isArray(raw) || raw.length === 0) return seedCategories.map(withDefaults)
  return raw.map((item) => withDefaults(item as Category))
}

/** Id hạng mục mới: slug từ tiêu đề + hậu tố ngắn để không đụng hạng mục đã có. */
function categoryId(title: string, taken: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'hang-muc'
  let id = base
  let i = 2
  while (taken.has(id)) id = `${base}-${i++}`
  return id
}

/** Số thứ tự hiển thị (01, 02...) — lấy số lớn nhất đang có rồi cộng 1. */
function nextNumber(list: Category[]): string {
  const max = list.reduce((acc, c) => Math.max(acc, Number(c.number) || 0), 0)
  return String(max + 1).padStart(2, '0')
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

  function addCategory(input: NewCategoryInput): Category {
    const created: Category = {
      id: categoryId(input.title, new Set(categories.map((c) => c.id))),
      number: nextNumber(categories),
      title: input.title,
      description: input.description,
      icon: input.icon ?? 'pin',
      pointOptions: input.pointOptions,
      evidenceType: input.evidenceType ?? 'file',
      enabled: true,
    }
    setCategories((prev) => [...prev, created])
    return created
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  function updateCategory(id: string, updates: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  function resetCategories() {
    setCategories(seedCategories.map((c) => withDefaults({ ...c, enabled: true })))
  }

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, resetCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider')
  return ctx
}
