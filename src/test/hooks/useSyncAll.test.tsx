import { describe, it, expect, beforeEach, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useSyncAll } from "../../hooks/useSyncAll"
import { useIntegrationStore } from "../../stores/integrationStore"
import { useSyncStore } from "../../stores/syncStore"
import { ApiService } from "../../services/api"
import type { Integration, SyncApiResponse } from "../../types"

vi.mock("../../services/api", () => ({
  ApiService: {
    fetchSyncData: vi.fn(),
  },
}))

const integrations: Integration[] = [
  {
    id: "int-1",
    application_id: "salesforce",
    application_name: "Salesforce",
    status: "not_synced",
    last_sync: null,
    version: 1,
    description: "",
  },
  {
    id: "int-2",
    application_id: "hubspot",
    application_name: "HubSpot",
    status: "not_synced",
    last_sync: null,
    version: 2,
    description: "",
  },
]

function buildResponse(hasChanges: boolean): SyncApiResponse {
  return {
    sync_approval: {
      application_name: "X",
      changes: hasChanges
        ? [
            {
              id: "c1",
              field_name: "email",
              change_type: "UPDATE",
              current_value: "a",
              new_value: "b",
            },
          ]
        : [],
    },
    metadata: {},
  }
}

describe("useSyncAll", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useIntegrationStore.setState({ integrations: integrations.map((i) => ({ ...i })) })
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  it("sets each integration to synced/conflict based on its response", async () => {
    vi.mocked(ApiService.fetchSyncData)
      .mockResolvedValueOnce(buildResponse(false))
      .mockResolvedValueOnce(buildResponse(true))

    const { result } = renderHook(() => useSyncAll())

    await act(async () => {
      await result.current.syncAll()
    })

    const [first, second] = useIntegrationStore.getState().integrations
    expect(first.status).toBe("synced")
    expect(first.version).toBe(2)
    expect(second.status).toBe("conflict")
    expect(second.version).toBe(3)
  })

  it("sets integration status to error when its sync rejects", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    vi.mocked(ApiService.fetchSyncData)
      .mockResolvedValueOnce(buildResponse(false))
      .mockRejectedValueOnce({
        type: "gateway_error",
        status: 502,
        message: "down",
      })

    const { result } = renderHook(() => useSyncAll())

    await act(async () => {
      await result.current.syncAll()
    })

    const [first, second] = useIntegrationStore.getState().integrations
    expect(first.status).toBe("synced")
    expect(second.status).toBe("error")
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it("guards against concurrent syncAll invocations", async () => {
    const resolvers: Array<(value: SyncApiResponse) => void> = []
    vi.mocked(ApiService.fetchSyncData).mockImplementation(
      () =>
        new Promise<SyncApiResponse>((resolve) => {
          resolvers.push(resolve)
        }),
    )

    const { result } = renderHook(() => useSyncAll())

    let firstCall: Promise<void> | undefined
    let secondCall: Promise<void> | undefined
    act(() => {
      firstCall = result.current.syncAll()
      secondCall = result.current.syncAll()
    })

    expect(ApiService.fetchSyncData).toHaveBeenCalledTimes(integrations.length)

    await act(async () => {
      resolvers.forEach((resolve) => resolve(buildResponse(false)))
      await Promise.all([firstCall, secondCall])
    })

    expect(ApiService.fetchSyncData).toHaveBeenCalledTimes(integrations.length)
  })

  it("reflects isSyncingAll from the integration store", () => {
    useIntegrationStore.setState({
      integrations: integrations.map((integration, index) =>
        index === 0 ? { ...integration, status: "syncing" } : integration,
      ),
    })

    const { result } = renderHook(() => useSyncAll())
    expect(result.current.isSyncingAll).toBe(true)
  })
})
