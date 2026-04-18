interface MaterialIconProps {
  name: string
  filled?: boolean
  className?: string
}

export function MaterialIcon({ name, filled = false, className }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ""}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  )
}
