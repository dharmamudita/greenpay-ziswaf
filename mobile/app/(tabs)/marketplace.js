import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '../../components/ui';
import Colors from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

const products = [
  { id: 1, name: 'Tas Belanja Daur Ulang', price: 45000, category: 'Aksesoris', umkm: 'EcoStore Bandung', points: 15, rating: 4.8, sold: 234, emoji: '👜' },
  { id: 2, name: 'Tumbler Bambu 500ml', price: 85000, category: 'Peralatan', umkm: 'Green Living Jakarta', points: 25, rating: 4.9, sold: 189, emoji: '🥤' },
  { id: 3, name: 'Sabun Natural Organik', price: 25000, category: 'Perawatan', umkm: 'Nature Pure Yogya', points: 10, rating: 4.7, sold: 567, emoji: '🧴' },
  { id: 4, name: 'Sedotan Stainless Set', price: 35000, category: 'Peralatan', umkm: 'EcoStore Bandung', points: 12, rating: 4.6, sold: 445, emoji: '🥢' },
  { id: 5, name: 'Beeswax Food Wrap', price: 55000, category: 'Dapur', umkm: 'Green Living Jakarta', points: 18, rating: 4.8, sold: 123, emoji: '🐝' },
  { id: 6, name: 'Pot Tanaman Daur Ulang', price: 30000, category: 'Dekorasi', umkm: 'Nature Pure Yogya', points: 8, rating: 4.5, sold: 321, emoji: '🪴' },
];

const categories = ['Semua', 'Aksesoris', 'Peralatan', 'Perawatan', 'Dapur', 'Dekorasi'];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID');

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Marketplace <Text style={{ color: Colors.green[400] }}>UMKM</Text></Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.gray[500]} />
          <TextInput style={styles.searchInput} placeholder="Cari produk..." placeholderTextColor={Colors.gray[600]} value={search} onChangeText={setSearch} />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, activeCategory === cat && styles.catBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        <View style={styles.prodGrid}>
          {filtered.map((p) => (
            <Card key={p.id} style={styles.prodCard}>
              <View style={styles.prodImgPlaceholder}><Text style={{ fontSize: 32 }}>{p.emoji}</Text></View>
              <Badge text={`+${p.points} GP`} />
              <Text style={styles.prodName}>{p.name}</Text>
              <Text style={styles.prodUmkm}>{p.umkm}</Text>
              <View style={styles.prodFooter}>
                <Text style={styles.prodPrice}>{fmt(p.price)}</Text>
                <Text style={styles.prodRating}>⭐ {p.rating}</Text>
              </View>
              <Button title="Beli" variant="outline" onPress={() => {}} style={{ marginTop: Spacing.sm }} />
            </Card>
          ))}
        </View>
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.dark.bg },
  container: { padding: Spacing.xl },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: Spacing.base },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dark.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.dark.border, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14, paddingVertical: Spacing.md },
  catScroll: { marginBottom: Spacing.lg },
  catBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.full, backgroundColor: Colors.dark.surface, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.dark.border },
  catBtnActive: { backgroundColor: Colors.green[600], borderColor: Colors.green[500] },
  catText: { fontSize: 12, fontWeight: '600', color: Colors.gray[400] },
  catTextActive: { color: Colors.white },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  prodCard: { width: '48%', gap: Spacing.xs },
  prodImgPlaceholder: { height: 100, backgroundColor: Colors.dark.surface2, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  prodName: { fontSize: 13, fontWeight: '700', color: Colors.white },
  prodUmkm: { fontSize: 10, color: Colors.gray[500] },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodPrice: { fontSize: 14, fontWeight: '800', color: Colors.green[400] },
  prodRating: { fontSize: 10, color: Colors.gray[500] },
});
