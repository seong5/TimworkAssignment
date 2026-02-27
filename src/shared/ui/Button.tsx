import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** 버튼 크기 */
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-amber-brand text-white hover:bg-amber-brand-hover active:bg-amber-brand-active disabled:bg-gray-300 disabled:text-gray-500',
      secondary:
        'bg-navy-brand text-white hover:bg-navy-brand-hover active:bg-navy-brand-active disabled:bg-gray-300 disabled:text-gray-500',
      outline:
        'border-2 border-amber-brand text-amber-brand hover:bg-amber-brand/10 active:bg-amber-brand/20 disabled:border-gray-300 disabled:text-gray-300',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    }

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-brand disabled:cursor-not-allowed disabled:opacity-50'

    const variantStyle = variantStyles[variant]
    const sizeStyle = sizeStyles[size]
    const widthStyle = fullWidth ? 'w-full' : ''

    const combinedClassName =
      `${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`.trim()

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
