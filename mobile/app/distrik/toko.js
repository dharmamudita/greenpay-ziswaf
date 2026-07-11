import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';

export default function TokoManagerScreen() {
  const { colors, isDark } = useTheme();
  const dynamicStyles = getStyles(colors, isDark);
  
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Pupuk Kompos Organik 5Kg',
      price: 25000,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1592424001844-325d2b70f0dc?auto=format&fit=crop&w=400&q=80',
      status: 'active'
    },
    {
      id: 2,
      name: 'Tas Daur Ulang Plastik',
      price: 45000,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1558021946-f94d9302521c?auto=format&fit=crop&w=400&q=80',
      status: 'active'
    }
  ]);

  return (
    <View style={dynamicStyles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.container}>
          
          <View style={dynamicStyles.headerRow}>
            <View>
              <Text style={dynamicStyles.title}>Kelola Produk Toko</Text>
              <Text style={dynamicStyles.subtitle}>Pajang produk UMKM Anda di e-Market GreenPay.</Text>
            </View>
            <TouchableOpacity style={dynamicStyles.addBtn}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {products.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="storefront-outline" size={64} color={colors.textMuted} />
              <Text style={dynamicStyles.emptyTitle}>Toko Masih Kosong</Text>
              <Text style={dynamicStyles.emptySub}>Tambahkan produk pertama Anda sekarang.</Text>
            </View>
          ) : (
            <View style={dynamicStyles.productList}>
              {products.map(product => (
                <View key={product.id} style={dynamicStyles.productCard}>
                  <Image source={{ uri: product.image }} style={dynamicStyles.productImage} />
                  <View style={dynamicStyles.productInfo}>
                    <Text style={dynamicStyles.productName} numberOfLines={2}>{product.name}</Text>
                    <Text style={dynamicStyles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</Text>
                    <Text style={dynamicStyles.productStock}>Stok: {product.stock} pcs</Text>
                  </View>
                  <View style={dynamicStyles.productActions}>
                    <TouchableOpacity style={dynamicStyles.actionBtn}>
                      <Ionicons name="pencil" size={18} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[dynamicStyles.actionBtn, { marginTop: 8 }]}>
                      <Ionicons name="trash" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: Spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing['2xl'] },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, maxWidth: '90%' },
  
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },

  productList: { gap: Spacing.lg },
  productCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.sm, borderWidth: 1, borderColor: colors.border, ...Shadows.sm },
  productImage: { width: 80, height: 80, borderRadius: BorderRadius.lg, backgroundColor: colors.bg },
  productInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '800', color: Colors.green[600], marginBottom: 4 },
  productStock: { fontSize: 12, color: colors.textMuted },
  
  productActions: { padding: Spacing.xs, justifyContent: 'center' },
  actionBtn: { padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : Colors.gray[100], borderRadius: 8 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
