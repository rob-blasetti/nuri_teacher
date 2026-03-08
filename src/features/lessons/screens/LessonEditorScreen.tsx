import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { createLesson, getLessonById } from '../../../data/repositories/lessonRepository';
import { listClasses } from '../../../data/repositories/classRepository';
import { ClassEntity } from '../../../types/entities';
import { ClassPicker } from '../../../shared/components/ClassPicker';

type RouteT = RouteProp<RootStackParamList, 'LessonEditor'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LessonEditorScreen() {
  const route = useRoute<RouteT>();
  const navigation = useNavigation<Nav>();

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('class-junior-a');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classes, setClasses] = useState<ClassEntity[]>([]);

  useEffect(() => {
    listClasses().then(rows => {
      setClasses(rows);
      if (!route.params?.lessonId && rows[0]) {
        setClassId(rows[0].id);
      }
    });

    if (!route.params?.lessonId) {
      return;
    }

    getLessonById(route.params.lessonId).then(lesson => {
      if (!lesson) {
        return;
      }
      setTitle(lesson.title);
      setClassId(lesson.classId);
      setDate(lesson.date);
    });
  }, [route.params?.lessonId]);

  const onSave = async () => {
    if (!title.trim()) return;
    await createLesson({
      id: route.params?.lessonId ?? `lesson-${Date.now()}`,
      title: title.trim(),
      classId: classId.trim() || 'class-junior-a',
      date,
      blocks: [
        { type: 'opening', title: 'Opening Prayer', minutes: 5 },
        { type: 'memorization', title: 'Quote Practice', minutes: 15 },
      ],
      checklist: ['Prepare quote cards', 'Review student notes'],
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params?.lessonId ? 'Edit Lesson' : 'New Lesson'}</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Lesson title" />

      <Text style={styles.label}>Class</Text>
      <ClassPicker classes={classes} value={classId} onChange={setClassId} />

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-03-05" />

      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save Lesson</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  label: { color: '#334155', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    color: '#0F172A',
  },
  saveBtn: { marginTop: 16, backgroundColor: '#2563EB', borderRadius: 10, padding: 12, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: '600' },
});
