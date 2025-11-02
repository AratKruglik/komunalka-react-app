import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        'rounded-lg border border-[var(--color-border-primary)] bg-white text-[var(--color-text-dark)] shadow-[var(--shadow-sm)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(function CardHeader(
  { className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['flex flex-col gap-1.5 border-b border-[var(--color-border-primary)] px-6 py-5', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className = '', ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={['text-lg font-semibold tracking-tight text-[var(--color-text-dark)]', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    )
  },
)

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className = '', ...props }, ref) {
    return (
      <p
        ref={ref}
        className={['text-sm text-[var(--color-text-secondary)]', className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  },
)

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(function CardContent(
  { className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['px-6 py-6', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(function CardFooter(
  { className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['flex items-center justify-end gap-3 border-t border-[var(--color-border-primary)] px-6 py-4', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})
