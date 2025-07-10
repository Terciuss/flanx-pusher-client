import { NativeWebSocketService } from '../../src/NativeWebSocketService';
import { 
  ChatMessage, 
  MessagesLoadEvent, 
  MessageReadEvent, 
  UserTypingEvent,
  INativeMessage 
} from './types';

export class ChatService extends NativeWebSocketService {
  constructor(wsUrl: string) {
    super(wsUrl);
  }

  /**
   * Подключение к WebSocket для чата
   */
  async connectToWebSocket(): Promise<void> {
    return this.connect();
  }

  /**
   * Загрузка списка чатов
   */
  chatsLoad(): void {
    this.sendCustomEvent('chats.load');
  }

  /**
   * Загрузка сообщений чата
   */
  messagesLoad(chatId: number): void {
    this.sendCustomEvent('messages.load', { chat_id: chatId });
  }

  /**
   * Отправка сообщения
   */
  sendMessage(chatId: number, message: string): void {
    this.sendMessage(chatId, {
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Отправка события набора текста
   */
  sendTypingEvent(chatId: number, isTyping: boolean): void {
    this.sendTypingEvent(chatId, isTyping);
  }

  /**
   * Слушатели событий для чата
   */
  onMessagesLoad(callback: (event: MessagesLoadEvent) => void): void {
    this.on('messages.load', callback);
  }

  offMessagesLoad(callback: (event: MessagesLoadEvent) => void): void {
    this.off('messages.load', callback);
  }

  onMessageSent(callback: (event: INativeMessage<ChatMessage>) => void): void {
    this.on('message.sent', callback);
  }

  offMessageSent(callback: (event: INativeMessage<ChatMessage>) => void): void {
    this.off('message.sent', callback);
  }

  onUserTyping(callback: (event: UserTypingEvent) => void): void {
    this.on('user.typing', callback);
  }

  offUserTyping(callback: (event: UserTypingEvent) => void): void {
    this.off('user.typing', callback);
  }

  onMessageRead(callback: (event: MessageReadEvent) => void): void {
    this.on('message.read', callback);
  }

  offMessageRead(callback: (event: MessageReadEvent) => void): void {
    this.off('message.read', callback);
  }
} 