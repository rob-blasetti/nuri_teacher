import React, { useCallback, useState } from 'react';
import { colors } from '../../../shared/theme/colors';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClassesStackParamList } from '../../../app/navigation/types';
import { ClassEntity } from '../../../types/entities';
import { createClass, listClasses } from '../../../data/repositories/classRepository';

type NavProp = NativeStackNavigationProp<ClassesStackParamList, 'ClassList'>;

export function ClassListScreen() {
  const navigation = useNavigation<NavProp>();
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const rows = await listClasses();
    setClasses(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onAddClass = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const id = `class-${Date.now()}`;
    await createClass({
      id,
      name: trimmed,
      ageGroup: '8-10',
      schedule: 'Sunday 10:00',
      currentUnit: 'TBD',
      notes: '',
    });
    setName('');
    await load();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classes</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Add class name"
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={styles.button} onPress={onAddClass}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ClassDetail', { classId: item.id })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.ageGroup} • {item.schedule ?? 'No schedule'}
            </Text>
          </Pressable>
        )}
      />
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.surfaceBorderSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardMeta: {
    marginTop: 2,
    color: colors.textMuted,
  },
});
