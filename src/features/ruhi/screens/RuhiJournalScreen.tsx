import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RuhiNoteEntity } from '../../../types/entities';
import { listRuhiNotes } from '../../../data/repositories/ruhiRepository';

export function RuhiJournalScreen() {
  const [notes, setNotes] = useState<RuhiNoteEntity[]>([]);

  const load = useCallback(async () => {
    const rows = await listRuhiNotes();
    setNotes(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruhi Journal</Text>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No notes yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.body}>{item.body}</Text>
            {item.applyThisWeek ? (
              <Text style={styles.apply}>Apply: {item.applyThisWeek}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  list: { gap: 10 },
  empty: { color: '#64748B' },
  card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12 },
  meta: { color: '#64748B', fontSize: 12, marginBottom: 6 },
  body: { color: '#1E293B' },
  apply: { marginTop: 8, color: '#0F172A', fontWeight: '600' },
});
