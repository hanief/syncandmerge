import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useToast } from "../../hooks/useToast"

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts hidden with empty defaults", () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast.isVisible).toBe(false)
    expect(result.current.toast.message).toBe("")
    expect(result.current.toast.type).toBe("info")
  })

  it("shows a toast with the supplied message and type", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast("Saved", "success")
    })

    expect(result.current.toast).toEqual({
      message: "Saved",
      type: "success",
      isVisible: true,
    })
  })

  it("auto-hides after the configured duration", () => {
    const { result } = renderHook(() => useToast(1000))

    act(() => {
      result.current.showToast("Gone soon")
    })
    expect(result.current.toast.isVisible).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.toast.isVisible).toBe(false)
  })

  it("hideToast manually dismisses the toast", () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast("bye")
    })
    act(() => {
      result.current.hideToast()
    })

    expect(result.current.toast.isVisible).toBe(false)
  })

  it("replaces the displayed message when showToast is called again", () => {
    const { result } = renderHook(() => useToast(1000))

    act(() => {
      result.current.showToast("first")
    })
    act(() => {
      result.current.showToast("second", "error")
    })

    expect(result.current.toast.message).toBe("second")
    expect(result.current.toast.type).toBe("error")
    expect(result.current.toast.isVisible).toBe(true)
  })
})
