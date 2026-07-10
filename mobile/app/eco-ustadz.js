import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';
import api from '../services/api';

export default function EcoUstadzScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const dynamicStyles = getStyles(colors, isDark);
  
  const [messages, setMessages] = useState([
    { id: '1', role: 'model', content: t('eco_ustadz.welcome') }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Kita kirim history percakapan sebelumnya agar AI punya konteks
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg.content });

      const response = await api.post('/ai/chat', { 
        message: userMsg.content,
        history: history.slice(1) // skip the initial greeting if we want, or send it all
      });

      if (response.data.error) {
         throw new Error(response.data.error);
      }

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'model', content: response.data.reply };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = { id: (Date.now() + 1).toString(), role: 'model', content: t('eco_ustadz.error_msg') };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[dynamicStyles.messageWrapper, isUser ? dynamicStyles.messageWrapperUser : dynamicStyles.messageWrapperModel]}>
        {!isUser && (
          <View style={dynamicStyles.avatarModel}>
            <Ionicons name="leaf" size={16} color={Colors.white} />
          </View>
        )}
        <View style={[dynamicStyles.messageBubble, isUser ? dynamicStyles.messageBubbleUser : dynamicStyles.messageBubbleModel, Shadows.sm]}>
          <Text style={[dynamicStyles.messageText, isUser ? dynamicStyles.messageTextUser : dynamicStyles.messageTextModel]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={dynamicStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <LinearGradient 
          colors={[Colors.green[600], Colors.green[800]]} 
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={dynamicStyles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={dynamicStyles.headerTitleWrap}>
            <Text style={dynamicStyles.headerTitle}>{t('eco_ustadz.title')}</Text>
            <Text style={dynamicStyles.headerSubtitle}>{t('eco_ustadz.subtitle')}</Text>
          </View>
          <View style={{ width: 40 }} />
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
      />

      {loading && (
        <View style={dynamicStyles.loadingIndicator}>
          <ActivityIndicator size="small" color={Colors.green[500]} />
          <Text style={dynamicStyles.loadingText}>{t('eco_ustadz.typing')}</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={dynamicStyles.inputArea}>
        <TextInput
          style={dynamicStyles.input}
          placeholder={t('eco_ustadz.placeholder')}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[dynamicStyles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: Spacing['3xl'], paddingBottom: Spacing.md, overflow: 'hidden', borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'] },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  headerTitleWrap: { alignItems: 'center' },
  headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: Colors.green[100], fontSize: 12, marginTop: 2 },
  
  chatContainer: { padding: Spacing.xl, paddingBottom: Spacing['2xl'] },
  
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.lg },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperModel: { justifyContent: 'flex-start' },
  
  avatarModel: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green[500], alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  
  messageBubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.xl },
  messageBubbleUser: { backgroundColor: Colors.green[600], borderBottomRightRadius: 4 },
  messageBubbleModel: { backgroundColor: colors.surface, borderWidth: isDark ? 1 : 0, borderColor: colors.border, borderBottomLeftRadius: 4 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: Colors.white },
  messageTextModel: { color: colors.text },
  
  loadingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.sm },
  loadingText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.md },
  input: { flex: 1, backgroundColor: isDark ? colors.bg : Colors.gray[100], borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: colors.text, maxHeight: 100, minHeight: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.green[600], alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.md }
});
