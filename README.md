# flanx-pusher-client

Native WebSocket service for real-time communication in JavaScript/TypeScript applications.

## Installation

```bash
npm install flanx-pusher-client
```

## Usage

### Basic Usage

```typescript
import { NativeWebSocketService, EBaseEventType } from 'flanx-pusher-client';

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

// Отправка события прочтения сообщения
wsService.sendMessageRead(123, 456);

// Отправка пользовательского события
wsService.sendCustomEvent('custom.event', { data: 'value' });
```

### Configuration

```typescript
import { NativeWebSocketService } from 'flanx-pusher-client';

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
import { EBaseEventType, EChatEventType } from 'flanx-pusher-client';

// Базовые типы событий (встроенные)
EBaseEventType.PING
EBaseEventType.PONG
EBaseEventType.CONNECTION
EBaseEventType.SUBSCRIBE
EBaseEventType.SUBSCRIBED
EBaseEventType.UNSUBSCRIBE
EBaseEventType.UNSUBSCRIBED
EBaseEventType.ERROR

// Стандартные типы событий чата
EChatEventType.MESSAGE_SENT
EChatEventType.USER_TYPING
EChatEventType.MESSAGE_READ

// Пользовательские типы событий (определяются вами)
const CUSTOM_EVENTS = {
  NOTIFICATION: 'notification',
  USER_STATUS: 'user.status',
  // Добавьте свои события
} as const;
```

## Examples

Полный пример реализации чата с использованием `flanx-pusher-client` (включая React интеграцию) находится в папке `examples/chat-example/`.

### Основные возможности примера:

- ✅ Подключение к WebSocket серверу
- ✅ Подписка на каналы чата
- ✅ Отправка и получение сообщений
- ✅ Индикация набора текста
- ✅ Статусы сообщений (отправлено/доставлено/прочитано)
- ✅ Автоматическое переподключение
- ✅ Полная типизация TypeScript
- ✅ Интеграция с React (в примере)

### Быстрый старт:

```typescript
import { ChatComponent } from 'examples/chat-example/ChatComponent';

<ChatComponent
  chatId="123"
  user={{ id: 1, name: "User" }}
  wsUrl="ws://localhost:8080"
  addNotification={(notification) => console.log(notification)}
/>
```

Подробная документация по примеру: [examples/chat-example/README.md](examples/chat-example/README.md)

### Использование в других фреймворках

#### Vue.js
```typescript
import { NativeWebSocketService } from 'flanx-pusher-client';

export default {
  data() {
    return {
      wsService: new NativeWebSocketService('ws://localhost:8080'),
      messages: []
    }
  },
  async mounted() {
    await this.wsService.connect();
    this.wsService.on('message.sent', (data) => {
      this.messages.push(data);
    });
  }
}
```

#### Vanilla JavaScript
```javascript
import { NativeWebSocketService } from 'flanx-pusher-client';

const wsService = new NativeWebSocketService('ws://localhost:8080');

wsService.connect().then(() => {
  wsService.on('message.sent', (data) => {
    console.log('New message:', data);
  });
});
```

#### Node.js
```javascript
const { NativeWebSocketService } = require('flanx-pusher-client');

const wsService = new NativeWebSocketService('ws://localhost:8080');

wsService.connect().then(() => {
  wsService.on('message.sent', (data) => {
    console.log('New message:', data);
  });
});
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
- `sendMessageRead(chatId: number, messageId: number): void` - Отправка события прочтения сообщения
- `sendCustomEvent(eventType: string, data?: any, channel?: string): void` - Отправка пользовательского события

- `on(event: string, callback: (data: any) => void): void` - Подписка на события
- `off(event: string, callback: (data: any) => void): void` - Отписка от событий
- `isConnected(): boolean` - Проверка подключения
- `getSubscribedChannels(): string[]` - Получение списка подписанных каналов
- `setWsUrl(url: string): void` - Установка URL для WebSocket
- `getWsUrl(): string` - Получение текущего URL

## License

MIT 