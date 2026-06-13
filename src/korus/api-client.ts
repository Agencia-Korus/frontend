"use client";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const AUTH_BASE_URL = (process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8001").replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "korus.accessToken";
const REFRESH_TOKEN_KEY = "korus.refreshToken";

export type AuthUser = {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "funcionario" | "cliente";
  status: "ativo" | "inativo" | "pendente";
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(tokens: TokenResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function authLogin(email: string, senha: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", senha);

  const tokens = await request<TokenResponse>(AUTH_BASE_URL, "/auth/login", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  saveTokens(tokens);
  return tokens;
}

export async function authRegister(payload: unknown) {
  return request<AuthUser>(AUTH_BASE_URL, "/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function authMe() {
  return request<AuthUser>(AUTH_BASE_URL, "/auth/me", { auth: true });
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const tokens = await request<TokenResponse>(AUTH_BASE_URL, "/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    saveTokens(tokens);
    return tokens.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiGet<T>(path: string, auth = false) {
  return request<T>(API_BASE_URL, path, { auth });
}

export async function apiPost<T>(path: string, body: unknown, auth = false) {
  return request<T>(API_BASE_URL, path, {
    method: "POST",
    body: JSON.stringify(body),
    auth,
  });
}

export async function apiPatch<T>(path: string, body: unknown, auth = true) {
  return request<T>(API_BASE_URL, path, {
    method: "PATCH",
    body: JSON.stringify(body),
    auth,
  });
}

export async function apiDelete(path: string, auth = true) {
  await request<void>(API_BASE_URL, path, { method: "DELETE", auth });
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, retry = true, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (init.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: requestHeaders,
  });

  if (response.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(baseUrl, path, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await responseMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function responseMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg || "Erro de validação").join(", ");
    }
  } catch {
    // fall through to status text
  }
  return response.statusText || "Erro na comunicação com o servidor.";
}