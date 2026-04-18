import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { useSyncStore } from "../../stores/syncStore"

export function Sidebar() {
  const { syncData } = useSyncStore()
  const conflictCount = Object.values(syncData).reduce(
    (sum, d) => sum + d.changes.filter((c) => !c.resolved).length,
    0,
  )

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low p-4 gap-2 z-40 transition-all duration-200 ease-in-out">
      {/* Header */}
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

      {/* Main Nav Links */}
      <div className="flex-1 flex flex-col gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-highest text-on-surface transition-colors shadow-sm"
              : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                dashboard
              </span>
              <span
                className={`font-label text-sm ${isActive ? "font-semibold" : "font-medium"}`}
              >
                Integrations
              </span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/conflicts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors justify-between ${
              isActive
                ? "bg-surface-container-highest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:bg-surface hover:text-on-surface"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  table_rows
                </span>
                <span
                  className={`font-label text-sm ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  Conflicts
                </span>
              </div>
              {conflictCount > 0 && (
                <motion.span
                  className="bg-error-container text-on-error-container text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {conflictCount}
                </motion.span>
              )}
            </>
          )}
        </NavLink>
        <NavLink
          to="/logs"
          className={({ isActive }) =>
            isActive
              ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-highest text-on-surface transition-colors shadow-sm"
              : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                history
              </span>
              <span
                className={`font-label text-sm ${isActive ? "font-semibold" : "font-medium"}`}
              >
                Logs
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
