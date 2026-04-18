import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIntegrationStore } from '../stores/integrationStore';
import { useSyncStore } from '../stores/syncStore';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/format';
import type { Integration, IntegrationStatus } from '../types';

interface FilterButtonProps {
  label: string
  value: IntegrationStatus | 'all'
  active: boolean
  onClick: () => void
}

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-label text-sm font-semibold transition-colors shadow-sm ${
        active
          ? 'bg-on-surface text-surface'
          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  )
}

export function IntegrationsList() {
  const navigate = useNavigate();
  const { integrations, filter, setFilter, setSelectedIntegration, updateIntegrationStatus, updateIntegration } = useIntegrationStore();
  const { fetchSyncData } = useSyncStore();
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const filteredIntegrations =
    filter === 'all'
      ? integrations
      : integrations.filter((integration) => integration.status === filter);

  const handleIntegrationClick = (integration: Integration) => {
    setSelectedIntegration(integration.id);
    navigate(`/integrations/${integration.id}`);
  };

  const handleSyncAll = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);

    // Mark all as syncing immediately
    integrations.forEach((i) => updateIntegrationStatus(i.id, 'syncing'));

    await Promise.allSettled(
      integrations.map(async (integration) => {
        try {
          await fetchSyncData(integration.id, integration.application_id);
          const { hasConflicts } = useSyncStore.getState().getSyncData(integration.id);
          updateIntegration(integration.id, {
            status: hasConflicts ? 'conflict' : 'synced',
            last_sync: new Date().toISOString(),
            version: (useIntegrationStore.getState().integrations.find(i => i.id === integration.id)?.version ?? integration.version) + 1,
          });
        } catch {
          updateIntegrationStatus(integration.id, 'error');
        }
      }),
    );

    setIsSyncingAll(false);
  };

  return (
    <div className="w-full">
      {/* Editorial Header */}
      <div className="mb-10 w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-3">
              Active Integrations
            </h1>
            <p className="font-body text-base text-on-surface-variant leading-relaxed">
              Monitor the health and synchronization status of your connected services.
              Resolve conflicts promptly to maintain data integrity across your workspace.
            </p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="bg-primary text-on-primary flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-label font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-[20px] ${isSyncingAll ? 'animate-spin' : ''}`}>sync</span>
            {isSyncingAll ? 'Syncing...' : 'Sync All Now'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <FilterButton label="All" value="all" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterButton label="Synced" value="synced" active={filter === 'synced'} onClick={() => setFilter('synced')} />
          <FilterButton label="Conflict" value="conflict" active={filter === 'conflict'} onClick={() => setFilter('conflict')} />
          <FilterButton label="Syncing" value="syncing" active={filter === 'syncing'} onClick={() => setFilter('syncing')} />
          <FilterButton label="Error" value="error" active={filter === 'error'} onClick={() => setFilter('error')} />
        </div>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            onClick={() => handleIntegrationClick(integration)}
            className={`bg-surface-container-lowest rounded-xl p-6 relative group transition-colors duration-300 hover:bg-surface-container-highest card-shadow flex flex-col h-full cursor-pointer ${
              integration.status === 'conflict' ? 'border border-error-container/50' : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {integration.status === 'conflict' && (
              <div className="absolute inset-0 rounded-xl bg-error-container/5 pointer-events-none" />
            )}

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center p-2">
                <span className="text-2xl">{integration.icon}</span>
              </div>

              <StatusBadge status={integration.status} count={integration.conflict_count} />
            </div>

            <div className="mb-6 flex-1 relative z-10">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                {integration.application_name}
              </h3>
              <p className="font-body text-sm text-on-surface-variant">
                {integration.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-6 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/15">
                <span className="font-label text-xs font-medium text-on-surface-variant">Last Sync</span>
                <span className={`font-body text-sm font-medium ${
                  integration.status === 'conflict' ? 'text-on-error-container' : 'text-on-surface'
                }`}>
                  {formatDate(integration.last_sync)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-label text-xs font-medium text-on-surface-variant">API Version</span>
                <span className="font-body text-sm font-medium text-on-surface">v{integration.version}</span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-md font-label text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors text-center border border-transparent relative z-10">
              View Details
            </button>
          </motion.div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <p className="font-body text-on-surface-variant">No integrations found with status: {filter}</p>
        </div>
      )}
    </div>
  );
}
