import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';

type RouteT = RouteProp<RootStackParamList, 'InClassMode'>;
type AttendanceState = 'present' | 'absent' | 'unmarked';
type RosterItem = {
  id: string;
  name: string;
  attendance: AttendanceState;
};

export function InClassModeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteT>();
  const { myClasses } = useClasses();
  const classItem = useMemo(
    () => myClasses.find(item => item.id === route.params.classId),
    [myClasses, route.params.classId],
  );
  const [sessionNote, setSessionNote] = useState('');
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<Record<string, AttendanceState>>({});
  const [isFinished, setIsFinished] = useState(false);

  const roster = useMemo<RosterItem[]>(() => {
    if (!classItem) {
      return [];
    }

    return classItem.participantIds.map((studentId, index) => ({
      id: studentId,
      name: classItem.participants[index] ?? 'Unnamed student',
      attendance: attendanceByStudentId[studentId] ?? 'unmarked',
    }));
  }, [attendanceByStudentId, classItem]);

  const presentCount = roster.filter(student => student.attendance === 'present').length;
  const absentCount = roster.filter(student => student.attendance === 'absent').length;
  const unmarkedCount = roster.filter(student => student.attendance === 'unmarked').length;

  const setAttendance = (studentId: string, attendance: AttendanceState) => {
    setAttendanceByStudentId(current => ({
      ...current,
      [studentId]: current[studentId] === attendance ? 'unmarked' : attendance,
    }));
  };

  const onFinishClass = () => {
    setIsFinished(true);
  };

  const onCloseSummary = () => {
    navigation.goBack();
  };

  if (!classItem) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Class not found</Text>
        <Text style={styles.emptyText}>Go back and launch In-Class Mode from one of your live classes.</Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.summaryHero}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <Text style={styles.summaryTitle}>Class finished</Text>
          <Text style={styles.summaryText}>{classItem.name} has been wrapped up for now. This summary is local-only for the moment.</Text>
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
            <Text style={styles.statLabel}>Unmarked</Text>
            <Text style={styles.statValue}>{unmarkedCount}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <Text style={styles.sectionSubtitle}>Here’s how the roster ended for this session.</Text>
          {roster.length > 0 ? (
            roster.map(student => (
              <View key={student.id} style={styles.summaryRow}>
                <Text style={styles.summaryStudentName}>{student.name}</Text>
                <Text style={styles.summaryStudentStatus}>{student.attendance}</Text>
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

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{classItem.currentUnit ?? 'Current unit coming soon'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{classItem.ageGroup ?? 'Children'}</Text>
          </View>
        </View>
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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Class Roster</Text>
        <Text style={styles.sectionSubtitle}>Tap Present or Absent for each student. Tap again to clear.</Text>

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

      <Pressable style={styles.finishButton} onPress={onFinishClass}>
        <Text style={styles.finishButtonText}>Finish Class</Text>
      </Pressable>
    </ScrollView>
  );
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 8,
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
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
});
