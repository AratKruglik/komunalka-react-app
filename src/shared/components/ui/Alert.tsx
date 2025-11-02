import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  withIcon?: boolean
  icon?: ReactNode
}

const variantTokens: Record<AlertVariant, { accent: string; background: string; border: string }> = {
  info: {
    accent: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  success: {
    accent: '#10b981',
    background: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    accent: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  danger: {
    accent: '#ef4444',
    background: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
}

const variantIcons: Record<AlertVariant, ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  danger: <AlertCircle className="h-4 w-4" />,
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className = '', variant = 'info', withIcon = true, icon, children, ...props },
  ref,
) {
  const visuals = variantTokens[variant]
  const inlineStyles = {
    borderColor: visuals.border,
    backgroundColor: visuals.background,
    '--alert-accent': visuals.accent,
  } as CSSProperties

  return (
    <div
      ref={ref}
      role="alert"
      className={[
        'flex gap-3 rounded-lg border px-4 py-3 text-sm shadow-[var(--shadow-sm)]',
        'bg-white text-[var(--color-text-dark)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={inlineStyles}
      {...props}
    >
      {withIcon ? (
        <span className="mt-0.5 flex items-center justify-center text-[color:var(--alert-accent)]">
          {icon ?? variantIcons[variant]}
        </span>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 text-[var(--color-text-dark)]">{children}</div>
    </div>
  )
})

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(function AlertTitle(
  { className = '', ...props },
  ref,
) {
  return (
    <h4
      ref={ref}
      className={[
        'text-sm font-semibold text-[color:var(--alert-accent)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  function AlertDescription({ className = '', ...props }, ref) {
    return (
      <p
        ref={ref}
        className={['text-sm text-[var(--color-text-secondary)]', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    )
  },
)
