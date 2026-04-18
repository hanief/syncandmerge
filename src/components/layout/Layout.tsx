import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { NavLinks } from "./NavLinks"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64 relative min-w-0 bg-surface overflow-y-auto">
        <nav className="md:hidden sticky top-0 z-40 bg-surface-container-low border-b border-outline-variant/20">
          <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
            <NavLinks orientation="horizontal" />
          </div>
        </nav>

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
