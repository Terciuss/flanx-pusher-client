// Типы для примера чата
export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id: number;
  user_name: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface User {
  id: number;
  name: string;
  avatar?: string;
}

// События чата
export interface MessagesLoadEvent {
  data: ChatMessage[];
}

export interface MessageReadEvent {
  chat_id: number;
  message_id: number;
  user_id: number;
}

export interface UserTypingEvent {
  chat_id: number;
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface INativeMessage<T = any> {
  type: string;
  data?: T;
  channel?: string;
  user_id?: any;
  timestamp?: string;
} 