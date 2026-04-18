import type { ApiError } from '../types';

interface ErrorMessageProps {
  error: ApiError | Error | string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return { message: error, details: undefined, icon: 'warning' };
    }

    if ('type' in error) {
      const apiError = error as ApiError;
      const icons: Record<ApiError['type'], string> = {
        client_error: 'settings',
        server_error: 'error',
        gateway_error: 'cloud_off',
        network_error: 'signal_wifi_off',
      };

      return {
        message: apiError.message,
        details: apiError.details,
        icon: icons[apiError.type],
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      details: undefined,
      icon: 'warning',
    };
  };

  const { message, details, icon } = getErrorDetails();

  return (
    <div className="bg-error-container rounded-2xl p-6 border-l-4 border-error">
      <div className="flex items-start gap-4">
        <span
          className="material-symbols-outlined text-on-error-container text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="font-headline text-lg font-bold text-on-error-container mb-2">Error</h3>
          <p className="font-body text-sm text-on-error-container mb-2">{message}</p>
          {details && (
            <p className="font-body text-xs text-on-error-container/80 mt-2 p-3 bg-error/10 rounded-lg">
              {details}
            </p>
          )}
          {onRetry && (
            <button
              className="mt-4 px-4 py-2 rounded-lg font-label text-sm font-semibold bg-error text-on-error hover:bg-error/90 transition-colors"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
