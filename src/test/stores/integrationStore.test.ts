import { describe, it, expect, beforeEach } from 'vitest'
import { useIntegrationStore } from '../../stores/integrationStore'
import { mockIntegrations } from '../../data/mockData'

describe('integrationStore', () => {
  beforeEach(() => {
    useIntegrationStore.setState({
      integrations: mockIntegrations.map((i) => ({ ...i })),
      selectedIntegrationId: null,
      filter: 'all',
    })
  })

  describe('getIntegrationById', () => {
    it('returns the integration for a valid id', () => {
      const result = useIntegrationStore.getState().getIntegrationById('int-1')
      expect(result?.application_name).toBe('Salesforce')
    })

    it('returns undefined for an unknown id', () => {
      expect(useIntegrationStore.getState().getIntegrationById('unknown')).toBeUndefined()
    })
  })

  describe('updateIntegrationStatus', () => {
    it('updates only the targeted integration status', () => {
      useIntegrationStore.getState().updateIntegrationStatus('int-1', 'syncing')
      const integrations = useIntegrationStore.getState().integrations
      expect(integrations.find((i) => i.id === 'int-1')?.status).toBe('syncing')
      expect(integrations.find((i) => i.id === 'int-2')?.status).toBe('not_synced')
    })
  })

  describe('updateIntegration', () => {
    it('applies partial updates to the targeted integration', () => {
      useIntegrationStore.getState().updateIntegration('int-1', {
        status: 'conflict',
        version: 99,
      })
      const integration = useIntegrationStore.getState().getIntegrationById('int-1')
      expect(integration?.status).toBe('conflict')
      expect(integration?.version).toBe(99)
      expect(integration?.application_name).toBe('Salesforce') // unchanged
    })
  })

  describe('setFilter', () => {
    it('updates the filter value', () => {
      useIntegrationStore.getState().setFilter('conflict')
      expect(useIntegrationStore.getState().filter).toBe('conflict')
    })
  })

  describe('setSelectedIntegration', () => {
    it('stores the selected integration id', () => {
      useIntegrationStore.getState().setSelectedIntegration('int-3')
      expect(useIntegrationStore.getState().selectedIntegrationId).toBe('int-3')
    })

    it('can be cleared to null', () => {
      useIntegrationStore.getState().setSelectedIntegration('int-3')
      useIntegrationStore.getState().setSelectedIntegration(null)
      expect(useIntegrationStore.getState().selectedIntegrationId).toBeNull()
    })
  })
})
