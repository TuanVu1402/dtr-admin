import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRoles } from '../context/RolesContext'
import type { ModuleKey, PermissionKey, ScopeAxis } from '../types/permission'
import { inScope, roleCan, roleCanUseModule, roleScope } from './permissions'

/**
 * Cách duy nhất component nên hỏi "tôi được làm gì" — gộp tầng NGƯỜI DÙNG → VAI TRÒ
 * (lấy roleId từ AuthContext, tra RoleDefinition từ RolesContext) rồi trả về tầng
 * QUYỀN và PHẠM VI.
 */
export function usePermissions() {
  const { role: roleId } = useAuth()
  const { roleById } = useRoles()
  const role = roleId ? roleById(roleId) : undefined

  return useMemo(
    () => ({
      role,
      roleId,
      can: (key: PermissionKey) => roleCan(role, key),
      canUseModule: (moduleKey: ModuleKey) => roleCanUseModule(role, moduleKey),
      scope: (axis: ScopeAxis) => roleScope(role, axis),
      inScope: (axis: ScopeAxis, value: string | undefined) => inScope(role, axis, value),
      isSuper: Boolean(role?.isSuper),
    }),
    [role, roleId],
  )
}
