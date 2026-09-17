type ToggleSwitchProps = {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  disabled?: boolean
}

/** Công tắc bật/tắt — dùng <button> thật để bàn phím và trình đọc màn hình vẫn dùng được. */
export default function ToggleSwitch({ checked, onChange, label, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${checked ? 'bg-(--gold)' : 'bg-[rgba(159,176,201,0.35)]'}`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-150 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  )
}
