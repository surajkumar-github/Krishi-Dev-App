import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Keyboard, Image, Dimensions, SafeAreaView
} from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Markdown from 'react-native-markdown-display';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://krishi-dev-backend.onrender.com';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const initUserId = async () => {
      let id = await AsyncStorage.getItem('userId');
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem('userId', id);
      }
      setUserId(id);
    };
    initUserId();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
  if (!userId) return;

  const loadChats = async () => {
    try {
      const res = await fetch(`${API_URL}/chats/${userId}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const formatted = data.flatMap(chat => {
        if (chat.type === 'text') {
          return [
            { type: 'text', content: chat.question, sender: 'user' },
            { type: 'text', content: chat.response, sender: 'bot' }
          ];
        } else if (chat.type === 'image') {
          const mime = chat.content_type || 'image/jpeg'; // Default fallback
          const base64 = chat.image_base64 || ''; // base64 string from backend
          const uri = `data:${mime};base64,${base64}`;

          return [
            { type: 'image', content: uri, sender: 'user' },
            { type: 'text', content: chat.result || 'No analysis result.', sender: 'bot' }
          ];
        } else {
          return [];
        }
      });

      setMessages(formatted);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 300);
    } catch (err) {
      console.error('❌ Failed to load chats:', err.message);
    }
  };

  loadChats();
}, [userId]);


  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !userId) return;
    const inputText = text;
    const newMessage = { type: 'text', content: inputText, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setText('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, question: inputText }),
      });
      const data = await res.json();
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { type: 'text', content: data.answer || 'No response.', sender: 'bot' },
        ]);
        setIsTyping(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }, 1000);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { type: 'text', content: '❌ Error connecting to server.', sender: 'bot' },
      ]);
      setIsTyping(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.assets || result.canceled) return;
      const file = result.assets[0];
      const localUri = file.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type,
      });
      formData.append('user_id', userId);

      setMessages(prev => [...prev, { type: 'image', content: localUri, sender: 'user' }]);
      setIsTyping(true);

      const res = await fetch(`${API_URL}/analyze-image/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { type: 'text', content: data.result || 'No analysis result.', sender: 'bot' },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error('❌ Image upload failed:', error.message);
      setMessages(prev => [
        ...prev,
        { type: 'text', content: '❌ Image upload failed.', sender: 'bot' },
      ]);
      setIsTyping(false);
    }
  };

  const handleCameraLaunch = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access the camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.assets || result.canceled) return;

      const file = result.assets[0];
      const localUri = file.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type,
      });
      formData.append('user_id', userId);

      setMessages(prev => [...prev, { type: 'image', content: localUri, sender: 'user' }]);
      setIsTyping(true);

      const res = await fetch(`${API_URL}/analyze-image/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { type: 'text', content: data.result || 'No analysis result.', sender: 'bot' },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error('❌ Camera capture failed:', error.message);
      setMessages(prev => [
        ...prev,
        { type: 'text', content: '❌ Camera capture failed.', sender: 'bot' },
      ]);
      setIsTyping(false);
    }
  };

  const handleFloatingButtonPress = () => {
    if (keyboardVisible) Keyboard.dismiss();
    else inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ask AI</Text>
          <Text style={styles.headerTitle2}>Beta.</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              {messages.map((msg, i) => (
                <View
                  key={i}
                  style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}
                >
                  {msg.type === 'image' ? (
                    <Image
                      source={{ uri: msg.content }}
                      style={{ width: SCREEN_WIDTH * 0.5, height: SCREEN_WIDTH * 0.5, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  ) : msg.sender === 'bot' ? (
                    <Markdown style={markdownStyles}>{msg.content}</Markdown>
                  ) : (
                    <Text style={styles.messageText}>{msg.content}</Text>
                  )}
                </View>
              ))}

              {isTyping && (
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <Text style={{ fontStyle: 'italic', color: '#555' }}>Analyzing...</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.floatingKeyboardButton}
              onPress={handleFloatingButtonPress}
              activeOpacity={0.7}
            >
              <Ionicons name={keyboardVisible ? 'chevron-down' : 'chevron-up'} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputBar}>
            <TouchableOpacity onPress={handleImageUpload} style={styles.mediaButton}>
              <Ionicons name="image" size={22} color="#2E7D32" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCameraLaunch} style={styles.mediaButton}>
              <Ionicons name="camera" size={22} color="#2E7D32" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message"
              value={text}
              onChangeText={setText}
              multiline
              onSubmitEditing={handleSend}
              onFocus={() => {
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
              }}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingTop: Platform.OS === 'ios' ? 0 : 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 3,
    justifyContent: 'space-between',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    fontFamily: 'Helvetica',
  },
  headerTitle2: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Helvetica',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginLeft: 10,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContentContainer: {
    padding: 10,
    paddingBottom: 70,
  },
  messageBubble: {
    maxWidth: '88%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 4,
    borderRadius: 16,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#2E7D32',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  mediaButton: {
    paddingHorizontal: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 15,
    marginHorizontal: 4,
    maxHeight: 120,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#2E7D32',
    borderRadius: 50,
  },
  floatingKeyboardButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

const markdownStyles = {
  body: {
    color: '#000000ff',
    fontSize: 15,
    lineHeight: 19.5,
    marginLeft: 0,
    paddingLeft: 0,
  },
};
