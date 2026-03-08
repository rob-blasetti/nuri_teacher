import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  ClassesStackParamList,
  LibraryStackParamList,
  RootStackParamList,
  RuhiStackParamList,
  StudentsStackParamList,
  TabParamList,
} from './types';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { ClassListScreen } from '../../features/classes/screens/ClassListScreen';
import { ClassDetailScreen } from '../../features/classes/screens/ClassDetailScreen';
import { AttendanceScreen } from '../../features/classes/screens/AttendanceScreen';
import { StudentListScreen } from '../../features/students/screens/StudentListScreen';
import { StudentDetailScreen } from '../../features/students/screens/StudentDetailScreen';
import { ContentListScreen } from '../../features/content/screens/ContentListScreen';
import { ContentDetailScreen } from '../../features/content/screens/ContentDetailScreen';
import { LessonEditorScreen } from '../../features/lessons/screens/LessonEditorScreen';
import { LessonListScreen } from '../../features/lessons/screens/LessonListScreen';
import { InClassModeScreen } from '../../features/classMode/screens/InClassModeScreen';
import { RuhiBookListScreen } from '../../features/ruhi/screens/RuhiBookListScreen';
import { RuhiSectionScreen } from '../../features/ruhi/screens/RuhiSectionScreen';
import { RuhiJournalScreen } from '../../features/ruhi/screens/RuhiJournalScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const ClassesStack = createNativeStackNavigator<ClassesStackParamList>();
const StudentsStack = createNativeStackNavigator<StudentsStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const RuhiStack = createNativeStackNavigator<RuhiStackParamList>();

function ClassesNavigator() {
  return (
    <ClassesStack.Navigator>
      <ClassesStack.Screen name="ClassList" component={ClassListScreen} options={{ title: 'Classes' }} />
      <ClassesStack.Screen name="ClassDetail" component={ClassDetailScreen} options={{ title: 'Class' }} />
      <ClassesStack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
    </ClassesStack.Navigator>
  );
}

function StudentsNavigator() {
  return (
    <StudentsStack.Navigator>
      <StudentsStack.Screen name="StudentList" component={StudentListScreen} options={{ title: 'Students' }} />
      <StudentsStack.Screen name="StudentDetail" component={StudentDetailScreen} options={{ title: 'Student' }} />
    </StudentsStack.Navigator>
  );
}

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen name="ContentList" component={ContentListScreen} options={{ title: 'Library' }} />
      <LibraryStack.Screen name="ContentDetail" component={ContentDetailScreen} options={{ title: 'Content' }} />
    </LibraryStack.Navigator>
  );
}

function RuhiNavigator() {
  return (
    <RuhiStack.Navigator>
      <RuhiStack.Screen name="RuhiBookList" component={RuhiBookListScreen} options={{ title: 'Ruhi' }} />
      <RuhiStack.Screen name="RuhiSection" component={RuhiSectionScreen} options={{ title: 'Section' }} />
      <RuhiStack.Screen name="RuhiJournal" component={RuhiJournalScreen} options={{ title: 'Journal' }} />
    </RuhiStack.Navigator>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="ClassesStack" component={ClassesNavigator} options={{ title: 'Classes', headerShown: false }} />
      <Tab.Screen name="StudentsStack" component={StudentsNavigator} options={{ title: 'Students', headerShown: false }} />
      <Tab.Screen name="LibraryStack" component={LibraryNavigator} options={{ title: 'Library', headerShown: false }} />
      <Tab.Screen name="RuhiStack" component={RuhiNavigator} options={{ title: 'Ruhi', headerShown: false }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <RootStack.Screen name="LessonList" component={LessonListScreen} options={{ title: 'Lesson Plans' }} />
      <RootStack.Screen name="LessonEditor" component={LessonEditorScreen} options={{ presentation: 'modal', title: 'Lesson' }} />
      <RootStack.Screen name="InClassMode" component={InClassModeScreen} options={{ title: 'In-Class Mode' }} />
    </RootStack.Navigator>
  );
}
