import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
  Vibration
} from 'react-native';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// --- SCREENS ---
import CalibrationScreen from './src/screens/CalibrationScreen';
import CrimeMapScreen from './src/screens/CrimeMapScreen';
import MJSafeScreen from './src/screens/MJSafeScreen';
import SuitManagerScreen from './src/screens/SuitManagerScreen';
import MissionLogScreen from './src/screens/MissionLogScreen';
import FitnessScreen from './src/screens/FitnessScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// --- COLORS & CONSTANTS ---
const THEME = {
  active: '#ff3333',     
  inactive: '#6b7280',   
  bg: 'rgba(4, 19, 47, 0.96)', 
  glow: '#681212',       
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};


const MARGIN_H = 20;
const TAB_BAR_WIDTH = width - (MARGIN_H * 2);
const TAB_WIDTH = TAB_BAR_WIDTH / 6; 

// --- CUSTOM TAB BAR COMPONENT ---
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      damping: 15,
      mass: 1,
      stiffness: 120,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom + 10 }]}>
      
      {/* 1. ФОН И СТЕКЛО */}
      <View style={styles.glassBackground} />

      {/* 2. СКОЛЬЗЯЩИЙ "ПРОЖЕКТОР" (ACTIVE INDICATOR) */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.activeGlow} />
      </Animated.View>

      {/* 3. ИКОНКИ */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Vibration.vibrate(10); 
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton 
              key={route.key}
              onPress={onPress}
              isFocused={isFocused}
              label={label}
              iconName={options.tabBarIconName}
            />
          );
        })}
      </View>
    </View>
  );
};

// --- INDIVIDUAL TAB BUTTON ---
const TabButton = ({ onPress, isFocused, label, iconName }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4] 
  });

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1] 
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabButton}
    >
      <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
        <Ionicons 
          name={isFocused ? iconName : `${iconName}-outline`} 
          size={24} 
          color={isFocused ? '#ffffff' : THEME.inactive} 
        />
      </Animated.View>
      
      {/* Анимация прозрачности текста */}
      <Animated.View style={{ opacity: animValue }}>
        <Text style={styles.tabLabel}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground
          source={require('./assets/web_bg.png')}
          style={{ flex: 1, backgroundColor: '#050b14' }}
          imageStyle={{ opacity: 0.3 }}
        >
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: { ...DefaultTheme.colors, background: 'transparent' },
            }}
          >
            <Tab.Navigator
              tabBar={props => <CustomTabBar {...props} />}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Tab.Screen
                name="Calibration"
                component={CalibrationScreen}
                options={{
                  tabBarLabel: 'Паутина',
                  tabBarIconName: 'flask',
                }}
              />
              <Tab.Screen
                name="Map"
                component={CrimeMapScreen}
                options={{
                  tabBarLabel: 'Карта',
                  tabBarIconName: 'map',
                }}
              />
              <Tab.Screen
                name="MJ"
                component={MJSafeScreen}
                options={{
                  tabBarLabel: 'MJ',
                  tabBarIconName: 'heart',
                }}
              />
              <Tab.Screen
                name="Suits"
                component={SuitManagerScreen}
                options={{
                  tabBarLabel: 'Костюмы',
                  tabBarIconName: 'shirt',
                }}
              />
              <Tab.Screen
                name="Missions"
                component={MissionLogScreen}
                options={{
                  tabBarLabel: 'Миссии',
                  tabBarIconName: 'list',
                }}
              />
              <Tab.Screen
                name="Fitness"
                component={FitnessScreen}
                options={{
                  tabBarLabel: 'Тренинг',
                  tabBarIconName: 'fitness',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </ImageBackground>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Контейнер всего меню
  tabBarContainer: {
    position: 'absolute',
    left: MARGIN_H,
    right: MARGIN_H,
    height: 75,
    borderRadius: 35, 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  // Фон меню (стекло)
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.bg,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    overflow: 'hidden',
  },

  // Строка с табами
  tabsRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },

  // Кнопка
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Скользящий индикатор (Красный неон)
  activeIndicator: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1, 
  },
  
  activeGlow: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: THEME.glow, 
    shadowColor: THEME.active,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    borderWidth: 30,
    borderColor: 'rgba(255, 51, 51, 0.3)',
  },
});
