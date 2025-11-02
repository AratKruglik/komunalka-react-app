import { forwardRef } from 'react'
import type { LabelHTMLAttributes } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className = '', children, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={[
        'block text-sm font-medium text-gray-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </label>
  )
})
