import type { ApiError } from '../types';

interface ErrorMessageProps {
  error: ApiError | Error | string;
  onRetry?: () => void;
}

interface ErrorPresentation {
  icon: string;
  title: string;
  description: string;
  hint: string;
  details?: string;
}

const API_ERROR_PRESENTATIONS: Record<ApiError['type'], Omit<ErrorPresentation, 'details'>> = {
  client_error: {
    icon: 'settings',
    title: 'Configuration Required',
    description: 'This integration is missing required configuration or credentials.',
    hint: 'Go to your integration settings and verify that all API keys and connection details are correctly filled in.',
  },
  server_error: {
    icon: 'error',
    title: 'Server Error',
    description: 'The server encountered an unexpected problem while processing your request.',
    hint: 'This is usually temporary. Wait a moment, then try again. If the problem persists, contact support.',
  },
  gateway_error: {
    icon: 'cloud_off',
    title: 'Integration Unavailable',
    description: 'The external service is not responding. Its server may be down or unreachable.',
    hint: 'Check the integration provider\'s status page. Try again in a few minutes once the service is back up.',
  },
  network_error: {
    icon: 'signal_wifi_off',
    title: 'Connection Failed',
    description: 'Unable to reach the server. Your network connection may be interrupted.',
    hint: 'Check your internet connection and try again.',
  },
};

function getPresentation(error: ApiError | Error | string): ErrorPresentation {
  if (typeof error === 'string') {
    return {
      icon: 'warning',
      title: 'Error',
      description: error,
      hint: 'Please try again or contact support if the issue continues.',
    };
  }

  if ('type' in error) {
    return { ...API_ERROR_PRESENTATIONS[error.type], details: error.details };
  }

  return {
    icon: 'warning',
    title: 'Unexpected Error',
    description: error.message || 'Something went wrong.',
    hint: 'Please try again or contact support if the issue continues.',
  };
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const { icon, title, description, hint, details } = getPresentation(error);

  return (
    <div className="bg-error-container rounded-2xl p-6 border-l-4 border-error">
      <div className="flex items-start gap-4">
        <span
          className="material-symbols-outlined text-error text-3xl shrink-0 mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="font-headline text-base font-bold text-on-error-container mb-1">
            {title}
          </h3>
          <p className="font-body text-sm text-on-error-container mb-2">{description}</p>
          <p className="font-body text-xs text-on-error-container/80 leading-relaxed">{hint}</p>
          {details && (
            <p className="font-body text-xs text-on-error-container/70 mt-3 px-3 py-2 bg-error/10 rounded-lg font-mono">
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
