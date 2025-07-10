export type INativeMessage<T = any> = {
  type: string;
  data?: T;
  channel?: string;
  user_id?: any;
  timestamp?: string;
};

// Базовые типы событий (опциональные)
export enum EBaseEventType {
  PING = 'ping',
  PONG = 'pong',
  CONNECTION = 'connection',
  SUBSCRIBE = 'subscribe',
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBE = 'unsubscribe',
  UNSUBSCRIBED = 'unsubscribed',
  ERROR = 'error',
} 