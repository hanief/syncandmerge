export function TopBar() {
  return (
    <header className="w-full sticky top-0 z-50 h-16 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-xl transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-6">
        <span className="text-xl font-headline font-bold tracking-tight text-on-surface">
          DataSync
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="notifications"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
        </button>

        <button
          aria-label="help"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>

        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-surface-container-highest cursor-pointer ml-2">
          <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary font-label text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  )
}
