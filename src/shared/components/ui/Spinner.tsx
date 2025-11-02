import type { HTMLAttributes } from 'react'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-2',
}

export function Spinner({ className = '', size = 'md', ...props }: SpinnerProps) {
  return (
    <span
      className={[
        'inline-flex animate-spin rounded-full border-current border-t-transparent text-primary',
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
