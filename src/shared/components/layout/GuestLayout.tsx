import type { ReactNode } from 'react'
import { ThemeToggle } from '../navigation/ThemeToggle'
import { Logo } from '../ui'

interface GuestLayoutProps {
  children: ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 text-gray-900 dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 sm:gap-10">
        <header className="flex items-center justify-between gap-3">
          <Logo size="md" />
          <ThemeToggle />
        </header>
        <div className="flex-1 sm:flex sm:items-center sm:justify-center">
          <div className="w-full max-w-[1100px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
