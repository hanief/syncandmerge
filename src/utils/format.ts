export function formatDate(dateString: string | null): string {
  if (!dateString) return "Never"

  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) {
    return "Just now"
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatFieldName(fieldName: string): string {
  return fieldName
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    synced: "green",
    syncing: "blue",
    conflict: "yellow",
    error: "red",
    not_synced: "gray",
    success: "green",
    failed: "red",
    partial: "yellow",
    active: "green",
    suspended: "red",
    revoked: "red",
    online: "green",
    offline: "red",
  }

  return colors[status.toLowerCase()] || "gray"
}
