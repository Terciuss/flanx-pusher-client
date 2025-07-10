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

// Стандартные типы событий чата
export enum EChatEventType {
  MESSAGE_SENT = 'message.sent',
  USER_TYPING = 'user.typing',
  MESSAGE_READ = 'message.read',
} 