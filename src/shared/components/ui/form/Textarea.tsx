import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', isInvalid = false, rows = 4, ...props },
  ref,
) {
  const baseClasses =
    'w-full rounded-md border-[0.5px] border-gray-300 bg-white px-4 py-2.5 text-base text-[#333333] placeholder:text-[#adaebc] transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'

  const invalidClasses =
    'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]'

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[
        baseClasses,
        isInvalid ? invalidClasses : '',
        'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400',
        'resize-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={isInvalid || undefined}
      {...props}
    />
  )
})
