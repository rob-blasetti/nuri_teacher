import React, { useCallback, useState } from 'react';
import { colors } from '../../../shared/theme/colors';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../../../app/navigation/types';
import { ContentItemEntity } from '../../../types/entities';
import { listContentItems } from '../../../data/repositories/contentRepository';

type NavProp = NativeStackNavigationProp<LibraryStackParamList, 'ContentList'>;

export function ContentListScreen() {
  const navigation = useNavigation<NavProp>();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'quote' | 'prayer' | undefined>();
  const [items, setItems] = useState<ContentItemEntity[]>([]);

  const load = useCallback(async () => {
    const rows = await listContentItems({ type: typeFilter, query });
    setItems(rows);
  }, [query, typeFilter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quotes & Prayers</Text>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search title or text"
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={load}
      />

      <View style={styles.filterRow}>
        {[
          { label: 'All', value: undefined },
          { label: 'Quotes', value: 'quote' as const },
          { label: 'Prayers', value: 'prayer' as const },
        ].map(filter => {
          const active = typeFilter === filter.value;
          return (
            <Pressable
              key={filter.label}
              onPress={() => setTypeFilter(filter.value)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ContentDetail', { contentId: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.type.toUpperCase()} • {item.theme ?? 'General'}
            </Text>
            <Text numberOfLines={2} style={styles.preview}>
              {item.text}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: colors.surfaceBorder,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
  },
  list: { gap: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
  },
  preview: {
    marginTop: 8,
    color: colors.textSoft,
  },
});
