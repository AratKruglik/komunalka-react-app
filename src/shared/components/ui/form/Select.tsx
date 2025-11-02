import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  isInvalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', isInvalid = false, children, ...props },
  ref,
) {
  const baseClasses =
    'w-full appearance-none rounded-md border border-[var(--color-neutral-200)] bg-white px-4 py-2.5 text-base text-[var(--color-text-dark)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'

  const invalidClasses =
    'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]'

  return (
    <div className="relative">
      <select
        ref={ref}
        className={[
          baseClasses,
          isInvalid ? invalidClasses : '',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-neutral-400)]',
          'pr-10',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={isInvalid || undefined}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-neutral-400)]">
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
})
