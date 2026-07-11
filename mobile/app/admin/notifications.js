import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

export default function AdminNotificationsScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      return Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.error_empty_msg', {defaultValue: 'Judul dan isi pesan tidak boleh kosong.'}));
    }
    
    setLoading(true);
    try {
      await api.post('/admin/notifications/broadcast', { title, message });
      Alert.alert(t('admin.success', {defaultValue: 'Sukses'}), t('admin.success_broadcast', {defaultValue: 'Notifikasi broadcast berhasil dikirim ke seluruh pengguna.'}));
      setTitle('');
      setMessage('');
    } catch (error) {
      console.log('Error sending broadcast:', error);
      Alert.alert(t('admin.failed', {defaultValue: 'Gagal'}), t('admin.failed_broadcast', {defaultValue: 'Gagal mengirim notifikasi.'}));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      
      <View style={dynamicStyles.headerBackground}>
        <LinearGradient 
          colors={[isDark ? 'rgba(168, 85, 247, 0.15)' : '#F3E8FF', colors.bg]} 
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={dynamicStyles.container}>
        


        <View style={dynamicStyles.formCard}>
          <Text style={dynamicStyles.sectionTitle}>{t('admin.broadcast_title', {defaultValue: 'Kirim Pesan Siaran (Broadcast)'})}</Text>
          
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>{t('admin.notif_title_label', {defaultValue: 'Judul Notifikasi'})}</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder={t('admin.notif_title_placeholder', {defaultValue: 'Contoh: Pemeliharaan Sistem'})}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>{t('admin.notif_msg_label', {defaultValue: 'Isi Pesan'})}</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              placeholder={t('admin.notif_msg_placeholder', {defaultValue: 'Ketik pengumuman atau pesan di sini...'})}
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={[dynamicStyles.submitBtn, loading && dynamicStyles.submitBtnDisabled]} 
            onPress={handleSendBroadcast}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={Colors.white} style={{ marginRight: 8 }} />
                <Text style={dynamicStyles.submitBtnText}>{t('admin.send_now', {defaultValue: 'Kirim Sekarang'})}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={dynamicStyles.infoBox}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <Text style={dynamicStyles.infoText}>{t('admin.notif_info', {defaultValue: 'Pesan siaran akan muncul di tab Notifikasi setiap akun pengguna secara seketika (*real-time*).'})}</Text>
        </View>

      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  container: { padding: Spacing.xl },
  

  
  formCard: { 
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius['2xl'], 
    padding: Spacing.xl, 
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.md,
    shadowOpacity: 0.05
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: Spacing.xl, letterSpacing: -0.5 },
  
  formGroup: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  
  submitBtn: {
    backgroundColor: Colors.purple,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: Spacing.md,
    ...Shadows.md
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  
  infoBox: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
    alignItems: 'center',
    gap: 12
  },
  infoText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 20 }
});
