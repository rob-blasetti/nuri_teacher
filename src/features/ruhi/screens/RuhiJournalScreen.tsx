import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RuhiNoteEntity } from '../../../types/entities';
import { listRuhiNotes } from '../../../data/repositories/ruhiRepository';
import { colors } from '../../../shared/theme/colors';

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
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  list: { gap: 10 },
  empty: { color: colors.textMuted },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 12, padding: 12 },
  meta: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  body: { color: colors.surfaceSoft },
  apply: { marginTop: 8, color: colors.textOnWhite, fontWeight: '600' },
});
