const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
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

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
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

    throw new ApiError("API 서버에 연결할 수 없습니다.", 0, error);
  }

  const responseText = await response.text();
  const payload = parsePayload(responseText);

  if (!response.ok) {
    throw new ApiError(
      getApiErrorMessage(payload, `API 요청 실패 (${response.status})`),
      response.status,
      payload,
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  if (typeof payload === "string") {
    throw new ApiError(
      "API 응답 형식이 올바르지 않습니다.",
      response.status,
      payload,
    );
  }

  return payload as T;
}
