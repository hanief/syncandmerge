import { useState, useCallback, useEffect } from 'react';
import type { ToastType } from '../components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

const initialState: ToastState = {
  message: '',
  type: 'info',
  isVisible: false,
};

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>(initialState);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.isVisible, duration, hideToast]);

  return {
    toast,
    showToast,
    hideToast,
  };
}
