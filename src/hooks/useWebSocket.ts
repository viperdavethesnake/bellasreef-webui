import { useEffect, useRef } from 'react';
import websocketService from '../services/websocket';

export function useWebSocket() {
  const listenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      // Remove all listeners
      listenersRef.current.forEach((listener, event) => {
        websocketService.off(event, listener);
      });
    };
  }, []);

  const subscribe = (event: string, callback: (data: any) => void) => {
    // Remove previous listener for this event if exists
    const previousListener = listenersRef.current.get(event);
    if (previousListener) {
      websocketService.off(event, previousListener);
    }

    // Add new listener
    websocketService.on(event, callback);
    listenersRef.current.set(event, callback);
  };

  const unsubscribe = (event: string) => {
    const listener = listenersRef.current.get(event);
    if (listener) {
      websocketService.off(event, listener);
      listenersRef.current.delete(event);
    }
  };

  const send = (message: any) => {
    websocketService.send(message);
  };

  const isConnected = () => {
    return websocketService.isConnected();
  };

  return {
    subscribe,
    unsubscribe,
    send,
    isConnected,
  };
}