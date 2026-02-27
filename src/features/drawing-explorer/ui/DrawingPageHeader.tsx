import { Button } from '@/shared/ui'

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
          <Button
            variant="ghost"
            onClick={onBack}
            className="shrink-0 px-0 py-0 text-[10px] text-gray-500 hover:bg-transparent hover:text-gray-700 sm:text-[15px]"
            aria-label={backLabel}
          >
            ← {backLabel}
          </Button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className={`min-w-0 flex-1 truncate ${titleClassName}`}>{title}</h1>
        </div>
        {actions.length > 0 && (
          <nav className="flex shrink-0 items-center gap-2">
            {actions.map((action) => {
              const variant = action.variant ?? 'secondary'
              const buttonVariant =
                variant === 'primary'
                  ? 'primary'
                  : variant === 'neutral'
                    ? 'ghost'
                    : 'secondary'
              return (
                <Button
                  key={action.label}
                  variant={buttonVariant}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={
                    variant === 'neutral'
                      ? 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      : 'text-[10px] sm:text-[15px]'
                  }
                  aria-label={action.ariaLabel ?? action.label}
                >
                  {action.label}
                </Button>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
