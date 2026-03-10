import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LessonsStackParamList } from '../../../app/navigation/types';
import { getCurriculumLessonById, LessonSection } from '../data/lessonPlanContent';
import { colors } from '../../../shared/theme/colors';

type RouteT = RouteProp<LessonsStackParamList, 'LessonDetail'>;
type SectionTone = {
  icon: string;
  eyebrow: string;
  accent: string;
  soft: string;
  border: string;
};

export function LessonDetailScreen() {
  const route = useRoute<RouteT>();
  const lesson = getCurriculumLessonById(route.params.lessonId);

  if (!lesson) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Lesson not found</Text>
        <Text style={styles.emptyText}>Choose a lesson from the lesson plan list.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{[lesson.grade, lesson.set].filter(Boolean).join(' • ')}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.summary}>{lesson.subtitle}</Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaText}>{lesson.sections.length} sections</Text>
          </View>
          {lesson.lessonNumber ? (
            <View style={styles.heroMetaPill}>
              <Text style={styles.heroMetaText}>Lesson {lesson.lessonNumber}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {lesson.sections.map((section, index) => (
        <LessonSectionCard key={`${lesson.id}-${section.key}-${index}`} section={section} index={index + 1} />
      ))}
    </ScrollView>
  );
}

function LessonSectionCard({ section, index }: { section: LessonSection; index: number }) {
  const tone = getSectionTone(section.key);
  const quote = extractPrimaryQuote(section.body);
  const bodyWithoutQuote = quote ? removeQuoteFromBody(section.body, quote) : section.body;
  const formattedBody = formatSectionBody(bodyWithoutQuote, section.key);

  return (
    <View style={[styles.sectionCard, { borderColor: tone.border, backgroundColor: tone.soft }]}> 
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIconWrap, { backgroundColor: tone.accent }]}> 
          <Ionicons name={tone.icon as any} size={18} color={colors.white} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionEyebrow, { color: tone.accent }]}>
            {String(index).padStart(2, '0')} • {tone.eyebrow}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      </View>

      {quote ? (
        <View style={styles.quoteBlock}>
          <Text style={styles.quoteLabel}>Focus text</Text>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>
      ) : null}

      {formattedBody.map((block, blockIndex) => {
        if (block.type === 'heading') {
          return (
            <Text key={`${section.key}-heading-${blockIndex}`} style={styles.inlineHeading}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={`${section.key}-bullet-${blockIndex}`} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: tone.accent }]} />
              <Text style={[styles.sectionBody, section.key === 'songs' ? styles.songBody : null]}>{block.text}</Text>
            </View>
          );
        }

        return (
          <Text
            key={`${section.key}-paragraph-${blockIndex}`}
            style={[
              styles.sectionBody,
              section.key === 'songs' ? styles.songBody : null,
              section.key === 'story' ? styles.storyBody : null,
              section.key === 'activity' ? styles.activityBody : null,
            ]}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

function getSectionTone(key: string): SectionTone {
  switch (key) {
    case 'prayers':
      return {
        icon: 'sparkles-outline',
        eyebrow: 'Prayer',
        accent: colors.highlight,
        soft: colors.surfaceSoft,
        border: colors.cerulean300,
      };
    case 'songs':
      return {
        icon: 'musical-notes-outline',
        eyebrow: 'Song',
        accent: colors.accent,
        soft: '#34285d',
        border: colors.lilac500,
      };
    case 'memorization':
      return {
        icon: 'bookmark-outline',
        eyebrow: 'Memorization',
        accent: colors.warning,
        soft: '#3a2f18',
        border: colors.warning,
      };
    case 'story':
      return {
        icon: 'book-outline',
        eyebrow: 'Story',
        accent: colors.success,
        soft: '#1d3a34',
        border: colors.success,
      };
    case 'activity':
      return {
        icon: 'game-controller-outline',
        eyebrow: 'Activity',
        accent: colors.primary,
        soft: '#2a2859',
        border: colors.primary,
      };
    case 'art':
      return {
        icon: 'color-palette-outline',
        eyebrow: 'Art',
        accent: colors.magenta500,
        soft: '#40243b',
        border: colors.magenta500,
      };
    case 'closing':
      return {
        icon: 'moon-outline',
        eyebrow: 'Closing',
        accent: colors.textSubtle,
        soft: colors.surface,
        border: colors.surfaceBorderSoft,
      };
    default:
      return {
        icon: 'document-text-outline',
        eyebrow: 'Section',
        accent: colors.highlight,
        soft: colors.surfaceSoft,
        border: colors.surfaceBorder,
      };
  }
}

function extractPrimaryQuote(text: string): string | undefined {
  const quoteMatch = text.match(/[“"]([^”"]{20,280})[”"]/);
  return quoteMatch ? quoteMatch[1].trim() : undefined;
}

function removeQuoteFromBody(text: string, quote: string): string {
  return text.replace(`“${quote}”`, '').replace(`"${quote}"`, '').trim();
}

function formatSectionBody(text: string, sectionKey: string): Array<{ type: 'paragraph' | 'heading' | 'bullet'; text: string }> {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const blocks: Array<{ type: 'paragraph' | 'heading' | 'bullet'; text: string }> = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push({ type: 'paragraph', text: paragraphBuffer.join(sectionKey === 'songs' ? '\n' : ' ') });
    paragraphBuffer = [];
  };

  for (const line of lines) {
    const isNumbered = /^\d+\./.test(line);
    const looksLikeHeading =
      !isNumbered &&
      line.length < 36 &&
      /^[A-Z‘'“][A-Za-z‘'’" -]+$/.test(line) &&
      sectionKey !== 'songs';

    if (sectionKey === 'songs') {
      flushParagraph();
      blocks.push({ type: 'paragraph', text: line });
      continue;
    }

    if (looksLikeHeading) {
      flushParagraph();
      blocks.push({ type: 'heading', text: line });
      continue;
    }

    if (isNumbered) {
      flushParagraph();
      blocks.push({ type: 'bullet', text: line.replace(/^\d+\.\s*/, '') });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  hero: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 20,
  },
  eyebrow: {
    color: colors.highlight,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  summary: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  heroMetaPill: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  heroMetaText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  quoteBlock: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quoteLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  quoteText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
  },
  sectionBody: {
    color: colors.textSoft,
    lineHeight: 24,
    fontSize: 15,
    marginTop: 2,
  },
  songBody: {
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '500',
  },
  storyBody: {
    lineHeight: 26,
  },
  activityBody: {
    fontWeight: '500',
  },
  inlineHeading: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 9,
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
    fontSize: 22,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
