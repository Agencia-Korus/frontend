"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, authLogin, authMe, authRegister, clearTokens, getAccessToken } from "./api-client";

type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
  role: "cliente" | "funcionario";
  telefone?: string;
  cliente?: {
    razao_social?: string;
    cnpj_cpf?: string;
    segmento?: string;
  };
  funcionario?: {
    cargo?: string;
    especialidade?: string;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  reloadUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const reloadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setReady(true);
      return null;
    }

    try {
      const current = await authMe();
      setUser(current);
      return current;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      await authLogin(email, senha);
      const current = await authMe();
      setUser(current);
      return current;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      return await authRegister(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, loading, login, register, logout, reloadUser }),
    [user, ready, loading, login, register, logout, reloadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }
  return value;
}