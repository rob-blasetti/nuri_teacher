import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { useAuth } from '../../auth/context/AuthContext';
import { createChildrenClass } from '../../../services/createClassService';
import { useClasses } from '../context/ClassesContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CreateClass'>;
const frequencies = ['Weekly', 'Bi-Weekly', 'Monthly', 'One-Off'] as const;
const grades = ['Preschool', 'Grade 1', 'Grade 2'] as const;

export function CreateClassScreen() {
  const navigation = useNavigation<Nav>();
  const { authSession } = useAuth();
  const { refreshClasses } = useClasses();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState('Sunday');
  const [time, setTime] = useState('10:00 AM');
  const [frequency, setFrequency] = useState<(typeof frequencies)[number]>('Weekly');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState<(typeof grades)[number]>('Grade 1');
  const [curriculumLesson, setCurriculumLesson] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(title.trim() && day.trim() && time.trim() && sessionDate.trim() && authSession?.token),
    [authSession?.token, day, sessionDate, time, title],
  );

  const onSubmit = async () => {
    if (!authSession?.token || !authSession.user.id || !authSession.community?.id) {
      setError('You need a full signed-in session with a community to create a class.');
      return;
    }

    if (!title.trim() || !day.trim() || !time.trim() || !sessionDate.trim()) {
      setError('Fill in the class title, day, time, and first session date.');
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      await createChildrenClass({
        token: authSession.token,
        createdBy: authSession.user.id,
        community: authSession.community.id,
        title: title.trim(),
        description: description.trim() || undefined,
        day: day.trim(),
        time: time.trim(),
        frequency,
        sessionDate,
        grade,
        curriculumLesson: curriculumLesson.trim() || undefined,
      });
      await refreshClasses();
      navigation.goBack();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Children&apos;s Class</Text>
        <Text style={styles.subtitle}>Create a new class in your community and seed its first session.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Class title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Radiant Hearts" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline placeholder="Optional notes about the class" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Day</Text>
          <TextInput style={styles.input} value={day} onChangeText={setDay} placeholder="Sunday" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Time</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="10:00 AM" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.choiceRow}>
            {frequencies.map(item => (
              <Pressable key={item} style={[styles.choiceChip, item === frequency && styles.choiceChipActive]} onPress={() => setFrequency(item)}>
                <Text style={[styles.choiceText, item === frequency && styles.choiceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>First session date</Text>
          <TextInput style={styles.input} value={sessionDate} onChangeText={setSessionDate} placeholder="2026-03-15" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Grade</Text>
          <View style={styles.choiceRow}>
            {grades.map(item => (
              <Pressable key={item} style={[styles.choiceChip, item === grade && styles.choiceChipActive]} onPress={() => setGrade(item)}>
                <Text style={[styles.choiceText, item === grade && styles.choiceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Curriculum lesson</Text>
          <TextInput style={styles.input} value={curriculumLesson} onChangeText={setCurriculumLesson} placeholder="Optional, e.g. 1.1 or 2.3" placeholderTextColor={colors.textMuted} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, (!canSubmit || isSubmitting) && styles.buttonDisabled]} disabled={!canSubmit || isSubmitting} onPress={onSubmit}>
            {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Create Class</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { color: colors.textMuted, lineHeight: 20, marginBottom: 12 },
  card: { backgroundColor: colors.surfaceSoft, borderRadius: 18, borderWidth: 1, borderColor: colors.surfaceBorder, padding: 16 },
  label: { color: colors.textSoft, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.surfaceBorderSoft, borderRadius: 12, paddingHorizontal: 12, height: 48, color: colors.textOnWhite },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.surfaceBorderSoft, backgroundColor: colors.white },
  choiceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.textOnWhite, fontWeight: '600' },
  choiceTextActive: { color: colors.white },
  error: { color: colors.danger, marginTop: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 48, marginTop: 18 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: '700' },
});
