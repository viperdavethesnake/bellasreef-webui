export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

type EventListener = (data: any) => void;

import { TokenStorage } from '../utils/storage';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private listeners: Map<string, EventListener[]> = new Map();
  private tokenRefreshListener: (() => void) | null = null;

  constructor(private url: string) {
    // Listen for token refresh events from the auth service
    this.setupTokenRefreshListener();
  }

  private setupTokenRefreshListener() {
    // Listen for storage events (when token is refreshed in another tab/window)
    window.addEventListener('storage', (event) => {
      if (event.key === 'bellas_reef_access_token' && event.newValue) {
        console.log('Token refreshed, reconnecting WebSocket...');
        this.reconnectWithNewToken();
      }
    });

    // Also listen for custom token refresh events
    window.addEventListener('tokenRefreshed', () => {
      console.log('Token refresh event received, reconnecting WebSocket...');
      this.reconnectWithNewToken();
    });
  }

  private reconnectWithNewToken() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Reconnecting WebSocket with new token...');
      this.disconnect();
      setTimeout(() => this.connect(), 100); // Small delay to ensure clean disconnect
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  on(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: EventListener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // Patch: Attach token as query param if present
      let wsUrl = this.url;
      const token = TokenStorage.getToken();
      if (token) {
        const sep = wsUrl.includes('?') ? '&' : '?';
        wsUrl = `${wsUrl}${sep}token=${encodeURIComponent(token)}`;
      }
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle authentication errors from WebSocket
          if (message.type === 'auth_error' || message.type === 'unauthorized') {
            console.warn('WebSocket authentication error, attempting token refresh...');
            this.handleAuthError();
            return;
          }
          
          this.emit('message', message);
          this.emit(message.type, message.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', null);
        
        // Handle authentication-related close codes
        if (event.code === 1008 || event.code === 4003) { // Policy violation / Forbidden
          console.warn('WebSocket closed due to authentication issue, attempting token refresh...');
          this.handleAuthError();
          return;
        }
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private async handleAuthError() {
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token available, cannot reconnect WebSocket');
        this.emit('auth_failed', null);
        return;
      }

      // Attempt to refresh the token
      const response = await fetch('http://192.168.33.126:8000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        TokenStorage.setToken(data.access_token);
        TokenStorage.setRefreshToken(data.refresh_token);
        
        console.log('Token refreshed successfully, reconnecting WebSocket...');
        this.reconnectAttempts = 0; // Reset reconnect attempts
        setTimeout(() => this.connect(), 500); // Small delay before reconnecting
      } else {
        console.error('Token refresh failed, clearing tokens');
        TokenStorage.clearAll();
        this.emit('auth_failed', null);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      TokenStorage.clearAll();
      this.emit('auth_failed', null);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketService = new WebSocketService('ws://192.168.33.126:8000/ws');

export default websocketService;