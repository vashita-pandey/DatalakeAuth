import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

// Scree
import BenchmarkScreen from './BenchmarkScreen';
import HomeScreen from './HomeScreen';
import AttendanceScreen from './AttendanceScreen';
import EmployeesScreen from './EmployeesScreen';
import SettingsScreen from './SettingsScreen';
import EnrollScreen from './EnrollScreen';
import AttendanceLogScreen from './AttendanceLogScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({icon, label, focused}: {icon: string; label: string; focused: boolean}) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
  </View>
);

const MainTabs = () => {
  const {t} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon icon="🏠" label={t('home')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon icon="📷" label={t('attendance')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon icon="👥" label={t('employees')} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon icon="⚙️" label={t('settings')} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Enroll" component={EnrollScreen} />
      <Stack.Screen name="AttendanceLog" component={AttendanceLogScreen} />
      <Stack.Screen name="Benchmark" component={BenchmarkScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D0D0D',
    borderTopColor: '#1A1A1A',
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
  },
  tabIcon: {alignItems: 'center', gap: 2},
  tabIconText: {fontSize: 22, opacity: 0.5},
  tabIconFocused: {opacity: 1},
  tabLabel: {fontSize: 10, color: '#555'},
  tabLabelFocused: {color: '#00E5FF'},
});

export default AppNavigator;