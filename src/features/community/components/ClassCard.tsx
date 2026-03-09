import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { CommunityChildrenClass } from '../../../services/classesService';

type ClassCardProps = {
  classItem: CommunityChildrenClass;
};

export function ClassCard({ classItem }: ClassCardProps) {
  const {
    name,
    activityType,
    imageUrl,
    notes,
    ageGroup,
    schedule,
    frequency,
    currentUnit,
    facilitators,
    participants,
  } = classItem;

  return (
    <View style={styles.card}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}

      {activityType ? <Text style={styles.eyebrow}>{activityType}</Text> : null}
      <Text style={styles.title}>{name}</Text>

      {notes ? <Text style={styles.notes}>{notes}</Text> : null}

      <View style={styles.metaRow}>
        {schedule ? (
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{schedule}</Text>
          </View>
        ) : null}
        {frequency ? (
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{frequency}</Text>
          </View>
        ) : null}
        {ageGroup ? (
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{ageGroup}</Text>
          </View>
        ) : null}
      </View>

      {currentUnit ? (
        <View style={styles.section}>
          <Text style={styles.label}>Current Unit</Text>
          <Text style={styles.value}>{currentUnit}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Facilitators</Text>
        <Text style={styles.value}>
          {facilitators.length > 0 ? facilitators.join(', ') : 'No facilitators assigned yet'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Participants</Text>
        <Text style={styles.value}>
          {participants.length > 0 ? participants.join(', ') : 'No participants added yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: colors.surfaceSoft,
  },
  eyebrow: {
    color: colors.highlight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    color: colors.textOnWhite,
    fontSize: 20,
    fontWeight: '700',
  },
  notes: {
    color: colors.textOnWhite,
    lineHeight: 20,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  metaPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 10,
  },
  label: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    color: colors.textOnWhite,
    lineHeight: 22,
  },
});
