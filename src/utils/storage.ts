import CryptoJS from 'crypto-js';

const SECRET_KEY = 'bellas-reef-secret-key';

export class TokenStorage {
  static setToken(token: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem('bellas_reef_token', encrypted);
    } catch (error) {
      console.error('Token storage failed:', error);
    }
  }

  static getToken(): string | null {
    try {
      const encrypted = localStorage.getItem('bellas_reef_token');
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  }

  static removeToken(): void {
    localStorage.removeItem('bellas_reef_token');
  }

  static setRefreshToken(token: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem('bellas_reef_refresh_token', encrypted);
    } catch (error) {
      console.error('Refresh token storage failed:', error);
    }
  }

  static getRefreshToken(): string | null {
    try {
      const encrypted = localStorage.getItem('bellas_reef_refresh_token');
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Refresh token retrieval failed:', error);
      return null;
    }
  }

  static removeRefreshToken(): void {
    localStorage.removeItem('bellas_reef_refresh_token');
  }

  static clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}