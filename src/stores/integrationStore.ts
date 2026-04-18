import { create } from "zustand"
import type { Integration, IntegrationStatus } from "../types"
import { mockIntegrations } from "../data/mockData"

interface IntegrationState {
  integrations: Integration[]
  selectedIntegrationId: string | null
  filter: IntegrationStatus | "all"

  setIntegrations: (integrations: Integration[]) => void
  setSelectedIntegration: (id: string | null) => void
  setFilter: (filter: IntegrationStatus | "all") => void
  getIntegrationById: (id: string) => Integration | undefined
  updateIntegrationStatus: (id: string, status: IntegrationStatus) => void
  updateIntegration: (id: string, updates: Partial<Integration>) => void
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: mockIntegrations,
  selectedIntegrationId: null,
  filter: "all",

  setIntegrations: (integrations) => set({ integrations }),

  setSelectedIntegration: (id) => set({ selectedIntegrationId: id }),

  setFilter: (filter) => set({ filter }),

  getIntegrationById: (id) => {
    return get().integrations.find((integration) => integration.id === id)
  },

  updateIntegrationStatus: (id, status) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id ? { ...integration, status } : integration,
      ),
    }))
  },

  updateIntegration: (id, updates) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id ? { ...integration, ...updates } : integration,
      ),
    }))
  },
}))

export function useIntegrationById(
  id: string | undefined,
): Integration | undefined {
  return useIntegrationStore((state) =>
    id ? state.integrations.find((integration) => integration.id === id) : undefined,
  )
}

export function useIsAnySyncing(): boolean {
  return useIntegrationStore((state) =>
    state.integrations.some((integration) => integration.status === "syncing"),
  )
}
