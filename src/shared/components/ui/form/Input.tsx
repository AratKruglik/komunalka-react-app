import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean
  leadingIcon?: ReactNode
  endAdornment?: ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className = '',
    wrapperClassName = '',
    isInvalid = false,
    leadingIcon,
    endAdornment,
    ...props
  },
  ref,
) {
  const hasLeadingIcon = Boolean(leadingIcon)
  const hasEndAdornment = Boolean(endAdornment)

  const baseClasses =
    'w-full py-2.5 rounded-md border border-[var(--color-neutral-200)] text-base text-[var(--color-text-dark)] placeholder:text-[#adaebc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'

  const invalidClasses =
    'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]'

  return (
    <div className={['relative', wrapperClassName].filter(Boolean).join(' ')}>
      {leadingIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={[
          baseClasses,
          isInvalid ? invalidClasses : '',
          hasLeadingIcon ? 'pl-11' : 'pl-4',
          hasEndAdornment ? 'pr-12' : 'pr-4',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-neutral-400)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={isInvalid || undefined}
        {...props}
      />
      {endAdornment ? (
        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
          {endAdornment}
        </span>
      ) : null}
    </div>
  )
})
