import type { Integration } from "../types"

// Mock Integrations
export const mockIntegrations: Integration[] = [
  {
    id: "int-1",
    application_id: "salesforce",
    application_name: "Salesforce",
    status: "not_synced",
    last_sync: null,
    version: 12,
    description: "CRM and customer data management",
    icon: "☁️",
  },
  {
    id: "int-2",
    application_id: "hubspot",
    application_name: "HubSpot",
    status: "not_synced",
    last_sync: null,
    version: 8,
    description: "Marketing and sales automation",
    icon: "🟠",
  },
  {
    id: "int-3",
    application_id: "stripe",
    application_name: "Stripe",
    status: "not_synced",
    last_sync: null,
    version: 15,
    description: "Payment processing and billing",
    icon: "💳",
  },
  {
    id: "int-4",
    application_id: "slack",
    application_name: "Slack",
    status: "not_synced",
    last_sync: null,
    version: 5,
    description: "Team communication and collaboration",
    icon: "💬",
  },
  {
    id: "int-5",
    application_id: "zendesk",
    application_name: "Zendesk",
    status: "not_synced",
    last_sync: null,
    version: 9,
    description: "Customer support and ticketing",
    icon: "🎫",
  },
  {
    id: "int-6",
    application_id: "intercom",
    application_name: "Intercom",
    status: "not_synced",
    last_sync: null,
    version: 6,
    description: "Customer messaging and engagement",
    icon: "💌",
  },
]

export function getIntegrationById(id: string): Integration | undefined {
  return mockIntegrations.find((integration) => integration.id === id)
}
