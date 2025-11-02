import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link'
type ButtonTone = 'primary' | 'neutral' | 'secondary' | 'success' | 'warning' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  xl: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
}

const solidToneClasses: Record<ButtonTone, string> = {
  primary:
    'bg-primary text-[#333333] hover:bg-primary-dark active:bg-[#FFB700]',
  neutral:
    'bg-neutral-800 text-white hover:bg-neutral-900 active:bg-neutral-950',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] active:bg-[var(--color-secondary-dark)]/90',
  success:
    'bg-[var(--color-success)] text-white hover:bg-[#0f9a73] active:bg-[#0c7f5c]',
  warning:
    'bg-[var(--color-warning)] text-neutral-900 hover:bg-[#d48709] active:bg-[#b36c05]',
  danger:
    'bg-[var(--color-error)] text-white hover:bg-[#dc2626] active:bg-[#b91c1c]',
}

const outlineToneClasses: Record<ButtonTone, string> = {
  primary:
    'border border-gray-300 text-[#333333] bg-white hover:bg-gray-50',
  neutral:
    'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
  secondary:
    'border border-[var(--color-secondary)] text-[var(--color-secondary)] bg-white hover:bg-[var(--color-secondary)]/10',
  success:
    'border border-[var(--color-success)] text-[var(--color-success)] bg-white hover:bg-[var(--color-success)]/10',
  warning:
    'border border-[var(--color-warning)] text-[var(--color-warning)] bg-white hover:bg-[var(--color-warning)]/10',
  danger:
    'border border-[var(--color-error)] text-[var(--color-error)] bg-white hover:bg-[var(--color-error)]/10',
}

const ghostToneClasses: Record<ButtonTone, string> = {
  primary:
    'text-[#333333] hover:bg-primary/10',
  neutral:
    'text-gray-600 hover:bg-gray-100',
  secondary:
    'text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10',
  success:
    'text-[var(--color-success)] hover:bg-[var(--color-success)]/10',
  warning:
    'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10',
  danger:
    'text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
}

const linkToneClasses: Record<ButtonTone, string> = {
  primary: 'text-[#DAA520]',
  neutral: 'text-gray-600',
  secondary: 'text-[var(--color-secondary)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-error)]',
}

const variantToneLookup: Record<ButtonVariant, Record<ButtonTone, string>> = {
  solid: solidToneClasses,
  outline: outlineToneClasses,
  ghost: ghostToneClasses,
  link: linkToneClasses,
}

const variantBaseClasses: Record<ButtonVariant, string> = {
  solid: '',
  outline: '',
  ghost: '',
  link: 'p-0 h-auto underline-offset-4 focus-visible:outline-none',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className = '',
    variant = 'solid',
    tone = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingText,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading
  const content = loading ? loadingText ?? children : children
  const sizeClass = variant === 'link' ? 'h-auto px-0 py-0 text-sm' : sizeClasses[size]
  const gapClass = size === 'icon' ? 'gap-0' : ''

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:pointer-events-none disabled:opacity-60 disabled:bg-gray-300',
        sizeClass,
        variantToneLookup[variant][tone],
        variantBaseClasses[variant],
        fullWidth ? 'w-full' : '',
        size === 'icon' ? 'rounded-full' : '',
        gapClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="text-current" />
          {content}
        </>
      ) : (
        content
      )}
    </button>
  )
})
