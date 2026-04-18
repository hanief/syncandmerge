import type {
  ApiResponse,
  SyncApiResponse,
  ApiError,
  ApplicationId,
} from "../types"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://portier-takehometest.onrender.com/api/v1"

const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 300

export class ApiService {
  static async fetchSyncData(
    applicationId: ApplicationId,
  ): Promise<SyncApiResponse> {
    const url = `${API_BASE_URL}/data/sync?application_id=${applicationId}`
    const response = await fetchWithRetry(url)

    const data: ApiResponse<SyncApiResponse> = await response.json()
    if (data.code !== "SUCCESS") {
      throw createError("server_error", 500, data.message || "Unexpected API response")
    }
    return data.data
  }
}

async function fetchWithRetry(url: string, attempt = 0): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url)
    if (response.ok) return response

    const apiError = await responseToApiError(response)
    if (shouldRetry(apiError) && attempt < MAX_RETRIES) {
      await delay(backoffFor(attempt, apiError))
      return fetchWithRetry(url, attempt + 1)
    }
    throw apiError
  } catch (error) {
    if (isApiError(error)) throw error

    const apiError = toTransportError(error)
    if (shouldRetry(apiError) && attempt < MAX_RETRIES) {
      await delay(backoffFor(attempt, apiError))
      return fetchWithRetry(url, attempt + 1)
    }
    throw apiError
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function responseToApiError(response: Response): Promise<ApiError> {
  let message = response.statusText || "An error occurred"
  let details: string | undefined
  try {
    const body = await response.json()
    if (body?.message) message = body.message
    if (body?.details) details = body.details
  } catch {
    // body not JSON — keep statusText
  }

  const status = response.status
  if (status >= 400 && status < 500) {
    return createError("client_error", status, message, details)
  }
  if (status === 502 || status === 503 || status === 504) {
    const retryAfter = parseRetryAfter(response.headers.get("Retry-After"))
    return status === 504
      ? createError("timeout", status, message, details)
      : { type: "gateway_error", status, message, details, retryAfter }
  }
  return createError("server_error", status, message, details)
}

function toTransportError(error: unknown): ApiError {
  if (error instanceof DOMException && error.name === "AbortError") {
    return createError("timeout", 0, "Request timed out")
  }
  const message =
    error instanceof Error
      ? error.message
      : "Network error. Please check your connection."
  return { type: "network_error", status: 0, message }
}

function shouldRetry(error: ApiError): boolean {
  return (
    error.type === "network_error" ||
    error.type === "timeout" ||
    error.type === "server_error" ||
    error.type === "gateway_error"
  )
}

function backoffFor(attempt: number, error: ApiError): number {
  if (error.type === "gateway_error" && error.retryAfter !== undefined) {
    return error.retryAfter * 1000
  }
  return RETRY_BASE_DELAY_MS * 2 ** attempt
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined
}

function createError(
  type: Exclude<ApiError["type"], "gateway_error">,
  status: number,
  message: string,
  details?: string,
): ApiError {
  return { type, status, message, details }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "status" in value &&
    "message" in value
  )
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
