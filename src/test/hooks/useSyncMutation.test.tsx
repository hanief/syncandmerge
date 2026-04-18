import { describe, it, expect, beforeEach, vi } from "vitest"
import type { ReactNode } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSyncMutation } from "../../hooks/useSyncMutation"
import { useIntegrationStore } from "../../stores/integrationStore"
import { useSyncStore } from "../../stores/syncStore"
import { ApiService } from "../../services/api"
import type { Integration, SyncApiResponse } from "../../types"

vi.mock("../../services/api", () => ({
  ApiService: {
    fetchSyncData: vi.fn(),
  },
}))

const integration: Integration = {
  id: "int-1",
  application_id: "salesforce",
  application_name: "Salesforce",
  status: "not_synced",
  last_sync: null,
  version: 3,
  description: "",
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function buildResponse(hasChanges: boolean): SyncApiResponse {
  return {
    sync_approval: {
      application_name: "Salesforce",
      changes: hasChanges
        ? [
            {
              id: "c1",
              field_name: "email",
              change_type: "UPDATE",
              current_value: "a@b.com",
              new_value: "b@c.com",
            },
          ]
        : [],
    },
    metadata: {},
  }
}

describe("useSyncMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useIntegrationStore.setState({ integrations: [integration] })
    useSyncStore.setState({ syncData: {}, syncHistory: {} })
  })

  it("marks integration as syncing on mutate and synced on success with no conflicts", async () => {
    vi.mocked(ApiService.fetchSyncData).mockResolvedValue(buildResponse(false))

    const { result } = renderHook(() => useSyncMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        integrationId: integration.id,
        applicationId: integration.application_id,
      })
    })

    const updated = useIntegrationStore.getState().integrations[0]
    expect(updated.status).toBe("synced")
    expect(updated.version).toBe(integration.version + 1)
    expect(updated.last_sync).not.toBeNull()
  })

  it("marks integration as conflict when the response has changes", async () => {
    vi.mocked(ApiService.fetchSyncData).mockResolvedValue(buildResponse(true))

    const { result } = renderHook(() => useSyncMutation(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        integrationId: integration.id,
        applicationId: integration.application_id,
      })
    })

    expect(useIntegrationStore.getState().integrations[0].status).toBe(
      "conflict",
    )
  })

  it("marks integration as error when the API call rejects", async () => {
    vi.mocked(ApiService.fetchSyncData).mockRejectedValue({
      type: "server_error",
      status: 500,
      message: "boom",
    })

    const { result } = renderHook(() => useSyncMutation(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          integrationId: integration.id,
          applicationId: integration.application_id,
        })
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      expect(useIntegrationStore.getState().integrations[0].status).toBe(
        "error",
      )
    })
  })
})
