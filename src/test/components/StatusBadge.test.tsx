import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatusBadge } from "../../components/StatusBadge"

describe("StatusBadge", () => {
  it.each([
    ["synced", "Synced"],
    ["conflict", "Conflict"],
    ["syncing", "Syncing"],
    ["error", "Error"],
    ["not_synced", "Not Synced"],
    ["success", "Synced"],
    ["failed", "Failed"],
    ["partial", "Partial"],
  ] as const)('renders "%s" label for status "%s"', (status, expectedLabel) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it("renders count when provided and > 0", () => {
    render(<StatusBadge status="conflict" count={3} />)
    expect(screen.getByText("(3)")).toBeInTheDocument()
  })

  it("does not render count when count is 0", () => {
    render(<StatusBadge status="synced" count={0} />)
    expect(screen.queryByText("(0)")).not.toBeInTheDocument()
  })
})
