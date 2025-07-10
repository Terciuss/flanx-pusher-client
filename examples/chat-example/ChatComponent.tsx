import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from './ChatService';
import { ChatMessage, User, MessagesLoadEvent, MessageReadEvent, UserTypingEvent, INativeMessage } from './types';

interface ChatComponentProps {
  chatId: string;
  user: User;
  wsUrl: string;
  addNotification: (notification: {
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning';
  }) => void;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  chatId,
  user,
  wsUrl,
  addNotification
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chatService = new ChatService(wsUrl);

  // Функция прокрутки вниз (заглушка)
  const scrollToBottom = useCallback(() => {
    // Реализация прокрутки вниз
    console.log('Scrolling to bottom');
  }, []);

  const messagesLoad = useCallback(({ data: messages }: MessagesLoadEvent) => {
    setMessages(prev => [...(messages || [] as ChatMessage[]), ...prev]);
    scrollToBottom();
  }, [scrollToBottom]);

  const messageSent = useCallback(({ data: message }: INativeMessage<ChatMessage>) => {
    if (String(message?.chat_id) === chatId) {
      setMessages(prev => [...prev, message as ChatMessage]);
      scrollToBottom();
    }
  }, [chatId, scrollToBottom]);

  const messageRead = useCallback((message: MessageReadEvent) => {
    if (String(message.chat_id) === chatId) {
      setMessages(prev => prev.map(msg => msg.id === message.message_id ? {
        ...msg,
        status: 'read' as const
      } : msg));
    }
  }, [chatId]);

  const userTyping = useCallback((event: UserTypingEvent) => {
    if (String(event.chat_id) === chatId && event.user_id !== user?.id) {
      if (event.is_typing) {
        setTypingUsers(prev => {
          if (!prev.includes(event.user_name)) {
            return [...prev, event.user_name];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(name => name !== event.user_name));
      }
    }
  }, [chatId, user?.id]);

  // Настройка слушателей событий
  const setupEventListeners = () => {
    chatService.onMessagesLoad(messagesLoad);
    // Новое сообщение
    chatService.onMessageSent(messageSent);
    // Пользователь набирает текст
    chatService.onUserTyping(userTyping);
    // Сообщение прочитано
    chatService.onMessageRead(messageRead);
  };

  // Очистка слушателей событий
  const cleanupEventListeners = () => {
    chatService.offMessagesLoad(messagesLoad);
    chatService.offMessageSent(messageSent);
    chatService.offUserTyping(userTyping);
    chatService.offMessageRead(messageRead);
  };

  // Подключение к WebSocket
  useEffect(() => {
    const connectToWebSocket = async () => {
      try {
        await chatService.connectToWebSocket();
        setIsConnected(true);
        // Подписываемся на чат
        chatService.subscribeToChat(Number(chatId));
        // Настраиваем слушатели событий
        setupEventListeners();

        console.log('chats load');
        chatService.chatsLoad();

        chatService.messagesLoad(Number(chatId));

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        addNotification({
          title: 'Ошибка подключения к чату',
          message: 'Не удалось подключиться к чату',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    connectToWebSocket();

    return () => {
      // Отписываемся от чата при размонтировании
      chatService.unsubscribeFromChat(Number(chatId));
      cleanupEventListeners();
    };
  }, [chatId]);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    try {
      chatService.sendMessage(Number(chatId), newMessage);
      chatService.sendTypingEvent(Number(chatId), false);

      setNewMessage('');
      scrollToBottom();

    } catch (error) {
      console.error('Failed to send message:', error);
      addNotification({
        title: 'Ошибка отправки сообщения',
        message: 'Не удалось отправить сообщение',
        type: 'error',
      });
    }
  };

  // Обработка набора текста
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Отправляем событие набора текста
    if (!isTyping) {
      setIsTyping(true);
      chatService.sendTypingEvent(Number(chatId), true);
    }

    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Останавливаем индикацию набора через 2 секунды
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.sendTypingEvent(Number(chatId), false);
    }, 2000);
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return <div>Загрузка чата...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Чат #{chatId}</h3>
        <div className="connection-status">
          {isConnected ? '🟢 Подключен' : '🔴 Отключен'}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.user_id === user.id ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <span className="user-name">{message.user_name}</span>
              <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{message.message}</div>
            <div className="message-status">{message.status}</div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} печатает...
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected || !newMessage.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
}; 