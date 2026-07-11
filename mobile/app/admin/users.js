import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, SafeAreaView, Image, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'user', 'distrik'

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.log('Error fetching users:', error);
      Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.failed_load_users', {defaultValue: 'Gagal memuat data pengguna.'}));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return;
    
    Alert.alert(
      t('admin.confirm', {defaultValue: 'Konfirmasi'}),
      t('admin.change_role_confirm', {defaultValue: `Ubah peran ${selectedUser.display_name} menjadi ${newRole.toUpperCase()}?`}),
      [
        { text: t('admin.cancel', {defaultValue: 'Batal'}), style: 'cancel' },
        { 
          text: t('admin.yes_change', {defaultValue: 'Ya, Ubah'}), 
          onPress: async () => {
            try {
              setUpdating(true);
              await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
              setModalVisible(false);
              fetchUsers(); // Refresh data
            } catch (error) {
              console.log('Error updating role:', error);
              Alert.alert(t('admin.error', {defaultValue: 'Error'}), t('admin.failed_change_role', {defaultValue: 'Gagal mengubah peran pengguna.'}));
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  const renderUserItem = ({ item }) => {
    let roleColor = Colors.info;
    let roleIcon = 'person';
    if (item.role === 'admin') {
      roleColor = Colors.gold[500];
      roleIcon = 'shield-checkmark';
    } else if (item.role === 'distrik') {
      roleColor = Colors.green[500];
      roleIcon = 'business';
    }

    return (
      <TouchableOpacity 
        style={dynamicStyles.userCard}
        onPress={() => {
          setSelectedUser(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={dynamicStyles.userInfoRow}>
          <View style={[dynamicStyles.avatarBox, { backgroundColor: isDark ? roleColor + '20' : roleColor + '15' }]}>
            {item.photo_url ? (
              <Image source={{ uri: item.photo_url }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
            ) : (
              <Ionicons name={roleIcon} size={20} color={roleColor} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.userName}>{item.display_name}</Text>
            <Text style={dynamicStyles.userEmail}>{item.email}</Text>
          </View>
          <View style={[dynamicStyles.roleBadge, { backgroundColor: roleColor }]}>
            <Text style={dynamicStyles.roleBadgeText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      
      {/* Filter Chips */}
      <View style={dynamicStyles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'user', 'distrik'].map(role => (
            <TouchableOpacity 
              key={role} 
              style={[dynamicStyles.filterChip, filterRole === role && dynamicStyles.filterChipActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[dynamicStyles.filterText, filterRole === role && dynamicStyles.filterTextActive]}>
                {role === 'all' ? t('admin.all', {defaultValue: 'Semua'}) : role === 'user' ? t('admin.normal_user', {defaultValue: 'Pengguna Biasa'}) : t('admin.district_manager', {defaultValue: 'Pengelola Distrik'})}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={dynamicStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.green[500]} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={dynamicStyles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchUsers}
        />
      )}

      {/* Role Management Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>{t('admin.change_role_title', {defaultValue: 'Ubah Peran Pengguna'})}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={dynamicStyles.selectedUserBox}>
                <Text style={dynamicStyles.selectedUserName}>{selectedUser.display_name}</Text>
                <Text style={dynamicStyles.selectedUserEmail}>{selectedUser.email}</Text>
                <Text style={dynamicStyles.currentRoleText}>
                  {t('admin.current_role', {defaultValue: 'Peran saat ini:'})} <Text style={{ fontWeight: '800', color: Colors.green[500] }}>{selectedUser.role.toUpperCase()}</Text>
                </Text>
              </View>
            )}

            <Text style={dynamicStyles.sectionLabel}>{t('admin.select_new_role', {defaultValue: 'Pilih Peran Baru:'})}</Text>
            
            {['user', 'distrik', 'admin'].map((roleOp) => (
              <TouchableOpacity 
                key={roleOp}
                style={[
                  dynamicStyles.roleOptionBtn, 
                  selectedUser?.role === roleOp && dynamicStyles.roleOptionSelected
                ]}
                onPress={() => handleRoleChange(roleOp)}
                disabled={selectedUser?.role === roleOp || updating}
              >
                <Text style={[
                  dynamicStyles.roleOptionText, 
                  selectedUser?.role === roleOp && { color: Colors.white }
                ]}>
                  {roleOp.toUpperCase()}
                </Text>
                {selectedUser?.role === roleOp && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                )}
              </TouchableOpacity>
            ))}

            {updating && (
              <ActivityIndicator style={{ marginTop: 20 }} color={Colors.green[500]} />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filterRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100],
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
  },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  filterTextActive: { color: Colors.info, fontWeight: '800' },
  
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { padding: Spacing.xl, paddingBottom: 100 },
  
  userCard: {
    backgroundColor: colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.05,
  },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  userName: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 2 },
  userEmail: { fontSize: 12, color: colors.textMuted },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  roleBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  
  selectedUserBox: {
    backgroundColor: isDark ? colors.bg : Colors.gray[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedUserName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
  selectedUserEmail: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  currentRoleText: { fontSize: 13, color: colors.text },

  sectionLabel: { fontSize: 14, fontWeight: '800', color: colors.textMuted, marginBottom: Spacing.md },
  
  roleOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: isDark ? colors.bg : Colors.gray[100],
    marginBottom: Spacing.sm,
  },
  roleOptionSelected: { backgroundColor: Colors.green[500] },
  roleOptionText: { fontSize: 15, fontWeight: '700', color: colors.text },
});
