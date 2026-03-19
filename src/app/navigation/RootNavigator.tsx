import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../shared/theme/colors';
import {
  LessonsStackParamList,
  RootStackParamList,
  RuhiStackParamList,
  StudentsStackParamList,
  TabParamList,
} from './types';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { CommunityScreen } from '../../features/community/screens/CommunityScreen';
import { StudentListScreen } from '../../features/students/screens/StudentListScreen';
import { StudentDetailScreen } from '../../features/students/screens/StudentDetailScreen';
import { LessonEditorScreen } from '../../features/lessons/screens/LessonEditorScreen';
import { GradesScreen } from '../../features/lessons/screens/GradesScreen';
import { LessonSetsScreen } from '../../features/lessons/screens/LessonSetsScreen';
import { LessonListScreen } from '../../features/lessons/screens/LessonListScreen';
import { LessonDetailScreen } from '../../features/lessons/screens/LessonDetailScreen';
import { InClassModeScreen } from '../../features/classMode/screens/InClassModeScreen';
import { RuhiBookListScreen } from '../../features/ruhi/screens/RuhiBookListScreen';
import { RuhiSectionScreen } from '../../features/ruhi/screens/RuhiSectionScreen';
import { RuhiJournalScreen } from '../../features/ruhi/screens/RuhiJournalScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { CreateClassScreen } from '../../features/community/screens/CreateClassScreen';
import { ClassSessionsScreen } from '../../features/classMode/screens/ClassSessionsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const StudentsStack = createNativeStackNavigator<StudentsStackParamList>();
const LessonsStack = createNativeStackNavigator<LessonsStackParamList>();
const RuhiStack = createNativeStackNavigator<RuhiStackParamList>();

function StudentsNavigator() {
  return (
    <StudentsStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
      }}
    >
      <StudentsStack.Screen name="StudentList" component={StudentListScreen} options={{ title: 'Students' }} />
      <StudentsStack.Screen name="StudentDetail" component={StudentDetailScreen} options={{ title: 'Student' }} />
    </StudentsStack.Navigator>
  );
}

function LessonsNavigator() {
  return (
    <LessonsStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
      }}
    >
      <LessonsStack.Screen name="Grades" component={GradesScreen} options={{ title: 'Grades' }} />
      <LessonsStack.Screen name="LessonSets" component={LessonSetsScreen} options={{ title: 'Sets' }} />
      <LessonsStack.Screen name="LessonList" component={LessonListScreen} options={{ title: 'Lesson Plans' }} />
      <LessonsStack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ title: 'Lesson Detail' }} />
    </LessonsStack.Navigator>
  );
}

function RuhiNavigator() {
  return (
    <RuhiStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
      }}
    >
      <RuhiStack.Screen name="RuhiBookList" component={RuhiBookListScreen} options={{ title: 'Ruhi' }} />
      <RuhiStack.Screen name="RuhiSection" component={RuhiSectionScreen} options={{ title: 'Section' }} />
      <RuhiStack.Screen name="RuhiJournal" component={RuhiJournalScreen} options={{ title: 'Journal' }} />
    </RuhiStack.Navigator>
  );
}

function TabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Community':
              iconName = focused ? 'people-circle' : 'people-circle-outline';
              break;
            case 'StudentsStack':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            case 'LessonsStack':
              iconName = focused ? 'reader' : 'reader-outline';
              break;
            case 'RuhiStack':
              iconName = focused ? 'sparkles' : 'sparkles-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = focused ? 'ellipse' : 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="StudentsStack" component={StudentsNavigator} options={{ title: 'Students', headerShown: false }} />
      <Tab.Screen name="LessonsStack" component={LessonsNavigator} options={{ title: 'Lessons', headerShown: false }} />
      <Tab.Screen name="RuhiStack" component={RuhiNavigator} options={{ title: 'Ruhi', headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    >
      <RootStack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <RootStack.Screen name="LessonEditor" component={LessonEditorScreen} options={{ presentation: 'modal', title: 'Lesson' }} />
      <RootStack.Screen name="CreateClass" component={CreateClassScreen} options={{ presentation: 'modal', headerShown: true, title: 'Create Class' }} />
      <RootStack.Screen name="ClassSessions" component={ClassSessionsScreen} options={{ title: 'Class Sessions' }} />
      <RootStack.Screen name="InClassMode" component={InClassModeScreen} options={{ title: 'In-Class Mode' }} />
    </RootStack.Navigator>
  );
}
