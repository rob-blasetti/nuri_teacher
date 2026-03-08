import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RuhiStackParamList } from '../../../app/navigation/types';
import { RuhiBookEntity } from '../../../types/entities';
import { listRuhiBooks, listRuhiSections } from '../../../data/repositories/ruhiRepository';

type Nav = NativeStackNavigationProp<RuhiStackParamList, 'RuhiBookList'>;

export function RuhiBookListScreen() {
  const navigation = useNavigation<Nav>();
  const [books, setBooks] = useState<RuhiBookEntity[]>([]);

  const load = useCallback(async () => {
    const rows = await listRuhiBooks();
    setBooks(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onOpenBook = async (bookId: string) => {
    const sections = await listRuhiSections(bookId);
    if (sections[0]) {
      navigation.navigate('RuhiSection', { sectionId: sections[0].id });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruhi Study</Text>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onOpenBook(item.id)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.level ?? 'General'}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.journalBtn} onPress={() => navigation.navigate('RuhiJournal')}>
        <Text style={styles.journalText}>Open Ruhi Journal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  list: { gap: 10, paddingBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  cardMeta: { marginTop: 3, color: '#475569' },
  journalBtn: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center' },
  journalText: { color: 'white', fontWeight: '600' },
});
