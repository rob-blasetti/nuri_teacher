import React, { useCallback, useEffect, useState } from 'react';
import { colors } from '../../../shared/theme/colors';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { LibraryStackParamList } from '../../../app/navigation/types';
import { ContentItemEntity, ProgressStatus, StudentEntity } from '../../../types/entities';
import { getContentById } from '../../../data/repositories/contentRepository';
import { listStudents } from '../../../data/repositories/studentRepository';
import { listProgressByContent, upsertProgress } from '../../../data/repositories/progressRepository';
import { StatusPill } from '../../../shared/components/StatusPill';

type RouteT = RouteProp<LibraryStackParamList, 'ContentDetail'>;

type StudentRow = StudentEntity & {
  progressStatus: ProgressStatus;
  progressNote?: string;
};

const statuses: ProgressStatus[] = ['not_started', 'learning', 'partial', 'confident'];

export function ContentDetailScreen() {
  const route = useRoute<RouteT>();
  const [content, setContent] = useState<ContentItemEntity | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [note, setNote] = useState('');
  const [attentionOnly, setAttentionOnly] = useState(false);

  const load = useCallback(async () => {
    const [contentRow, allStudents, progressRows] = await Promise.all([
      getContentById(route.params.contentId),
      listStudents(),
      listProgressByContent(route.params.contentId),
    ]);

    setContent(contentRow);

    const progressMap = new Map(progressRows.map(row => [row.studentId, row]));
    const merged = allStudents.map(student => {
      const progress = progressMap.get(student.id);
      return {
        ...student,
        progressStatus: progress?.status ?? 'not_started',
        progressNote: progress?.note,
      };
    });

    setStudents(merged);
  }, [route.params.contentId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onSetStatus = async (studentId: string, status: ProgressStatus) => {
    await upsertProgress({
      studentId,
      contentItemId: route.params.contentId,
      status,
    });
    await load();
  };

  const onSaveNote = async () => {
    const trimmed = note.trim();
    if (!selectedStudentId || !trimmed) {
      return;
    }

    const existing = students.find(s => s.id === selectedStudentId);
    await upsertProgress({
      studentId: selectedStudentId,
      contentItemId: route.params.contentId,
      status: existing?.progressStatus ?? 'learning',
      note: trimmed,
    });
    setNote('');
    await load();
  };

  const visibleStudents = attentionOnly
    ? students.filter(s => s.progressStatus !== 'confident')
    : students;

  if (!content) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Content not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.meta}>{content.type.toUpperCase()} • {content.theme ?? 'General'}</Text>
      <Text style={styles.text}>{content.text}</Text>

      <Text style={styles.section}>Phrase breakdown</Text>
      {content.phrases.map((phrase, idx) => (
        <Text key={`${phrase}-${idx}`} style={styles.phrase}>{idx + 1}. {phrase}</Text>
      ))}

      <View style={styles.progressHeader}>
        <Text style={styles.section}>Progress tracker</Text>
        <Pressable
          style={[styles.attentionBtn, attentionOnly && styles.attentionBtnActive]}
          onPress={() => setAttentionOnly(v => !v)}>
          <Text style={[styles.attentionBtnText, attentionOnly && styles.attentionBtnTextActive]}>
            {attentionOnly ? 'Showing: Needs attention' : 'Filter: Needs attention'}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={visibleStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.studentMeta}>Current:</Text>
              <StatusPill status={item.progressStatus} />
            </View>
            <View style={styles.statusRow}>
              {statuses.map(status => {
                const active = item.progressStatus === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => onSetStatus(item.id, status)}
                    style={[styles.statusChip, active && styles.statusChipActive]}>
                    <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                      {status.replace('_', ' ')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {item.progressNote ? <Text style={styles.note}>Note: {item.progressNote}</Text> : null}
            <Pressable
              style={styles.noteButton}
              onPress={() => setSelectedStudentId(item.id)}>
              <Text style={styles.noteButtonText}>
                {selectedStudentId === item.id ? 'Selected for note' : 'Add/Edit note'}
              </Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.noteComposer}>
        <TextInput
          style={styles.noteInput}
          placeholder={selectedStudentId ? 'Write encouragement or observation' : 'Select a student first'}
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          editable={Boolean(selectedStudentId)}
        />
        <Pressable style={styles.saveButton} onPress={onSaveNote}>
          <Text style={styles.saveButtonText}>Save note</Text>
        </Pressable>
      </View>
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    marginBottom: 10,
  },
  text: {
    color: colors.surfaceSoft,
    lineHeight: 22,
  },
  section: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressHeader: {
    marginTop: 8,
    marginBottom: 6,
    gap: 8,
  },
  attentionBtn: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  attentionBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#DBEAFE',
  },
  attentionBtnText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  attentionBtnTextActive: {
    color: '#1D4ED8',
  },
  phrase: {
    color: colors.textSoft,
    marginBottom: 4,
  },
  list: {
    gap: 10,
    paddingBottom: 140,
  },
  studentCard: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.white,
  },
  studentName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentMeta: {
    color: colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.background,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    color: colors.textSoft,
    fontSize: 12,
  },
  statusChipTextActive: {
    color: colors.white,
  },
  note: {
    marginTop: 8,
    color: colors.textSoft,
    fontStyle: 'italic',
  },
  noteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  noteComposer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
