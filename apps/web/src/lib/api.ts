const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export type ApiErrorKind = "connection" | "request" | "invalid-response";

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
    public readonly kind: ApiErrorKind,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function parsePayload(text: string): unknown {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string") {
    return payload || fallback;
  }

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const body = payload as ApiErrorBody;

  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  return fallback;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "Unable to connect to the API server.",
      0,
      error,
      "connection",
    );
  }

  const responseText = await response.text();
  const payload = parsePayload(responseText);

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, `API request failed (${response.status})`),
      response.status,
      payload,
      "request",
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  if (typeof payload === "string") {
    throw new ApiError(
      "The API response format is invalid.",
      response.status,
      payload,
      "invalid-response",
    );
  }

  return payload as T;
}
