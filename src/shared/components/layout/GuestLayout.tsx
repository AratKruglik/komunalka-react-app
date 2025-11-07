import type { ReactNode } from 'react'

interface GuestLayoutProps {
  children: ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-10 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="mx-auto w-full max-w-[1100px]">{children}</div>
    </div>
  )
}
