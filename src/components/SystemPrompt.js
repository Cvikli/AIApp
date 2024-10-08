import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';

const SystemPromptContainer = styled.div`
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  margin: 10px;
  padding: 0px;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.textColor};
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
  flex: 1;
  text-align: left;

  &:hover {
    background-color: ${props => props.theme.hoverColor};
  }
`;

const SystemPromptContent = styled.textarea`
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background-color: ${props => props.theme.backgroundColor};
  border-top: 1px solid ${props => props.theme.borderColor};
  border-radius: 0px;
  color: ${props => props.theme.name === 'dark' ? '#e0e0e0' : '#333'};
  line-height: 1.4;
  padding: 8px;
  margin-top: 5px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${props => props.theme.textColor};
  }
`;

function SystemPrompt({ isOpen, setIsOpen, conversationId }) {
  const { theme, conversations } = useAppContext();
  const systemPrompt = conversations[conversationId]?.systemPrompt || '';
  const [editableMessage, setEditableMessage] = useState(systemPrompt);
  const [isEdited, setIsEdited] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setEditableMessage(systemPrompt);
    setIsEdited(false);
  }, [systemPrompt]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isOpen, editableMessage]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => textareaRef.current.focus(), 0);
    }
  };

  const handleChange = (e) => {
    setEditableMessage(e.target.value);
    setIsEdited(e.target.value !== systemPrompt);
  };

  return (
    <SystemPromptContainer theme={theme}>
      <TopSection>
        <ToggleButton onClick={handleToggle} theme={theme}>
          System Prompt {isOpen ? '▲' : '▼'}
        </ToggleButton>
      </TopSection>
      {isOpen && (
        <SystemPromptContent
          ref={textareaRef}
          value={editableMessage}
          onChange={handleChange}
          theme={theme}
        />
      )}
    </SystemPromptContainer>
  );
}

export default SystemPrompt;
