export interface DrawingPageHeaderAction {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'neutral'
  ariaLabel?: string
}

export interface DrawingPageHeaderProps {
  backLabel: string
  onBack: () => void
  title: string
  titleSize?: 'sm' | 'md' | 'lg'
  actions?: DrawingPageHeaderAction[]
}

const titleSizeClasses = {
  sm: 'text-[10px] font-bold text-gray-900 sm:text-[15px]',
  md: 'text-lg font-bold text-gray-900 sm:text-xl',
  lg: 'text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-[30px]',
} as const

export function DrawingPageHeader({
  backLabel,
  onBack,
  title,
  titleSize = 'md',
  actions = [],
}: DrawingPageHeaderProps) {
  const titleClassName = titleSizeClasses[titleSize]

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-3 sm:py-2">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-gray-300">|</span>
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-[10px] text-gray-500 hover:text-gray-700 sm:text-[15px]"
            aria-label={backLabel}
          >
            ← {backLabel}
          </button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className={`min-w-0 flex-1 truncate ${titleClassName}`}>{title}</h1>
        </div>
        {actions.length > 0 && (
          <nav className="flex shrink-0 items-center gap-2">
            {actions.map((action) => {
              const variant = action.variant ?? 'secondary'
              const buttonClass =
                variant === 'primary'
                  ? 'rounded-lg border border-[#E69100] bg-[#E69100] px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#cc7a00] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 sm:text-[15px]'
                  : variant === 'neutral'
                    ? 'rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                    : 'rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 sm:border-[#3907C7]/30 sm:bg-[#3907C7]/10 sm:text-[#3907C7] sm:hover:bg-[#3907C7]/15 sm:disabled:border-gray-200 sm:disabled:bg-gray-50 sm:disabled:text-gray-400 sm:text-[15px]'

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={buttonClass}
                  aria-label={action.ariaLabel ?? action.label}
                >
                  {action.label}
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
