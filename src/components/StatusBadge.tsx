import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: string;
  count?: number;
}

export function StatusBadge({ status, count }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'synced':
        return {
          container: 'bg-[#dcfce7] text-[#166534]',
          icon: <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />,
          label: 'Synced'
        };
      case 'conflict':
        return {
          container: 'bg-[#fff7ed] text-[#9a3412]',
          icon: <span className="material-symbols-outlined text-[14px]">warning</span>,
          label: 'Conflict'
        };
      case 'syncing':
        return {
          container: 'bg-tertiary-container text-on-tertiary shadow-sm',
          icon: <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>,
          label: 'Syncing'
        };
      case 'error':
        return {
          container: 'bg-error-container text-on-error-container',
          icon: <span className="material-symbols-outlined text-[14px]">error</span>,
          label: 'Error'
        };
      case 'not_synced':
        return {
          container: 'bg-surface-variant text-on-surface-variant',
          icon: <span className="material-symbols-outlined text-[14px]">pause_circle</span>,
          label: 'Not Synced'
        };
      default:
        return {
          container: 'bg-surface-variant text-on-surface-variant',
          icon: <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />,
          label: status
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <motion.div
      className={`px-2.5 py-1 rounded-full ${styles.container} flex items-center gap-1.5`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {styles.icon}
      <span className="font-label text-xs font-semibold tracking-wide uppercase">
        {styles.label}
      </span>
      {count !== undefined && count > 0 && (
        <motion.span
          className="ml-0.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          ({count})
        </motion.span>
      )}
    </motion.div>
  );
}
