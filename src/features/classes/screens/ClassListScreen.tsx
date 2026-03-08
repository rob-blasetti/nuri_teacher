import React, { useCallback, useState } from 'react';
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
          placeholderTextColor="#64748B"
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
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardMeta: {
    marginTop: 2,
    color: '#475569',
  },
});
