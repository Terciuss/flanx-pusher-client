# Пример чата с flanx-pusher-client

Этот пример демонстрирует, как использовать `flanx-pusher-client` для создания реального чата с WebSocket.

## Структура примера

```
examples/chat-example/
├── types.ts           # Типы для чата
├── ChatService.ts     # Расширенный сервис чата
├── ChatComponent.tsx  # React компонент чата
└── README.md         # Документация
```

## Использование

### 1. Создание сервиса чата

```typescript
import { ChatService } from './ChatService';

const chatService = new ChatService('ws://localhost:8080');
```

### 2. Подключение к WebSocket

```typescript
await chatService.connectToWebSocket();
```

### 3. Подписка на чат

```typescript
chatService.subscribeToChat(chatId);
```

### 4. Настройка слушателей событий

```typescript
// Загрузка сообщений
chatService.onMessagesLoad((event) => {
  setMessages(prev => [...event.data, ...prev]);
});

// Новое сообщение
chatService.onMessageSent((event) => {
  setMessages(prev => [...prev, event.data]);
});

// Пользователь печатает
chatService.onUserTyping((event) => {
  if (event.is_typing) {
    setTypingUsers(prev => [...prev, event.user_name]);
  } else {
    setTypingUsers(prev => prev.filter(name => name !== event.user_name));
  }
});

// Сообщение прочитано
chatService.onMessageRead((event) => {
  setMessages(prev => prev.map(msg => 
    msg.id === event.message_id ? { ...msg, status: 'read' } : msg
  ));
});
```

### 5. Отправка сообщений

```typescript
// Отправка сообщения
chatService.sendMessage(chatId, 'Привет!');

// Отправка события набора текста
chatService.sendTypingEvent(chatId, true);
```

## Основные функции

### ChatService

- `connectToWebSocket()` - подключение к WebSocket
- `subscribeToChat(chatId)` - подписка на чат
- `unsubscribeFromChat(chatId)` - отписка от чата
- `sendMessage(chatId, message)` - отправка сообщения
- `sendTypingEvent(chatId, isTyping)` - отправка события набора текста
- `chatsLoad()` - загрузка списка чатов
- `messagesLoad(chatId)` - загрузка сообщений чата

### События

- `messages.load` - загрузка сообщений
- `message.sent` - новое сообщение
- `user.typing` - пользователь печатает
- `message.read` - сообщение прочитано

## Особенности реализации

1. **Автоматическое переподключение** - сервис автоматически переподключается при разрыве соединения
2. **Heartbeat** - поддержка ping/pong для проверки соединения
3. **Типизация** - полная типизация TypeScript для всех событий
4. **Очистка ресурсов** - автоматическая отписка от событий при размонтировании компонента
5. **Индикация набора текста** - автоматическая отправка событий набора текста с таймером

## Интеграция с React

Пример показывает полную интеграцию с React, включая:

- Использование хуков (`useState`, `useEffect`, `useCallback`, `useRef`)
- Правильная очистка ресурсов
- Обработка состояний загрузки и подключения
- Управление состоянием сообщений и пользователей 