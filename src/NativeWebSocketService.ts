import { EBaseEventType, INativeMessage } from './types';

export class NativeWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribedChannels: Set<string> = new Set();

  // Конфигурация
  private wsUrl: string;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  /**
   * Подключение к WebSocket серверу
   */
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Подписка на канал
   */
  subscribe(channel: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.send({
      type: EBaseEventType.SUBSCRIBE,
      channel: channel
    });

    this.subscribedChannels.add(channel);
    console.log(`Subscribed to channel: ${channel}`);
  }

  /**
   * Отписка от канала
   */
  unsubscribe(channel: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send({
      type: EBaseEventType.UNSUBSCRIBE,
      channel: channel
    });

    this.subscribedChannels.delete(channel);
    console.log(`Unsubscribed from channel: ${channel}`);
  }

  /**
   * Подписка на канал чата
   */
  subscribeToChat(chatId: number): void {
    this.subscribe(`chat.${chatId}`);
  }

  /**
   * Отписка от канала чата
   */
  unsubscribeFromChat(chatId: number): void {
    this.unsubscribe(`chat.${chatId}`);
  }

  /**
   * Отправка сообщения через WebSocket
   */
  sendMessage(chatId: number, data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.send({
      type: 'message.sent', // Пользователь может переопределить
      channel: `chat.${chatId}`,
      data: {
        chat_id: chatId,
        ...data
      }
    });
  }

  /**
   * Отправка события набора текста через WebSocket
   */
  sendTypingEvent(chatId: number, isTyping: boolean = true): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.send({
      type: 'user.typing', // Пользователь может переопределить
      channel: `chat.${chatId}`,
      data: {
        chat_id: chatId,
        is_typing: isTyping
      }
    });
  }

  /**
   * Отправка пользовательского события
   */
  sendCustomEvent(eventType: string, data?: any, channel?: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.send({
      type: eventType,
      data: data,
      channel: channel
    });
  }

  /**
   * Обработка входящих сообщений
   */
  private handleMessage(data: string): void {
    try {
      const message: INativeMessage<any> = JSON.parse(data);

      switch (message.type) {
        case EBaseEventType.CONNECTION:
          console.log('Connection established:');
          break;
        case EBaseEventType.SUBSCRIBED:
          console.log(`Subscribed to channel: ${message.channel}`);
          break;
        case EBaseEventType.UNSUBSCRIBED:
          console.log(`Unsubscribed from channel: ${message.channel}`);
          break;
        case EBaseEventType.PONG:
          // Heartbeat response
          break;
        case EBaseEventType.ERROR:
          console.error('WebSocket error:', message.data);
          break;
        default:
          this.emit(message.type, message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Отправка сообщения через WebSocket
   */
  private send(data: INativeMessage<any>): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  /**
   * Подписка на события
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Отписка от событий
   */
  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Эмиссия события
   */
  private emit(event: string, data: INativeMessage<any>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Обработка переподключения
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Запуск heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({ type: EBaseEventType.PING });
      }
    }, 30000); // 30 секунд
  }

  /**
   * Остановка heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Отключение от WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.subscribedChannels.clear();
    this.listeners.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Проверка подключения
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Получение списка подписанных каналов
   */
  getSubscribedChannels(): string[] {
    return Array.from(this.subscribedChannels);
  }

  /**
   * Установка URL для WebSocket
   */
  setWsUrl(url: string): void {
    this.wsUrl = url;
  }

  /**
   * Получение текущего URL
   */
  getWsUrl(): string {
    return this.wsUrl;
  }
} 