import { NavLinks } from "./NavLinks"

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low p-4 gap-2 z-40">
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
          <svg
            className="w-6 h-6 text-on-surface"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>
        <div>
          <h2 className="font-headline font-black text-on-surface tracking-tight leading-tight text-lg">
            Acme, Inc.
          </h2>
          <p className="font-label text-xs font-medium text-on-surface-variant">
            Enterprise
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <NavLinks orientation="vertical" />
      </div>
    </nav>
  )
}
