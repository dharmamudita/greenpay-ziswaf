import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import { setItemAsync, getItemAsync } from '../utils/storage';
import api from '../services/api';

const { width } = Dimensions.get('window');
const CHAT_STORAGE_KEY = 'eco_ustadz_chat_history';

// Format waktu (HH:MM)
const formatTime = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format tanggal (untuk separator)
const formatDate = (timestamp) => {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) return 'Hari Ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Typing dots animation component
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    };
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (dot) => ({
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green[400], marginHorizontal: 2,
    opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }]
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
};

export default function EcoUstadzScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const dynamicStyles = getStyles(colors, isDark);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Load chat history dari storage saat pertama kali
  useEffect(() => {
    const loadChat = async () => {
      try {
        const saved = await getItemAsync(CHAT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch (e) { /* ignore */ }
      
      // Jika tidak ada history, tampilkan pesan pembuka
      setMessages([{
        id: '1', role: 'model',
        content: t('eco_ustadz.welcome'),
        timestamp: Date.now()
      }]);
    };
    loadChat();
  }, []);

  // Simpan chat ke storage setiap kali berubah
  useEffect(() => {
    if (messages.length > 0) {
      setItemAsync(CHAT_STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages]);

  // Hapus pesan error setelah 3 detik
  const scheduleAutoDelete = useCallback((msgId) => {
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }, 3000);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;
    
    const now = Date.now();
    const userMsg = { id: now.toString(), role: 'user', content: inputText.trim(), timestamp: now };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg.content });

      const response = await api.post('/ai/chat', { 
        message: userMsg.content,
        history: history.slice(1)
      });

      if (response.data.error) throw new Error(response.data.error);

      const aiMsg = { 
        id: (Date.now()).toString(), role: 'model', 
        content: response.data.reply, timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorId = (Date.now()).toString();
      const errorMsg = { 
        id: errorId, role: 'model', 
        content: t('eco_ustadz.error_msg'), 
        timestamp: Date.now(), isError: true 
      };
      setMessages(prev => [...prev, errorMsg]);
      // Auto-hapus pesan error setelah 3 detik
      scheduleAutoDelete(errorId);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeMsg = {
      id: Date.now().toString(), role: 'model',
      content: t('eco_ustadz.welcome'), timestamp: Date.now()
    };
    setMessages([welcomeMsg]);
  };

  // Cek apakah perlu separator tanggal
  const needsDateSeparator = (index) => {
    if (index === 0) return true;
    const current = new Date(messages[index].timestamp);
    const prev = new Date(messages[index - 1].timestamp);
    return current.toDateString() !== prev.toDateString();
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    const showDate = needsDateSeparator(index);
    
    return (
      <>
        {showDate && (
          <View style={dynamicStyles.dateSeparator}>
            <View style={dynamicStyles.dateLine} />
            <Text style={dynamicStyles.dateText}>{formatDate(item.timestamp)}</Text>
            <View style={dynamicStyles.dateLine} />
          </View>
        )}
        <View style={[dynamicStyles.messageWrapper, isUser ? dynamicStyles.messageWrapperUser : dynamicStyles.messageWrapperModel]}>
          {!isUser && (
            <View style={dynamicStyles.avatarModel}>
              <LinearGradient 
                colors={[Colors.green[400], Colors.green[600]]} 
                style={dynamicStyles.avatarGradient}
              >
                <Ionicons name="leaf" size={14} color={Colors.white} />
              </LinearGradient>
            </View>
          )}
          <View style={{ maxWidth: '78%' }}>
            <View style={[
              dynamicStyles.messageBubble, 
              isUser ? dynamicStyles.messageBubbleUser : dynamicStyles.messageBubbleModel,
              item.isError && dynamicStyles.messageBubbleError
            ]}>
              <Text style={[dynamicStyles.messageText, isUser ? dynamicStyles.messageTextUser : dynamicStyles.messageTextModel]}>
                {item.content}
              </Text>
            </View>
            <View style={[dynamicStyles.timeRow, isUser && { justifyContent: 'flex-end' }]}>
              {item.isError && (
                <Ionicons name="alert-circle" size={12} color="#F87171" style={{ marginRight: 4 }} />
              )}
              <Text style={dynamicStyles.timeText}>{formatTime(item.timestamp)}</Text>
              {isUser && (
                <Ionicons name="checkmark-done" size={14} color={Colors.green[400]} style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <LinearGradient 
          colors={isDark ? [Colors.dark.surface2, Colors.dark.bg] : [Colors.green[600], Colors.green[800]]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={dynamicStyles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={dynamicStyles.headerCenter}>
            <View style={dynamicStyles.headerAvatar}>
              <LinearGradient colors={[Colors.green[400], Colors.green[600]]} style={dynamicStyles.headerAvatarGrad}>
                <Ionicons name="leaf" size={18} color={Colors.white} />
              </LinearGradient>
              <View style={dynamicStyles.onlineDot} />
            </View>
            <View>
              <Text style={dynamicStyles.headerTitle}>{t('eco_ustadz.title')}</Text>
              <Text style={dynamicStyles.headerSubtitle}>
                {loading ? '⌨️ Mengetik...' : '🟢 Online'}
              </Text>
            </View>
          </View>

          <View style={{ width: 38 }} />
        </View>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={dynamicStyles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing Indicator */}
      {loading && (
        <View style={dynamicStyles.typingContainer}>
          <View style={dynamicStyles.avatarModel}>
            <LinearGradient colors={[Colors.green[400], Colors.green[600]]} style={dynamicStyles.avatarGradient}>
              <Ionicons name="leaf" size={14} color={Colors.white} />
            </LinearGradient>
          </View>
          <View style={[dynamicStyles.messageBubble, dynamicStyles.messageBubbleModel]}>
            <TypingDots />
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={dynamicStyles.inputArea}>
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            placeholder={t('eco_ustadz.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
        </View>
        <TouchableOpacity 
          style={[dynamicStyles.sendBtn, (!inputText.trim() || loading) && dynamicStyles.sendBtnDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
          activeOpacity={0.7}
        >
          <LinearGradient 
            colors={(!inputText.trim() || loading) ? [Colors.gray[300], Colors.gray[400]] : [Colors.green[500], Colors.green[700]]}
            style={dynamicStyles.sendBtnGrad}
          >
            <Ionicons name="send" size={18} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: isDark ? colors.bg : '#F0F4F0' },
  
  // Header
  header: { 
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Spacing['3xl'], 
    paddingBottom: Spacing.md, 
    overflow: 'hidden',
    ...Shadows.lg
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.md },
  headerAvatar: { position: 'relative', marginRight: Spacing.sm },
  headerAvatarGrad: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: Colors.green[700] },
  headerTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { color: Colors.green[200], fontSize: 12, fontWeight: '500', marginTop: 1 },
  clearBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  
  // Chat
  chatContainer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  
  // Date Separator
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, paddingHorizontal: Spacing.md },
  dateLine: { flex: 1, height: 1, backgroundColor: isDark ? colors.border : Colors.gray[200] },
  dateText: { 
    fontSize: 11, fontWeight: '600', color: colors.textMuted, 
    paddingHorizontal: Spacing.md, backgroundColor: isDark ? colors.bg : '#F0F4F0', 
  },
  
  // Messages
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.sm },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperModel: { justifyContent: 'flex-start' },
  
  avatarModel: { marginRight: Spacing.xs, marginBottom: 18 },
  avatarGradient: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  
  messageBubble: { padding: Spacing.md, borderRadius: 18 },
  messageBubbleUser: { 
    backgroundColor: Colors.green[600], 
    borderBottomRightRadius: 4,
    ...Shadows.sm
  },
  messageBubbleModel: { 
    backgroundColor: isDark ? colors.surface : Colors.white, 
    borderWidth: isDark ? 1 : 0, 
    borderColor: colors.border, 
    borderBottomLeftRadius: 4,
    ...Shadows.sm
  },
  messageBubbleError: {
    backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
    borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA',
    borderWidth: 1,
  },
  
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  messageTextUser: { color: Colors.white },
  messageTextModel: { color: colors.text },
  
  // Timestamp
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 4 },
  timeText: { fontSize: 11, color: colors.textMuted, fontWeight: '400' },
  
  // Typing indicator
  typingContainer: { 
    flexDirection: 'row', alignItems: 'flex-end', 
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm 
  },
  
  // Input
  inputArea: { 
    flexDirection: 'row', alignItems: 'flex-end', 
    padding: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: isDark ? colors.surface : Colors.white, 
    borderTopWidth: 1, borderTopColor: isDark ? colors.border : Colors.gray[200],
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.sm,
    ...Shadows.sm
  },
  inputContainer: { 
    flex: 1, backgroundColor: isDark ? colors.bg : Colors.gray[50], 
    borderRadius: 24, borderWidth: 1, borderColor: isDark ? colors.border : Colors.gray[200],
    paddingHorizontal: Spacing.md
  },
  input: { 
    fontSize: 15, color: colors.text, 
    paddingTop: 12, paddingBottom: 12, 
    maxHeight: 100, minHeight: 44 
  },
  sendBtn: { marginLeft: Spacing.sm, marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnGrad: { 
    width: 44, height: 44, borderRadius: 22, 
    alignItems: 'center', justifyContent: 'center' 
  },
});
