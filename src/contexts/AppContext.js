import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../API';
import { lightTheme, darkTheme } from '../theme';
import { setCookie, getCookie } from '../cookies';

const AppContext = createContext();

const VoiceState = {
  INACTIVE: 'INACTIVE',
  WAKE_WORD_LISTENING: 'WAKE_WORD_LISTENING',
  COMMAND_LISTENING: 'COMMAND_LISTENING',
  VOICE_ACTIVATED_COMMAND_LISTENING: 'VOICE_ACTIVATED_COMMAND_LISTENING',
};

const LANGUAGE_CODES = {
  en: 'en-US',
  hu: 'hu-HU',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

export const AppProvider = ({ children }) => {
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState(null);
  const [conversations, setConversations] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [projectPath, setProjectPath] = useState("");
  const [isNoAutoExecute, setIsNoAutoExecute] = useState(true);
  const [model, setModel] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [language, setLanguage] = useState(() => getCookie('language') || 'en');
  const [voiceState, setVoiceState] = useState(() => getCookie('voiceState') || VoiceState.INACTIVE);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();
  const api = useAPI();

  const recognitionRef = useRef(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    setCookie('language', language);
    setCookie('voiceState', voiceState);
  }, [language, voiceState]);

  const initializeApp = useCallback(async () => {
    try {
      const data = await api.initializeAIState();
      if (data.status === 'success') {
        setConversations(data.available_conversations);
        setIsNoAutoExecute(data.skip_code_execution);
        setModel(data.model || "");
        setProjectPath(data.project_path || "");

        if (data.conversation_id && data.available_conversations[data.conversation_id]) {
          updateConversation(data.conversation_id, {
            messages: [],
            systemPrompt: data.system_prompt?.content
          });
          navigate(`/chat/${data.conversation_id}`);
        }
      }
    } catch (error) {
      console.error('Error at initialization:', error);
    }
  }, [api, navigate]);

  const updateConversation = useCallback((id, updates) => {
    setConversations(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  const selectConversation = useCallback(async (id) => {
    const response = await api.selectConversation({ conversation_id: id });
    if (response?.status === 'success') {
      updateConversation(id, {
        messages: response.history || [],
        systemPrompt: response.system_prompt?.content
      });
      navigate(`/chat/${id}`);
    }
  }, [api, navigate, updateConversation]);

  const newConversation = useCallback(async () => {
    const emptyConversation = Object.values(conversations).find(
      conv => conv.sentence === "New" || conv.sentence === ""
    );
    if (emptyConversation) {
        setConversations(prev => {
          const { [emptyConversation.id]: _, ...rest } = prev;
          return rest;
        });
    }
    const response = await api.newConversation();
    if (response?.status === 'success' && response.conversation?.id) {
      updateConversation(response.conversation.id, {
        ...response.conversation,
        messages: [],
        systemPrompt: response.system_prompt?.content || ''
      });
      if (response.project_path) {
        setProjectPath(response.project_path);
      }
      navigate(`/chat/${response.conversation.id}`);
    }
      
  }, [api, navigate, conversations, updateConversation]);

  const addMessage = useCallback((conversationId, newMessage) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      console.log("conversation", conversation)
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          sentence: newMessage.role === 'user' ? newMessage.content.substring(0, 30) + '...' : conversation.sentence
        }
      };
    });
  }, []);

  const updateProjectPath = useCallback(async (conversationId, newPath) => {
    const response = await api.setPath({ path: newPath });
    if (response?.status === 'success') {
      setProjectPath(newPath);
      if (response.system_prompt) {
        updateConversation(conversationId, { systemPrompt: response.system_prompt.content });
      }
    }
  }, [api, updateConversation]);

  const updateMessage = useCallback((conversationId, messageContent, updates) => {
    setConversations(prev => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map(msg =>
            msg.content === messageContent ? { ...msg, ...updates } : msg
          ),
        }
      };
    });
  }, []);

  const executeBlock = useCallback(async (code, timestamp) => {
    return await api.executeBlock({ code, timestamp });
  }, [api]);

  const toggleAutoExecute = useCallback(async () => {
    const response = await api.toggleAutoExecute();
    if (response?.status === 'success') {
      setIsNoAutoExecute(response.skip_code_execution);
    }
  }, [api]);

  const handleLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    setCookie('language', newLanguage);
  }, []);

  const getMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(device => device.kind === 'audioinput');
      setAvailableMicrophones(microphones);
      if (microphones.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting microphones:', error);
    }
  }, [selectedMicrophone]);

  useEffect(() => {
    getMicrophones();
  }, [getMicrophones]);

  const toggleVoiceActivation = useCallback(() => {
    setVoiceState(prevState => {
      switch (prevState) {
        case VoiceState.INACTIVE: return VoiceState.WAKE_WORD_LISTENING;
        case VoiceState.WAKE_WORD_LISTENING: return VoiceState.INACTIVE;
        case VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING: return VoiceState.COMMAND_LISTENING;
        case VoiceState.COMMAND_LISTENING: return VoiceState.COMMAND_LISTENING;
        default: return VoiceState.INACTIVE;
      }
    });
  }, []);

  const toggleSTTListening = useCallback(() => {
    setVoiceState(prevState => {
      switch (prevState) {
        case VoiceState.INACTIVE: return VoiceState.COMMAND_LISTENING;
        case VoiceState.WAKE_WORD_LISTENING: return VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING;
        case VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING: 
          setFinalTranscript(prev => prev + ' ' + interimTranscript)
          setInterimTranscript('');
          return VoiceState.WAKE_WORD_LISTENING;
        case VoiceState.COMMAND_LISTENING: 
          setFinalTranscript(prev => prev +  ' ' + interimTranscript)  
          setInterimTranscript('');
          return VoiceState.INACTIVE;
        default: return VoiceState.INACTIVE;
      }
    });
  }, []);

  const initializeSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LANGUAGE_CODES[language] || 'en-US';

      recognition.onresult = (event) => {
        if (voiceState === VoiceState.INACTIVE) return;
        let interimTranscript = '';
        let finalTranscriptPart = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptPart += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const lowercaseTranscript = (finalTranscriptPart + ' ' + interimTranscript).toLowerCase();
        console.log('Current transcript:', lowercaseTranscript);

        if (voiceState === VoiceState.WAKE_WORD_LISTENING && (lowercaseTranscript.includes('orion') || lowercaseTranscript.includes('ai'))) {
          console.log('Wake word detected');
          setVoiceState(VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING);
          setFinalTranscript('');
          setInterimTranscript('');
          interimTranscript = '';
          finalTranscriptPart = '';
        } else if (voiceState === VoiceState.WAKE_WORD_LISTENING){
          setFinalTranscript('');
        } else if (voiceState === VoiceState.COMMAND_LISTENING || voiceState === VoiceState.VOICE_ACTIVATED_COMMAND_LISTENING) {
          setFinalTranscript(prev => prev + finalTranscriptPart);
          setInterimTranscript(interimTranscript);
        }
      };
      recognition.onstart = () =>  { setIsRecognizing(true) };
      recognition.onend = () => { setIsRecognizing(false) };
    
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecognizing(false)
      };

      recognitionRef.current = recognition;
    } else {
      console.log('webkitSpeechRecognition not available');
    }
  }, [language, voiceState]);

  useEffect(() => {
    initializeSpeechRecognition();
    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeSpeechRecognition]);

  useEffect(() => {
      if (voiceState === VoiceState.INACTIVE) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          console.log('Stopped speech recognition');
        }
      } else {
        if (!isRecognizing) {
          if (recognitionRef.current) {
            recognitionRef.current.start()
            console.log('Started speech recognition');
          } else {
            console.log('The speech recognition is still not ready!');
          };
        } else {
          console.log('Speech recognition is already running');
        }
      }
  }, [voiceState, isRecognizing]);


  const value = useMemo(() => ({
    theme,
    isDarkMode,
    setIsDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    newConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    executeBlock,
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    handleLanguage,
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    availableMicrophones, 
    setSelectedMicrophone, 
    voiceState,
    setVoiceState,
    toggleVoiceActivation,
    toggleSTTListening,
  }), [
    theme,
    isDarkMode,
    setIsDarkMode,
    isCollapsed,
    setIsCollapsed,
    projectPath,
    conversations,
    selectConversation,
    newConversation,
    addMessage,
    updateMessage,
    updateProjectPath,
    executeBlock,
    isNoAutoExecute,
    toggleAutoExecute,
    model,
    language,
    handleLanguage,
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    availableMicrophones, 
    setSelectedMicrophone,
    voiceState,
    setVoiceState,
    toggleVoiceActivation,
    toggleSTTListening,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
