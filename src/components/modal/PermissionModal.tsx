import { useMemo, useState } from 'react'
import type { Category } from '../../types/dtr'
import {
  moduleRegistry,
  permissionKey,
  scopeAxisLabels,
  type ModuleKey,
  type PermissionKey,
  type RoleDefinition,
  type ScopeAxis,
} from '../../types/permission'
import ToggleSwitch from '../form/ToggleSwitch'
import ScopeMultiSelect, { type ScopeOption } from '../form/ScopeMultiSelect'

type PermissionModalProps = {
  role: RoleDefinition
  categories: Category[]
  rooms: string[]
  onCancel: () => void
  onSave: (updates: Pick<RoleDefinition, 'enabledModules' | 'permissions' | 'scopes'>) => void
}

const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-6 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-6 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold) disabled:cursor-not-allowed disabled:opacity-50"

/**
 * Modal "Phân quyền chức năng" — tầng QUYỀN và PHẠM VI DỮ LIỆU của một vai trò.
 * Mỗi thẻ là một module: công tắc bật/tắt, các ô tick hành động, và ô chọn phạm vi nếu
 * module đó khai báo trục phạm vi. Toàn bộ render từ moduleRegistry.
 */
export default function PermissionModal({ role, categories, rooms, onCancel, onSave }: PermissionModalProps) {
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(role.enabledModules)
  const [permissions, setPermissions] = useState<PermissionKey[]>(role.permissions)
  const [scopes, setScopes] = useState(role.scopes)

  const scopeOptions = useMemo<Record<ScopeAxis, ScopeOption[]>>(
    () => ({
      category: categories.map((c) => ({ value: c.id, label: c.title })),
      room: rooms.map((r) => ({ value: r, label: r })),
    }),
    [categories, rooms],
  )

  const dirty =
    JSON.stringify([role.enabledModules, role.permissions, role.scopes]) !==
    JSON.stringify([enabledModules, permissions, scopes])

  function toggleModule(moduleKey: ModuleKey, on: boolean) {
    setEnabledModules((prev) => (on ? [...prev, moduleKey] : prev.filter((m) => m !== moduleKey)))
    if (on) {
      // Bật module mà chưa tick gì thì mặc định cho quyền Xem để vào được trang.
      const viewKey = permissionKey(moduleKey, 'view')
      setPermissions((prev) =>
        prev.some((p) => p.startsWith(`${moduleKey}.`)) ? prev : [...prev, viewKey],
      )
    }
  }

  function toggleAction(key: PermissionKey, on: boolean) {
    setPermissions((prev) => (on ? [...prev, key] : prev.filter((p) => p !== key)))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px] max-[640px]:items-end max-[640px]:p-0"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[90svh] w-full max-w-[720px] flex-col rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] shadow-[0_30px_60px_var(--shadow-strong)] max-[640px]:max-h-[92svh] max-[640px]:rounded-b-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-(--hairline) px-7 py-5 max-[640px]:px-5">
          <div className="flex items-center gap-2.5">
            <span className="font-['Open_Sans',sans-serif] text-lg font-extrabold text-(--text-primary)">
              Phân quyền chức năng
            </span>
            <span className="rounded border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-2 py-0.5 text-[12px] font-bold text-(--gold-bright)">
              {role.name}
            </span>
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
            onClick={onCancel}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3.5 overflow-y-auto px-7 py-5 max-[640px]:px-5">
          {role.isSuper && (
            <p className="m-0 rounded-lg border border-[rgba(37,99,235,0.25)] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-[13px] text-(--text-secondary)">
              Đây là vai trò quyền cao nhất — luôn có toàn bộ chức năng và mọi phạm vi dữ liệu, không
              chỉnh được.
            </p>
          )}

          {moduleRegistry.map((module) => {
            const on = enabledModules.includes(module.key)
            const locked = Boolean(role.isSuper)
            return (
              <div
                className="rounded-xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-4.5 py-4 max-[640px]:px-3.5"
                key={module.key}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-['Open_Sans',sans-serif] text-[14.5px] font-bold text-(--text-primary)">
                    {module.label}
                  </span>
                  <ToggleSwitch
                    checked={locked || on}
                    disabled={locked}
                    label={`Bật ${module.label}`}
                    onChange={(next) => toggleModule(module.key, next)}
                  />
                </div>

                {(locked || on) && (
                  <>
                    <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2.5 max-[640px]:grid-cols-2 max-[420px]:grid-cols-1">
                      {module.actions.map((action) => {
                        const key = permissionKey(module.key, action.key)
                        return (
                          <label
                            className={`flex items-center gap-2 text-[13px] text-(--text-secondary) ${
                              locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            }`}
                            key={key}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-(--gold)"
                              disabled={locked}
                              checked={locked || permissions.includes(key)}
                              onChange={(e) => toggleAction(key, e.target.checked)}
                            />
                            <span>{action.label}</span>
                          </label>
                        )
                      })}
                    </div>

                    {module.scopeAxes.length > 0 && (
                      <div className="mt-3.5 grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
                        {module.scopeAxes.map((axis) => (
                          <div className="flex flex-col gap-1.5" key={axis}>
                            <span className="text-[12px] font-bold text-(--text-tertiary)">
                              {scopeAxisLabels[axis]}
                            </span>
                            <ScopeMultiSelect
                              options={scopeOptions[axis]}
                              disabled={locked}
                              value={locked ? null : (scopes[axis] ?? null)}
                              onChange={(next) => setScopes((prev) => ({ ...prev, [axis]: next }))}
                              placeholder="Chưa chọn phạm vi nào"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 border-t border-(--hairline) px-7 py-4 max-[640px]:px-5 max-[640px]:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" className={btnSecondaryClass} onClick={onCancel}>
            Huỷ
          </button>
          <button
            type="button"
            className={btnPrimaryClass}
            disabled={role.isSuper || !dirty}
            onClick={() => onSave({ enabledModules, permissions, scopes })}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
