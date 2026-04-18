import { motion, AnimatePresence } from 'framer-motion';
import { MaterialIcon } from './MaterialIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success-container',
          icon: 'check_circle',
          iconColor: 'text-on-success-container',
          textColor: 'text-on-success-container-dark',
          border: 'border-success',
        };
      case 'error':
        return {
          bg: 'bg-error-container',
          icon: 'error',
          iconColor: 'text-on-error-container',
          textColor: 'text-on-error-container',
          border: 'border-error',
        };
      case 'warning':
        return {
          bg: 'bg-warning-container',
          icon: 'warning',
          iconColor: 'text-accent-orange',
          textColor: 'text-on-warning-container',
          border: 'border-accent-orange',
        };
      case 'info':
      default:
        return {
          bg: 'bg-tertiary-fixed',
          icon: 'info',
          iconColor: 'text-on-tertiary-container',
          textColor: 'text-on-tertiary-fixed',
          border: 'border-on-tertiary-container',
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="alert"
          aria-live="assertive"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-9999 ${styles.bg} px-4 py-2.5 rounded-lg shadow-md border-l-4 ${styles.border} min-w-65 max-w-105`}
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-2">
            <MaterialIcon name={styles.icon} filled className={`text-[16px] shrink-0 ${styles.iconColor}`} />
            <p className={`font-body text-xs ${styles.textColor} flex-1`}>{message}</p>
            <button
              onClick={onClose}
              className={`${styles.iconColor} hover:opacity-70 transition-opacity shrink-0`}
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
