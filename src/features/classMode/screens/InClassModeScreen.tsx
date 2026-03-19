import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';
import { getCurriculumLessonById, getCurriculumLessonsByGrade } from '../../lessons/data/lessonPlanContent';
import { ClassSession } from '../../../data/repositories/attendanceRepository';
import {
  getClassSession,
  getClassSessions,
  getOrCreateTodayClassSession,
  getSessionAttendance,
  saveSessionAttendance,
  saveSessionNotes,
} from '../../../services/sessionService';

type RouteT = RouteProp<RootStackParamList, 'InClassMode'>;
type AttendanceState = 'present' | 'absent' | 'unmarked';
type ProgressState = 'learning' | 'partial' | 'confident' | 'needs-help';
type PersistedAttendanceState = 'present' | 'absent' | 'late';
type RosterItem = {
  id: string;
  name: string;
  attendance: AttendanceState;
  progress: ProgressState;
  note: string;
};

const progressOptions: ProgressState[] = ['learning', 'partial', 'confident', 'needs-help'];

export function InClassModeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteT>();
  const { myClasses } = useClasses();
  const classItem = useMemo(
    () => myClasses.find(item => item.id === route.params.classId),
    [myClasses, route.params.classId],
  );
  const [sessionId, setSessionId] = useState<string>();
  const [savedSessions, setSavedSessions] = useState<ClassSession[]>([]);
  const [sessionNote, setSessionNote] = useState('');
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, AttendanceState>>({});
  const [progressByStudentId, setProgressByStudentId] = useState<Record<string, ProgressState>>({});
  const [notesByStudentId, setNotesByStudentId] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>();
  const [loadError, setLoadError] = useState<string>();

  const lesson = useMemo(() => {
    if (route.params.lessonId) {
      return getCurriculumLessonById(route.params.lessonId);
    }

    if (!classItem) {
      return undefined;
    }

    const gradeKey = classItem.ageGroup?.toLowerCase().includes('2')
      ? 'Grade 2'
      : classItem.ageGroup?.toLowerCase().includes('preschool')
        ? 'Preschool'
        : 'Grade 1';

    return getCurriculumLessonsByGrade(gradeKey)[0];
  }, [classItem, route.params.lessonId]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!classItem) {
        setIsHydrating(false);
        return;
      }

      setIsHydrating(true);
      setLoadError(undefined);
      setStatusMessage(undefined);

      try {
        const activeSessionId = route.params.sessionId ?? await getOrCreateTodayClassSession(classItem.id);
        const sessions = await getClassSessions(classItem.id);

        if (cancelled) {
          return;
        }

        setSessionId(activeSessionId);
        setSavedSessions(sessions);

        const activeSession = sessions.find(session => session.id === activeSessionId) ?? await getClassSession(activeSessionId);
        setSessionNote(activeSession?.notes ?? '');

        await loadSessionAttendance(activeSessionId, cancelled);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unable to load this class session right now.';
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    }

    hydrateSession().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [classItem, route.params.sessionId]);

  const roster = useMemo<RosterItem[]>(() => {
    if (!classItem) {
      return [];
    }

    return classItem.participantIds.map((studentId, index) => ({
      id: studentId,
      name: classItem.participants[index] ?? 'Unnamed student',
      attendance: attendanceByStudentId[studentId] ?? 'unmarked',
      progress: progressByStudentId[studentId] ?? 'learning',
      note: notesByStudentId[studentId] ?? '',
    }));
  }, [attendanceByStudentId, classItem, notesByStudentId, progressByStudentId]);

  const presentCount = roster.filter(student => student.attendance === 'present').length;
  const absentCount = roster.filter(student => student.attendance === 'absent').length;

  const setAttendance = (studentId: string, attendance: AttendanceState) => {
    setAttendanceByStudentId(current => ({
      ...current,
      [studentId]: current[studentId] === attendance ? 'unmarked' : attendance,
    }));
  };

  const setProgress = (studentId: string, progress: ProgressState) => {
    setProgressByStudentId(current => ({
      ...current,
      [studentId]: current[studentId] === progress ? 'learning' : progress,
    }));
  };

  const setStudentNote = (studentId: string, note: string) => {
    setNotesByStudentId(current => ({
      ...current,
      [studentId]: note,
    }));
  };

  const onOpenSavedSession = async (savedSession: ClassSession) => {
    setStatusMessage(undefined);
    setLoadError(undefined);
    setIsHydrating(true);

    try {
      setSessionId(savedSession.id);
      setSessionNote(savedSession.notes ?? '');
      setIsFinished(false);
      await loadSessionAttendance(savedSession.id, false);
      setStatusMessage('Opened locally saved session summary.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reopen that saved session.';
      setLoadError(message);
    } finally {
      setIsHydrating(false);
    }
  };

  const onFinishClass = async () => {
    if (!sessionId) {
      setIsFinished(true);
      return;
    }

    setIsSaving(true);
    setLoadError(undefined);
    setStatusMessage(undefined);

    try {
      await saveSessionNotes({
        sessionId,
        notes: sessionNote,
      });

      for (const student of roster) {
        if (student.attendance === 'unmarked') {
          continue;
        }

        await saveSessionAttendance({
          sessionId,
          studentId: student.id,
          status: student.attendance as PersistedAttendanceState,
          note: buildPersistedStudentNote(student),
        });
      }

      if (classItem) {
        const sessions = await getClassSessions(classItem.id);
        setSavedSessions(sessions);
      }

      setStatusMessage('Saved locally.');
      setIsFinished(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save this class session right now.';
      setLoadError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const onCloseSummary = () => {
    navigation.goBack();
  };

  async function loadSessionAttendance(targetSessionId: string, cancelled: boolean) {
    const attendance = await getSessionAttendance(targetSessionId);
    if (cancelled) {
      return;
    }

    const attendanceMap: Record<string, AttendanceState> = {};
    const progressMap: Record<string, ProgressState> = {};
    const notesMap: Record<string, string> = {};

    attendance.forEach(item => {
      attendanceMap[item.studentId] = normalizeAttendance(item.status);
      if (item.note) {
        const parsed = parsePersistedStudentNote(item.note);
        progressMap[item.studentId] = parsed.progress;
        if (parsed.note) {
          notesMap[item.studentId] = parsed.note;
        }
      }
    });

    setAttendanceByStudentId(attendanceMap);
    setProgressByStudentId(progressMap);
    setNotesByStudentId(notesMap);
  }

  if (!classItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Class not found</Text>
        <Text style={styles.emptyText}>Go back and launch In-Class Mode from one of your live classes.</Text>
      </View>
    );
  }

  if (isHydrating) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.emptyTitle}>Loading class session...</Text>
        <Text style={styles.emptyText}>Pulling together the roster, recent session data, and local notes.</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Session unavailable</Text>
        <Text style={styles.errorText}>{loadError}</Text>
        <Pressable style={styles.retryButton} onPress={() => navigation.replace('InClassMode', route.params)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (isFinished) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.summaryHero}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <Text style={styles.summaryTitle}>Class finished</Text>
          <Text style={styles.summaryText}>{classItem.name} has been wrapped up and saved locally for now.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Present</Text>
            <Text style={styles.statValue}>{presentCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Absent</Text>
            <Text style={styles.statValue}>{absentCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saved Sessions</Text>
            <Text style={styles.statValue}>{savedSessions.length}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <Text style={styles.sectionSubtitle}>Here’s how the roster ended for this session.</Text>
          {roster.length > 0 ? (
            roster.map(student => (
              <View key={student.id} style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryStudentName}>{student.name}</Text>
                  <Text style={styles.summaryStudentStatus}>{student.attendance}</Text>
                </View>
                <Text style={styles.summaryProgress}>Progress: {student.progress}</Text>
                {student.note.trim() ? <Text style={styles.summaryNote}>Note: {student.note}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyRosterText}>No participants were available for this class.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Session Note</Text>
          <Text style={styles.sectionSubtitle}>{sessionNote.trim() || 'No session note was recorded.'}</Text>
        </View>

        <Pressable style={styles.finishButton} onPress={onCloseSummary}>
          <Text style={styles.finishButtonText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>In-Class Mode</Text>
        <Text style={styles.title}>{classItem.name}</Text>
        <Text style={styles.summary}>{classItem.schedule ?? 'Schedule coming soon'}</Text>
        {statusMessage ? <Text style={styles.statusPill}>{statusMessage}</Text> : null}

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{classItem.currentUnit ?? 'Current unit coming soon'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{classItem.ageGroup ?? 'Children'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>Saved sessions: {savedSessions.length}</Text>
          </View>
          <Pressable style={styles.historyButton} onPress={() => navigation.navigate('ClassSessions', { classId: classItem.id })}>
            <Text style={styles.historyButtonText}>View History</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <Text style={styles.sectionSubtitle}>Reopen a locally saved session summary for this class.</Text>
        {savedSessions.length > 0 ? (
          savedSessions.slice(0, 5).map(savedSession => (
            <Pressable key={savedSession.id} style={styles.savedSessionRow} onPress={() => onOpenSavedSession(savedSession).catch(() => undefined)}>
              <View style={styles.savedSessionCopy}>
                <Text style={styles.savedSessionTitle}>{savedSession.date}</Text>
                <Text style={styles.savedSessionSubtitle}>{savedSession.id === sessionId ? 'Currently open session' : 'Tap to reopen session summary'}</Text>
                {savedSession.notes?.trim() ? (
                  <Text style={styles.savedSessionNote} numberOfLines={2}>{savedSession.notes.trim()}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyRosterText}>No saved sessions yet for this class.</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Roster</Text>
          <Text style={styles.statValue}>{roster.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Present</Text>
          <Text style={styles.statValue}>{presentCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Absent</Text>
          <Text style={styles.statValue}>{absentCount}</Text>
        </View>
      </View>

      {lesson ? (
        <View style={styles.sectionCard}>
          <View style={styles.lessonHeaderRow}>
            <View style={styles.lessonHeaderCopy}>
              <Text style={styles.sectionTitle}>Current Lesson</Text>
              <Text style={styles.sectionSubtitle}>{lesson.title} • {lesson.subtitle}</Text>
            </View>
            <Pressable style={styles.lessonButton} onPress={() => navigation.navigate('Tabs', { screen: 'LessonsStack' } as any)}>
              <Text style={styles.lessonButtonText}>Open Lessons</Text>
            </Pressable>
          </View>

          <View style={styles.lessonPreviewCard}>
            <Text style={styles.lessonPreviewTitle}>{lesson.sections[0]?.title ?? 'Lesson overview'}</Text>
            <Text style={styles.lessonPreviewBody} numberOfLines={6}>
              {lesson.sections[0]?.body ?? 'Lesson preview coming soon.'}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Class Roster</Text>
        <Text style={styles.sectionSubtitle}>Mark attendance, capture quick progress, and jot short notes as you teach.</Text>

        {roster.length > 0 ? (
          roster.map(student => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentCopy}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentMeta}>ID: {student.id}</Text>
                </View>
                <View style={styles.attendanceRow}>
                  <Pressable
                    style={[
                      styles.attendanceButton,
                      student.attendance === 'present' ? styles.attendanceButtonPresent : null,
                    ]}
                    onPress={() => setAttendance(student.id, 'present')}>
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                    <Text style={styles.attendanceButtonText}>Present</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.attendanceButton,
                      student.attendance === 'absent' ? styles.attendanceButtonAbsent : null,
                    ]}
                    onPress={() => setAttendance(student.id, 'absent')}>
                    <Ionicons name="close" size={16} color={colors.white} />
                    <Text style={styles.attendanceButtonText}>Absent</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.progressRow}>
                {progressOptions.map(option => (
                  <Pressable
                    key={`${student.id}-${option}`}
                    style={[styles.progressChip, student.progress === option ? styles.progressChipActive : null]}
                    onPress={() => setProgress(student.id, option)}>
                    <Text style={[styles.progressChipText, student.progress === option ? styles.progressChipTextActive : null]}>
                      {formatProgressLabel(option)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.studentNoteInput}
                value={student.note}
                onChangeText={value => setStudentNote(student.id, value)}
                placeholder="Quick note for this student"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyRosterText}>No participants have been loaded for this class yet.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Session Note</Text>
        <Text style={styles.sectionSubtitle}>Keep a quick local note for this session while teaching.</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          value={sessionNote}
          onChangeText={setSessionNote}
          placeholder="How did the class go?"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Pressable style={[styles.finishButton, isSaving ? styles.finishButtonDisabled : null]} disabled={isSaving} onPress={() => onFinishClass().catch(() => undefined)}>
        {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.finishButtonText}>Finish Class</Text>}
      </Pressable>
    </ScrollView>
  );
}

function buildPersistedStudentNote(student: RosterItem): string | undefined {
  const pieces = [`progress:${student.progress}`];
  if (student.note.trim()) {
    pieces.push(student.note.trim());
  }
  return pieces.join(' | ');
}

function parsePersistedStudentNote(value: string): { progress: ProgressState; note?: string } {
  const [first, ...rest] = value.split(' | ');
  const progress = first?.startsWith('progress:') ? (first.replace('progress:', '') as ProgressState) : 'learning';
  const note = rest.join(' | ').trim() || undefined;
  return { progress, note };
}

function normalizeAttendance(value: PersistedAttendanceState): AttendanceState {
  if (value === 'late') {
    return 'present';
  }
  return value;
}

function formatProgressLabel(value: ProgressState): string {
  switch (value) {
    case 'needs-help':
      return 'Needs Help';
    case 'partial':
      return 'Partial';
    case 'confident':
      return 'Confident';
    default:
      return 'Learning';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  hero: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 18,
  },
  summaryHero: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
    color: colors.highlight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  summary: {
    color: colors.textMuted,
    marginTop: 8,
  },
  statusPill: {
    color: colors.white,
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  summaryText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  historyButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  historyButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  statLabel: {
    color: colors.textOnWhite,
    opacity: 0.7,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    color: colors.textOnWhite,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  savedSessionRow: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savedSessionCopy: {
    flex: 1,
    marginRight: 12,
  },
  savedSessionTitle: {
    color: colors.textOnWhite,
    fontWeight: '700',
  },
  savedSessionSubtitle: {
    color: colors.textSoft,
    marginTop: 4,
    fontSize: 12,
  },
  savedSessionNote: {
    color: colors.textOnWhite,
    marginTop: 8,
    lineHeight: 18,
    opacity: 0.75,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  lessonHeaderCopy: {
    flex: 1,
  },
  lessonButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lessonButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  lessonPreviewCard: {
    marginTop: 4,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
  },
  lessonPreviewTitle: {
    color: colors.textOnWhite,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  lessonPreviewBody: {
    color: colors.textOnWhite,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 20,
  },
  studentCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 10,
  },
  studentHeader: {
    gap: 12,
  },
  studentCopy: {
    gap: 4,
  },
  studentName: {
    color: colors.textOnWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  studentMeta: {
    color: colors.textSoft,
    fontSize: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flex: 1,
    backgroundColor: colors.surfaceBorderSoft,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  attendanceButtonPresent: {
    backgroundColor: colors.success,
  },
  attendanceButtonAbsent: {
    backgroundColor: colors.danger,
  },
  attendanceButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  progressChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  progressChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressChipText: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  progressChipTextActive: {
    color: colors.white,
  },
  studentNoteInput: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textOnWhite,
  },
  emptyRosterText: {
    color: colors.textMuted,
  },
  noteInput: {
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    color: colors.textOnWhite,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStudentName: {
    color: colors.textOnWhite,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  summaryStudentStatus: {
    color: colors.primaryStrong,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  summaryProgress: {
    color: colors.textOnWhite,
    marginTop: 8,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  summaryNote: {
    color: colors.textSoft,
    marginTop: 6,
    lineHeight: 20,
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.75,
  },
  finishButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
