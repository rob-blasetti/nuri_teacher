import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RuhiStackParamList } from '../../../app/navigation/types';
import { RuhiSectionEntity } from '../../../types/entities';
import { getRuhiSectionById, saveRuhiNote } from '../../../data/repositories/ruhiRepository';
import { colors } from '../../../shared/theme/colors';

type RouteT = RouteProp<RuhiStackParamList, 'RuhiSection'>;
type Nav = NativeStackNavigationProp<RuhiStackParamList, 'RuhiSection'>;

export function RuhiSectionScreen() {
  const route = useRoute<RouteT>();
  const navigation = useNavigation<Nav>();
  const [section, setSection] = useState<RuhiSectionEntity | null>(null);
  const [note, setNote] = useState('');
  const [apply, setApply] = useState('');

  useEffect(() => {
    getRuhiSectionById(route.params.sectionId).then(setSection);
  }, [route.params.sectionId]);

  const onSave = async () => {
    if (!section || !note.trim()) return;
    await saveRuhiNote({ sectionId: section.id, body: note.trim(), applyThisWeek: apply.trim() || undefined });
    setNote('');
    setApply('');
    navigation.navigate('RuhiJournal');
  };

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Section not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title}</Text>
      <Text style={styles.body}>{section.text}</Text>

      <Text style={styles.section}>Reflection Prompts</Text>
      {section.prompts.map((prompt, idx) => (
        <Text key={`${prompt}-${idx}`} style={styles.prompt}>{idx + 1}. {prompt}</Text>
      ))}

      <Text style={styles.section}>Your Note</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Write insight from this section"
      />

      <Text style={styles.section}>Apply this week</Text>
      <TextInput
        style={styles.input}
        value={apply}
        onChangeText={setApply}
        placeholder="One practical commitment"
      />

      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save to Journal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  body: { marginTop: 10, color: colors.surfaceSoft, lineHeight: 22 },
  section: { marginTop: 14, marginBottom: 6, color: colors.textPrimary, fontWeight: '700' },
  prompt: { color: colors.textSoft, marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  saveBtn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center' },
  saveText: { color: colors.white, fontWeight: '600' },
});
