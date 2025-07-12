import CryptoJS from 'crypto-js';

const SECRET_KEY = 'bellas-reef-secret-key';

// Token storage utility
export class TokenStorage {
  private static readonly TOKEN_KEY = 'bellas_reef_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'bellas_reef_refresh_token';

  // Access token methods
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Refresh token methods
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Clear all tokens
  static clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  }

  // Check if user has any tokens
  static hasTokens(): boolean {
    return this.getToken() !== null || this.getRefreshToken() !== null;
  }
}