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
import { getCurriculumLessonsByGrade } from '../../lessons/data/lessonPlanContent';
import { useClasses } from '../context/ClassesContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CreateClass'>;
const frequencies = ['Weekly', 'Bi-Weekly', 'Monthly', 'One-Off'] as const;
const grades = ['Preschool', 'Grade 1', 'Grade 2'] as const;
const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type Frequency = (typeof frequencies)[number];
type Grade = (typeof grades)[number];
type Weekday = (typeof weekdayOptions)[number];

export function CreateClassScreen() {
  const navigation = useNavigation<Nav>();
  const { authSession } = useAuth();
  const { refreshClasses } = useClasses();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState<Weekday>('Sunday');
  const [time, setTime] = useState('10:00 AM');
  const [frequency, setFrequency] = useState<Frequency>('Weekly');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState<Grade>('Grade 1');
  const [curriculumLesson, setCurriculumLesson] = useState('');
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableLessons = useMemo(() => getCurriculumLessonsByGrade(grade), [grade]);

  const canSubmit = useMemo(
    () => Boolean(title.trim() && time.trim() && sessionDate.trim() && authSession?.token),
    [authSession?.token, sessionDate, time, title],
  );

  const onSubmit = async () => {
    if (!authSession?.token || !authSession.user.id || !authSession.community?.id) {
      setError('You need a full signed-in session with a community to create a class.');
      setSuccess(undefined);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedTime = time.trim();
    const trimmedSessionDate = sessionDate.trim();
    const trimmedCurriculumLesson = curriculumLesson.trim();

    if (!trimmedTitle) {
      setError('Add a class title.');
      setSuccess(undefined);
      return;
    }

    if (!trimmedTime) {
      setError('Add a class time.');
      setSuccess(undefined);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedSessionDate)) {
      setError('First session date should use YYYY-MM-DD.');
      setSuccess(undefined);
      return;
    }

    const parsedDate = new Date(`${trimmedSessionDate}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== trimmedSessionDate) {
      setError('First session date must be a real calendar date.');
      setSuccess(undefined);
      return;
    }

    if (trimmedCurriculumLesson && !availableLessons.some(item => item.id === trimmedCurriculumLesson)) {
      setError('Choose a lesson from the available options for this grade, or leave it blank.');
      setSuccess(undefined);
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      await createChildrenClass({
        token: authSession.token,
        createdBy: authSession.user.id,
        community: authSession.community.id,
        title: trimmedTitle,
        description: description.trim() || undefined,
        day,
        time: trimmedTime,
        frequency,
        sessionDate: trimmedSessionDate,
        grade,
        curriculumLesson: trimmedCurriculumLesson || undefined,
      });
      await refreshClasses();
      setSuccess('Class created successfully.');
      setTimeout(() => navigation.goBack(), 700);
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
        <Text style={styles.subtitle}>Set up a new class in your community and seed the first session.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Class basics</Text>

          <Text style={styles.label}>Class title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Radiant Hearts"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Optional notes about the class"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.sectionHeading}>Schedule</Text>

          <Text style={styles.label}>Day</Text>
          <View style={styles.choiceRow}>
            {weekdayOptions.map(item => (
              <Pressable key={item} style={[styles.choiceChip, item === day && styles.choiceChipActive]} onPress={() => setDay(item)}>
                <Text style={[styles.choiceText, item === day && styles.choiceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="10:00 AM"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.choiceRow}>
            {frequencies.map(item => (
              <Pressable key={item} style={[styles.choiceChip, item === frequency && styles.choiceChipActive]} onPress={() => setFrequency(item)}>
                <Text style={[styles.choiceText, item === frequency && styles.choiceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>First session date *</Text>
          <TextInput
            style={styles.input}
            value={sessionDate}
            onChangeText={setSessionDate}
            placeholder="2026-03-15"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.helpText}>Use YYYY-MM-DD.</Text>

          <Text style={styles.sectionHeading}>Curriculum</Text>

          <Text style={styles.label}>Grade</Text>
          <View style={styles.choiceRow}>
            {grades.map(item => (
              <Pressable
                key={item}
                style={[styles.choiceChip, item === grade && styles.choiceChipActive]}
                onPress={() => {
                  setGrade(item);
                  setCurriculumLesson('');
                }}>
                <Text style={[styles.choiceText, item === grade && styles.choiceTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Curriculum lesson</Text>
          <Text style={styles.helpText}>Optional. Pick one of the imported lessons for this grade.</Text>
          <View style={styles.choiceRow}>
            <Pressable
              style={[styles.choiceChip, !curriculumLesson && styles.choiceChipActive]}
              onPress={() => setCurriculumLesson('')}>
              <Text style={[styles.choiceText, !curriculumLesson && styles.choiceTextActive]}>No lesson yet</Text>
            </Pressable>
            {availableLessons.map(item => (
              <Pressable
                key={item.id}
                style={[styles.choiceChip, curriculumLesson === item.id && styles.choiceChipActive]}
                onPress={() => setCurriculumLesson(item.id)}>
                <Text style={[styles.choiceText, curriculumLesson === item.id && styles.choiceTextActive]}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
          {curriculumLesson ? (
            <Text style={styles.selectedLessonText}>
              Selected: {availableLessons.find(item => item.id === curriculumLesson)?.subtitle ?? curriculumLesson}
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Pressable
            style={[styles.button, (!canSubmit || isSubmitting) && styles.buttonDisabled]}
            disabled={!canSubmit || isSubmitting}
            onPress={onSubmit}>
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
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  label: { color: colors.textSoft, marginBottom: 6, marginTop: 10 },
  helpText: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    color: colors.textOnWhite,
  },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    backgroundColor: colors.white,
  },
  choiceChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.textOnWhite, fontWeight: '600' },
  choiceTextActive: { color: colors.white },
  selectedLessonText: {
    color: colors.textSubtle,
    marginTop: 8,
    lineHeight: 18,
  },
  error: { color: colors.danger, marginTop: 12 },
  success: { color: colors.success, marginTop: 12, fontWeight: '700' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: '700' },
});
