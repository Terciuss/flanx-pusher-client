# @freelance/native-websocket

Native WebSocket service for real-time communication in React applications.

## Installation

```bash
npm install @freelance/native-websocket
```

## Usage

### Basic Usage

```typescript
import { NativeWebSocketService, EBaseEventType } from '@freelance/native-websocket';

// Создание экземпляра с параметрами
const wsService = new NativeWebSocketService('ws://localhost:6001/api/v1/ws?app_uuid=YOUR_APP_UUID&token=YOUR_TOKEN');

// Подключение к WebSocket
await wsService.connect();

// Подписка на пользовательские события
wsService.on('message.sent', (data) => {
  console.log('New message:', data);
});

wsService.on('user.typing', (data) => {
  console.log('User typing:', data);
});

// Подписка на канал чата
wsService.subscribeToChat(123);

// Отправка сообщения
wsService.sendMessage(123, { 
  content: 'Hello, world!',
  type: 'text'
});

// Отправка пользовательского события
wsService.sendCustomEvent('custom.event', { data: 'value' });
```

### Configuration

```typescript
import { NativeWebSocketService } from '@freelance/native-websocket';

// Создание экземпляра с полным URL
const wsService = new NativeWebSocketService('ws://localhost:6001/api/v1/ws?app_uuid=YOUR_APP_UUID&token=YOUR_TOKEN');

// Или создание с отдельными параметрами
const buildWsUrl = (host: string, appUuid: string, token: string) => {
  return `ws://${host}/api/v1/ws?app_uuid=${appUuid}&token=${token}`;
};

const wsService = new NativeWebSocketService(
  buildWsUrl('localhost:6001', 'YOUR_APP_UUID', 'YOUR_TOKEN')
);
```

### Event Types

```typescript
import { EBaseEventType, EMessageType } from '@freelance/native-websocket';

// Базовые типы событий (встроенные)
EBaseEventType.PING
EBaseEventType.PONG
EBaseEventType.CONNECTION
EBaseEventType.SUBSCRIBE
EBaseEventType.SUBSCRIBED
EBaseEventType.UNSUBSCRIBE
EBaseEventType.UNSUBSCRIBED
EBaseEventType.ERROR

// Пользовательские типы событий (определяются вами)
const CUSTOM_EVENTS = {
  MESSAGE_SENT: 'message.sent',
  MESSAGE_READ: 'message.read',
  USER_TYPING: 'user.typing',
  NOTIFICATION: 'notification',
  // Добавьте свои события
} as const;
```

## API Reference

### NativeWebSocketService

#### Methods

- `connect(): Promise<void>` - Подключение к WebSocket серверу
- `disconnect(): void` - Отключение от WebSocket сервера
- `subscribe(channel: string): void` - Подписка на канал
- `unsubscribe(channel: string): void` - Отписка от канала
- `subscribeToChat(chatId: number): void` - Подписка на канал чата
- `unsubscribeFromChat(chatId: number): void` - Отписка от канала чата
- `sendMessage(chatId: number, data: any): void` - Отправка сообщения
- `sendTypingEvent(chatId: number, isTyping?: boolean): void` - Отправка события набора текста
- `sendCustomEvent(eventType: string, data?: any, channel?: string): void` - Отправка пользовательского события

- `on(event: string, callback: (data: any) => void): void` - Подписка на события
- `off(event: string, callback: (data: any) => void): void` - Отписка от событий
- `isConnected(): boolean` - Проверка подключения
- `getSubscribedChannels(): string[]` - Получение списка подписанных каналов
- `setWsUrl(url: string): void` - Установка URL для WebSocket
- `getWsUrl(): string` - Получение текущего URL

## License

MIT 