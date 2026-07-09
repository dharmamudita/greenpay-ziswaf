import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import api from '../../services/api';

const categories = ['Semua', 'Aksesoris', 'Peralatan', 'Perawatan', 'Dapur', 'Dekorasi'];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const { colors, isDark } = useTheme();

  const dynamicStyles = getStyles(colors, isDark);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/marketplace');
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
        <Text style={dynamicStyles.pageTitle}>Marketplace <Text style={{ color: Colors.green[500] }}>UMKM</Text></Text>

        {/* Search */}
        <View style={dynamicStyles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput 
            style={dynamicStyles.searchInput} 
            placeholder="Cari produk ramah lingkungan..." 
            placeholderTextColor={colors.textMuted} 
            value={search} 
            onChangeText={setSearch} 
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[dynamicStyles.catBtn, activeCategory === cat && dynamicStyles.catBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[dynamicStyles.catText, activeCategory === cat && dynamicStyles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        {loading ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.green[500]} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Produk tidak ditemukan.</Text>
          </View>
        ) : (
          <View style={dynamicStyles.prodGrid}>
            {filtered.map((p) => (
              <Card key={p.id} style={dynamicStyles.prodCard}>
                <View style={dynamicStyles.prodImgPlaceholder}>
                  <Ionicons name={getIconForCategory(p.category)} size={40} color={Colors.green[500]} />
                </View>
                <Badge text={`+${p.points_bonus} GP`} variant="primary" />
                <Text style={dynamicStyles.prodName}>{p.name}</Text>
                <Text style={dynamicStyles.prodUmkm}>{p.umkm_name}</Text>
                
                <View style={dynamicStyles.prodFooter}>
                  <Text style={dynamicStyles.prodPrice}>{fmt(p.price)}</Text>
                  <Text style={dynamicStyles.prodRating}>
                    <Ionicons name="star" size={10} color={Colors.gold[400]} /> {p.rating}
                  </Text>
                </View>
                
                <Button 
                  title={purchasing === p.id ? "Memproses..." : "Beli"} 
                  variant="outline" 
                  onPress={() => handlePurchase(p.id, p.name)} 
                  style={{ marginTop: Spacing.sm }} 
                  disabled={purchasing === p.id || p.stock <= 0}
                />
              </Card>
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
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: Spacing.base },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: Spacing.md },
  catScroll: { marginBottom: Spacing.lg },
  catBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.full, backgroundColor: colors.surface, marginRight: Spacing.sm, borderWidth: 1, borderColor: colors.border },
  catBtnActive: { backgroundColor: Colors.green[600], borderColor: Colors.green[500] },
  catText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  catTextActive: { color: Colors.white },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  prodCard: { width: '48%', gap: Spacing.xs, backgroundColor: colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: Spacing.sm },
  prodImgPlaceholder: { height: 100, backgroundColor: colors.surface2, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  prodName: { fontSize: 13, fontWeight: '700', color: colors.text },
  prodUmkm: { fontSize: 10, color: colors.textMuted },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { fontSize: 14, fontWeight: '800', color: Colors.green[500] },
  prodRating: { fontSize: 10, color: colors.textMuted },
});
