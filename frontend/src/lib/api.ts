import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(typeof data === "string" ? data : "Erreur API");
    this.status = status;
    this.data = data;
  }
}

/** Signale qu'aucun refresh token valide n'est disponible : l'appelant doit rediriger vers /login. */
export class SessionExpiredError extends Error {}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new SessionExpiredError();

  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new SessionExpiredError();
  }

  const data = (await parseBody(response)) as { access: string };
  setAccessToken(data.access);
  return data.access;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

/**
 * Wrapper fetch central : injecte le token JWT, et retente une fois la
 * requete apres un refresh silencieux si l'access token a expire.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const buildHeaders = (token: string | null): HeadersInit => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const execute = async (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await execute(getAccessToken());

  if (auth && response.status === 401) {
    const newAccess = await refreshAccessToken();
    response = await execute(newAccess);
  }

  if (!response.ok) {
    const data = await parseBody(response);
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) return undefined as T;
  return (await parseBody(response)) as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown, opts: Partial<RequestOptions> = {}) =>
    apiRequest<T>(path, { method: "POST", body, ...opts }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
