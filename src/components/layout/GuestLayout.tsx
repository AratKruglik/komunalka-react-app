import { ReactNode } from 'react'

interface GuestLayoutProps {
  children: ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-12">
      {children}
    </div>
  )
}