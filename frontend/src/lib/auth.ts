import { useSyncExternalStore } from "react";
import { apiRequest } from "./api";

const ACCESS_TOKEN_KEY = "solvo_access_token";
const REFRESH_TOKEN_KEY = "solvo_refresh_token";
const AUTH_CHANGED_EVENT = "solvo-auth-changed";

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  notifyAuthChanged();
}

export function setAccessToken(access: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthChanged();
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

function subscribeToAuthChanges(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerAuthSnapshot(): boolean {
  return false;
}

/**
 * Lit l'etat d'authentification via useSyncExternalStore plutot qu'un
 * effet + setState : cela evite le flash de contenu protege et reste
 * coherent entre le rendu serveur (toujours "non connecte") et le
 * rendu client une fois le localStorage disponible.
 */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAuthenticated, getServerAuthSnapshot);
}

interface TokenPairResponse {
  access: string;
  refresh: string;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await apiRequest<TokenPairResponse>("/auth/token/", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setTokens(data.access, data.refresh);
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiRequest("/auth/register/", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function logout(): void {
  clearTokens();
}
