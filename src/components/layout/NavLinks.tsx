import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { useSyncStore } from "../../stores/syncStore"
import { MaterialIcon } from "../MaterialIcon"

interface NavLinksProps {
  orientation?: "vertical" | "horizontal"
}

export function NavLinks({ orientation = "vertical" }: NavLinksProps) {
  const { syncData } = useSyncStore()
  const conflictCount = Object.values(syncData).reduce(
    (sum, d) => sum + d.changes.filter((c) => !c.resolved).length,
    0,
  )

  const base =
    orientation === "horizontal"
      ? "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
      : "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"

  const active = "bg-surface-container-highest text-on-surface shadow-sm"
  const inactive =
    "text-on-surface-variant hover:bg-surface hover:text-on-surface"

  const iconSize = orientation === "horizontal" ? "text-[16px]" : "text-[20px]"
  const labelSize = orientation === "horizontal" ? "text-xs" : "text-sm"

  return (
    <>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        {({ isActive }) => (
          <div className="flex items-center gap-2">
            <MaterialIcon name="dashboard" filled={isActive} className={iconSize} />
            <span className={`font-label ${labelSize} ${isActive ? "font-semibold" : "font-medium"}`}>
              Integrations
            </span>
          </div>
        )}
      </NavLink>

      <NavLink
        to="/conflicts"
        className={({ isActive }) =>
          `${base} justify-between ${isActive ? active : inactive}`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-2">
              <MaterialIcon name="table_rows" filled={isActive} className={iconSize} />
              <span className={`font-label ${labelSize} ${isActive ? "font-semibold" : "font-medium"}`}>
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
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        {({ isActive }) => (
          <div className="flex items-center gap-2">
            <MaterialIcon name="history" filled={isActive} className={iconSize} />
            <span className={`font-label ${labelSize} ${isActive ? "font-semibold" : "font-medium"}`}>
              Logs
            </span>
          </div>
        )}
      </NavLink>
    </>
  )
}
