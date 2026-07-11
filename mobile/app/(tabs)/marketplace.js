import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import api from '../../services/api';

const categories = ['Semua', 'Aksesoris', 'Peralatan', 'Perawatan', 'Dapur', 'Dekorasi'];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/marketplace/products');
      setProducts(res.data);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId, productName) => {
    Alert.alert(
      "Konfirmasi Pembelian",
      `Apakah Anda yakin ingin membeli ${productName}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Beli", 
          onPress: async () => {
            try {
              setPurchasing(productId);
              await api.post('/marketplace/order', {
                productId: productId,
                quantity: 1
              });
              Alert.alert('Sukses', 'Pesanan Anda sedang diproses!');
              fetchProducts(); // Refresh stock
            } catch (error) {
              console.log('Error purchasing:', error);
              Alert.alert('Gagal', 'Terjadi kesalahan saat membuat pesanan.');
            } finally {
              setPurchasing(null);
            }
          }
        }
      ]
    );
  };

  const getIconForCategory = (category) => {
    switch(category.toLowerCase()) {
      case 'aksesoris': return 'bag-handle';
      case 'peralatan': return 'flask';
      case 'perawatan': return 'leaf';
      case 'dapur': return 'restaurant';
      case 'dekorasi': return 'flower';
      default: return 'cube';
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  return (
    <ScrollView style={dynamicStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.container}>
        
        {/* Header Section */}
        <View style={dynamicStyles.headerContainer}>
          <Text style={dynamicStyles.pageTitle}>{t('marketplace.title')} <Text style={{ color: Colors.green[500] }}>{t('marketplace.title_highlight')}</Text></Text>
          <Text style={dynamicStyles.pageDesc}>Dukung UMKM lokal dengan produk ramah lingkungan.</Text>
        </View>

        {/* Premium Search Bar */}
        <View style={dynamicStyles.searchWrap}>
          <Ionicons name="search" size={20} color={isDark ? Colors.gray[400] : Colors.gray[500]} style={{ marginRight: 8 }} />
          <TextInput 
            style={dynamicStyles.searchInput} 
            placeholder={t('marketplace.search')} 
            placeholderTextColor={colors.textMuted} 
            value={search} 
            onChangeText={setSearch} 
          />
        </View>

        {/* Modern Scrollable Pill Tabs */}
        <View style={dynamicStyles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.catScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[dynamicStyles.pillTab, activeCategory === cat && dynamicStyles.pillTabActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[dynamicStyles.pillTabText, activeCategory === cat && dynamicStyles.pillTabTextActive]}>
                  {cat === 'Semua' ? t('marketplace.all') : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <View style={dynamicStyles.emptyIconBox}>
              <Ionicons name="cube-outline" size={48} color={isDark ? Colors.gray[600] : Colors.gray[300]} />
            </View>
            <Text style={dynamicStyles.emptyTitle}>Produk Tidak Ditemukan</Text>
            <Text style={dynamicStyles.emptyDesc}>Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.prodGrid}>
            {filtered.map((p) => (
              <View key={p.id} style={dynamicStyles.prodCard}>
                
                {/* Image Area with Floating Badge */}
                <View style={dynamicStyles.prodImgPlaceholder}>
                  {p.image_url ? (
                    <Image source={{ uri: p.image_url }} style={dynamicStyles.actualProductImg} />
                  ) : (
                    <Ionicons name={getIconForCategory(p.category)} size={48} color={Colors.green[500]} />
                  )}
                  <View style={dynamicStyles.floatingBadge}>
                    <Ionicons name="star" size={10} color={Colors.white} style={{ marginRight: 2 }} />
                    <Text style={dynamicStyles.floatingBadgeText}>+{p.points_bonus} GP</Text>
                  </View>
                </View>
                
                {/* Product Content */}
                <View style={dynamicStyles.prodContent}>
                  <Text style={dynamicStyles.prodName} numberOfLines={2}>{p.name}</Text>
                  
                  <View style={dynamicStyles.umkmRow}>
                    <Ionicons name="storefront-outline" size={12} color={colors.textMuted} />
                    <Text style={dynamicStyles.prodUmkm} numberOfLines={1}>{p.umkm_name}</Text>
                  </View>
                  
                  <View style={dynamicStyles.priceRow}>
                    <Text style={dynamicStyles.prodPrice}>{fmt(p.price)}</Text>
                    <View style={dynamicStyles.ratingBox}>
                      <Ionicons name="star" size={10} color={Colors.gold[400]} />
                      <Text style={dynamicStyles.prodRating}>{p.rating}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[dynamicStyles.buyBtn, (purchasing === p.id || p.stock <= 0) && dynamicStyles.buyBtnDisabled]} 
                    onPress={() => handlePurchase(p.id, p.name)}
                    disabled={purchasing === p.id || p.stock <= 0}
                    activeOpacity={0.8}
                  >
                    {purchasing === p.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={dynamicStyles.buyBtnText}>{p.stock <= 0 ? 'Habis' : 'Beli Sekarang'}</Text>
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingBottom: Spacing.xl },
  
  headerContainer: { paddingHorizontal: Spacing.xl, paddingTop: 70, paddingBottom: Spacing.md },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  pageDesc: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  
  searchWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: isDark ? colors.surface2 : Colors.white, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1, 
    borderColor: isDark ? colors.border : Colors.gray[200], 
    paddingHorizontal: Spacing.lg, 
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
    shadowOpacity: 0.05,
    height: 52,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  
  tabsContainer: {
    marginBottom: Spacing.xl,
  },
  catScroll: { 
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  pillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    shadowOpacity: 0.03,
  },
  pillTabActive: {
    backgroundColor: Colors.green[500],
    borderColor: Colors.green[500],
  },
  pillTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? Colors.gray[300] : Colors.gray[600],
  },
  pillTabTextActive: {
    color: Colors.white,
  },
  
  prodGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 16,
    paddingHorizontal: Spacing.xl,
  },
  
  prodCard: { 
    width: '47.5%', // Slightly less than 50% to account for gap
    backgroundColor: colors.surface, 
    borderRadius: BorderRadius.xl, 
    borderWidth: 1, 
    borderColor: colors.border,
    overflow: 'hidden',
    ...Shadows.md,
    shadowOpacity: 0.06,
  },
  prodImgPlaceholder: { 
    height: 120, 
    backgroundColor: isDark ? colors.surface3 : Colors.green[50],
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actualProductImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.gold[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },
  
  prodContent: {
    padding: Spacing.md,
  },
  prodName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
    height: 40, // Fixed height for 2 lines
  },
  umkmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 4,
  },
  prodUmkm: { 
    fontSize: 11, 
    color: colors.textMuted,
    flex: 1,
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  prodPrice: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: Colors.green[600],
    letterSpacing: -0.5,
  },
  ratingBox: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  prodRating: { 
    fontSize: 11, 
    fontWeight: '600',
    color: colors.textMuted 
  },
  
  buyBtn: {
    backgroundColor: Colors.green[500],
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: isDark ? colors.surface3 : Colors.gray[300],
  },
  buyBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? colors.surface2 : Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  }
});
