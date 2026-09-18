import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { categories as seedCategories } from '../data/dtrData'
import { defaultRoles, withSeededScopes } from '../data/roleDefaults'
import type { ModuleKey, PermissionKey, RoleDefinition, ScopeAxis, ScopeSelection } from '../types/permission'
import { readShared, subscribeShared, writeShared } from '../utils/sharedStore'

const STORAGE_KEY = 'dtr-roles-v3'

type RolesContextValue = {
  roles: RoleDefinition[]
  roleById: (id: string) => RoleDefinition | undefined
  /** Tên hiển thị của vai trò — không còn tra bảng cứng nên phải có fallback. */
  roleName: (id: string) => string
  createRole: (input: { name: string; description?: string; copyFrom?: string }) => RoleDefinition
  updateRole: (id: string, updates: Partial<Omit<RoleDefinition, 'id' | 'system'>>) => void
  deleteRole: (id: string) => void
  resetRoles: () => void
}

const RolesContext = createContext<RolesContextValue | null>(null)

function seedRoles(): RoleDefinition[] {
  return withSeededScopes(defaultRoles, seedCategories.map((c) => c.id))
}

function withDefaults(role: RoleDefinition): RoleDefinition {
  return {
    ...role,
    enabledModules: Array.isArray(role.enabledModules) ? role.enabledModules : [],
    permissions: Array.isArray(role.permissions) ? role.permissions : [],
    scopes: role.scopes ?? {},
  }
}

function normalize(raw: unknown): RoleDefinition[] {
  if (!Array.isArray(raw) || raw.length === 0) return seedRoles()
  const stored = raw.map((item) => withDefaults(item as RoleDefinition))
  // Vai trò hệ thống luôn phải tồn tại — nếu dữ liệu cũ thiếu thì bù lại, tránh
  // người dùng đang giữ vai trò đó bị mất sạch quyền sau khi nâng cấp.
  const missing = seedRoles().filter((seed) => seed.system && !stored.some((r) => r.id === seed.id))
  return [...stored, ...missing]
}

/** Mã vai trò: bỏ dấu, gạch nối, để dùng làm khóa ổn định khi tạo vai trò mới. */
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'vai-tro'
}

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<RoleDefinition[]>(() => normalize(readShared(STORAGE_KEY, seedRoles())))

  useEffect(() => {
    writeShared(STORAGE_KEY, roles)
  }, [roles])

  useEffect(() => {
    return subscribeShared(STORAGE_KEY, () => {
      const next = normalize(readShared(STORAGE_KEY, seedRoles()))
      setRoles((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    })
  }, [])

  const value = useMemo<RolesContextValue>(() => {
    const byId = new Map(roles.map((r) => [r.id, r]))

    function createRole(input: { name: string; description?: string; copyFrom?: string }): RoleDefinition {
      const name = input.name.trim()
      let id = slugify(name)
      let suffix = 2
      while (byId.has(id)) {
        id = `${slugify(name)}-${suffix}`
        suffix += 1
      }
      const source = input.copyFrom ? byId.get(input.copyFrom) : undefined
      const created: RoleDefinition = {
        id,
        name,
        description: input.description?.trim() || undefined,
        // Vai trò mới không bao giờ là super — quyền cao nhất chỉ thuộc vai trò hệ thống.
        enabledModules: source && !source.isSuper ? [...source.enabledModules] : [],
        permissions: source && !source.isSuper ? [...source.permissions] : [],
        scopes: source && !source.isSuper ? { ...source.scopes } : {},
      }
      setRoles((prev) => [...prev, created])
      return created
    }

    function updateRole(id: string, updates: Partial<Omit<RoleDefinition, 'id' | 'system'>>) {
      setRoles((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          // Không cho hạ cờ isSuper của vai trò hệ thống bằng đường sửa quyền thông thường.
          const next = { ...r, ...updates }
          return r.system ? { ...next, isSuper: r.isSuper, system: true } : next
        }),
      )
    }

    function deleteRole(id: string) {
      setRoles((prev) => prev.filter((r) => r.id !== id || r.system))
    }

    return {
      roles,
      roleById: (id) => byId.get(id),
      roleName: (id) => byId.get(id)?.name ?? id,
      createRole,
      updateRole,
      deleteRole,
      resetRoles: () => setRoles(seedRoles()),
    }
  }, [roles])

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
}

export function useRoles() {
  const ctx = useContext(RolesContext)
  if (!ctx) throw new Error('useRoles must be used within RolesProvider')
  return ctx
}

export type { ModuleKey, PermissionKey, RoleDefinition, ScopeAxis, ScopeSelection }
