import type { Request } from "express";
import type { User } from "../../drizzle/schema";

type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

type UserInfo = {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  platform?: string | null;
};

type SessionTokenOptions = {
  name?: string;
  expiresInMs?: number;
};

export const sdk = {
  initialized: true,

  async authenticateRequest(_req: Request): Promise<User | null> {
    return null;
  },

  async exchangeCodeForToken(_code: string, _state: string): Promise<TokenResponse> {
    throw new Error("OAuth exchange not configured");
  },

  async getUserInfo(_accessToken: string): Promise<UserInfo> {
    throw new Error("OAuth user info not configured");
  },

  async createSessionToken(
    _openId: string,
    _options: SessionTokenOptions = {},
  ): Promise<string> {
    throw new Error("Session token creation not configured");
  },
};
