import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import * as API from './API';
import { ScrollbarStyle } from './components/SharedStyles';
import { lightTheme, darkTheme } from './theme';
import { MAX_TEXTAREA_HEIGHT } from './constants';
import Message from './components/Message';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
  padding: 0;
  background-color: ${props => props.theme.chatBackground};
  color: ${props => props.theme.text};
`;

const MessageHistory = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  ${ScrollbarStyle}
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 0px;
  resize: none;
  min-height: 40px;
  max-height: ${MAX_TEXTAREA_HEIGHT}px;
  overflow-y: auto;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;  
  border-right: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  ${ScrollbarStyle}
`;

const SendButton = styled.button`
  padding: 10px 10px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  height: auto;
  font-size: 14px;
`;

function ChatComponent({ isDarkMode, conversationId, messages, setMessages }) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }
  }, [inputValue]);
  
  const handleSend = async () => {
    if (inputValue.trim()) {
      const newUserMessage = { role: 'user', message: inputValue };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      setIsTyping(true);
  
      try {
        const data = await API.processMessage(inputValue, conversationId);
        const newAIMessage = { role: 'ai', message: data.response };
        setMessages(prevMessages => [...prevMessages, newAIMessage]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'ai', message: 'Sorry, I encountered an error.' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ChatContainer>
        <MessageHistory>
          {messages.map((message, index) => (
            <Message 
              key={index} 
              message={message.message} 
              isUser={message.role === 'user'} 
            />
          ))}
          {isTyping && <Message message="AI is typing..." isUser={false} />}
          <div ref={messageEndRef} />
        </MessageHistory>

        <InputContainer>
          <TextArea 
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here... (Press Shift+Enter for new line)"
            rows={1}          
          />
          <SendButton onClick={handleSend}>Send</SendButton>
        </InputContainer>
      </ChatContainer>
    </ThemeProvider>
  );
}

export default ChatComponent;
