import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listClasses } from '../../../data/repositories/classRepository';
import { listStudents } from '../../../data/repositories/studentRepository';
import { getDb } from '../../../data/db/client';
import { colors } from '../../../shared/theme/colors';
import { useClasses } from '../../community/context/ClassesContext';
import { useAuth } from '../../auth/context/AuthContext';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { authSession } = useAuth();
  const { myClasses } = useClasses();
  const [nextClass, setNextClass] = useState<string>('No class set');
  const [studentCount, setStudentCount] = useState(0);
  const [needsReview, setNeedsReview] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});

  const communityName = useMemo(
    () => authSession?.community?.name ?? authSession?.user.community?.name ?? 'Community',
    [authSession?.community?.name, authSession?.user.community?.name],
  );

  const load = useCallback(async () => {
    const [classes, students] = await Promise.all([listClasses(), listStudents()]);
    setStudentCount(students.length);
    setNextClass(classes[0] ? `${classes[0].name} • ${classes[0].schedule ?? 'No schedule'}` : 'No class set');

    const db = await getDb();
    const [result] = await db.executeSql(
      "SELECT COUNT(*) as count FROM progress_records WHERE status != 'confident'",
    );
    setNeedsReview((result.rows.item(0).count as number) || 0);
  }, []);

  useEffect(() => {
    load();

    const unsubscribeFocus = navigation.addListener('focus', load);

    return () => {
      unsubscribeFocus();
    };
  }, [load, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{communityName}</Text>
      <Text style={styles.title}>Children&apos;s Classes</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Next class</Text>
        <Text style={styles.value}>{nextClass}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Students</Text>
          <Text style={styles.value}>{studentCount}</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Need review</Text>
          <Text style={styles.value}>{needsReview}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        <Text style={styles.sectionSubtitle}>Swipe through your classes.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}>
        {myClasses.length > 0 ? (
          myClasses.map(classItem => (
            <View key={classItem.id} style={styles.carouselCard}>
              {classItem.imageUrl && !failedImages[classItem.id] ? (
                <Image
                  source={{ uri: classItem.imageUrl }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                  onError={() => {
                    setFailedImages(current => ({ ...current, [classItem.id]: true }));
                  }}
                />
              ) : (
                <View style={styles.carouselImagePlaceholder}>
                  <Text style={styles.carouselImageText}>{classItem.activityType ?? classItem.name}</Text>
                </View>
              )}
              <View style={styles.carouselCardBody}>
                <Text style={styles.carouselTitle}>{classItem.name}</Text>
                <View style={styles.carouselFooter}>
                  <View style={styles.scheduleRow}>
                    <Ionicons name="time-outline" size={16} color={colors.highlight} />
                    <Text style={styles.scheduleText}>{classItem.schedule ?? 'Schedule coming soon'}</Text>
                  </View>
                  <Text style={styles.roleText}>
                    Facilitators: {classItem.facilitators.join(', ') || 'Unassigned'}
                  </Text>
                  <Text style={styles.nextSessionText}>Next Session: {getNextSessionLabel(classItem.schedule)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.carouselCard}>
            <View style={styles.carouselImagePlaceholder}>
              <Text style={styles.carouselImageText}>My Classes</Text>
            </View>
            <View style={styles.carouselCardBody}>
              <Text style={styles.carouselTitle}>No classes yet</Text>
              <View style={styles.carouselFooter}>
                <View style={styles.scheduleRow}>
                  <Ionicons name="time-outline" size={16} color={colors.highlight} />
                  <Text style={styles.scheduleText}>Schedule coming soon</Text>
                </View>
                <Text style={styles.nextSessionText}>Next Session: TBD</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getNextSessionLabel(schedule?: string): string {
  if (!schedule) {
    return 'TBD';
  }

  const weekdayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const weekdayKey = Object.keys(weekdayMap).find(day => schedule.toLowerCase().includes(day));
  if (!weekdayKey) {
    return 'TBD';
  }

  const targetDay = weekdayMap[weekdayKey];
  const now = new Date();
  const next = new Date(now);
  const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7;
  next.setDate(now.getDate() + daysUntil);

  return next.toLocaleDateString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  eyebrow: {
    color: colors.highlight,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  label: { color: colors.textOnWhite, opacity: 0.75, marginBottom: 6, fontWeight: '600' },
  value: { color: colors.textOnWhite, fontWeight: '700', fontSize: 16 },
  sectionHeader: { marginTop: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { color: colors.textMuted, marginTop: 4 },
  carouselContent: { paddingRight: 16, gap: 12 },
  carouselCard: {
    width: 220,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  carouselImagePlaceholder: {
    height: 120,
    backgroundColor: colors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carouselImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceSoft,
  },
  carouselImageText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  carouselCardBody: {
    padding: 16,
  },
  carouselTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  carouselFooter: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    gap: 10,
  },
  roleText: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 18,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  nextSessionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
