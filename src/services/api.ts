import type { ApiResponse, SyncApiResponse, ApiError, ApplicationId } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://portier-takehometest.onrender.com/api/v1';

export class ApiService {
  /**
   * Fetch sync data for a specific integration
   */
  static async fetchSyncData(applicationId: ApplicationId): Promise<SyncApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/data/sync?application_id=${applicationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data: ApiResponse<SyncApiResponse> = await response.json();

      if (data.code !== 'SUCCESS') {
        throw this.createError(500, data.message || 'Unexpected API response');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      // Network error or other unexpected error
      throw this.createError(0, 'Network error. Please check your connection.', 'network_error');
    }
  }

  /**
   * Handle HTTP error responses and map to ApiError
   */
  private static async handleErrorResponse(response: Response): Promise<ApiError> {
    const status = response.status;
    let message = 'An error occurred';
    let details = '';

    try {
      const errorData = await response.json();
      message = errorData.message || message;
      details = errorData.details || '';
    } catch {
      // If response is not JSON, use status text
      message = response.statusText || message;
    }

    if (status >= 400 && status < 500) {
      return this.createError(
        status,
        status === 400
          ? 'Bad request. Please check the integration configuration.'
          : status === 404
          ? 'Integration not found. Please verify the application ID.'
          : 'Client error. The integration may be misconfigured.',
        'client_error',
        details
      );
    }

    if (status === 500) {
      return this.createError(
        500,
        'Internal server error. Please try again later.',
        'server_error',
        details
      );
    }

    if (status === 502 || status === 503 || status === 504) {
      return this.createError(
        status,
        'Gateway error. The integration service is temporarily unavailable.',
        'gateway_error',
        details
      );
    }

    return this.createError(status, message, 'server_error', details);
  }

  /**
   * Create a structured ApiError object
   */
  private static createError(
    status: number,
    message: string,
    type: ApiError['type'] = 'server_error',
    details?: string
  ): ApiError {
    return {
      status,
      message,
      type,
      details,
    };
  }
}
