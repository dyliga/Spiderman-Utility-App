// src/screens/MissionLogScreen.js
// RUSSIAN TACTICAL EDITION // OPS CENTER & NEWS FEED
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SW, height: SH } = Dimensions.get('window');

// --- КОНСТАНТЫ СТИЛЯ ---
const COLORS = {
  accentDark: '#681212',
  accentLight: '#ff3333',
  bugleRed: '#e63946', // Специальный красный для Daily Bugle
  blockBg: 'rgba(15, 35, 90, 0.94)',
  bg: '#020510',
  textMain: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.5)',
  grid: 'rgba(255, 255, 255, 0.05)',
  hudLine: 'rgba(148, 163, 248, 0.4)',
};

// --- ДАННЫЕ ---
const TASKS = [
  { id: 1, text: 'ПЕРЕХВАТ: Карманник на Манхэттене', type: 'CRIME' },
  { id: 2, text: 'ЛИЧНОЕ: Навестить тётю Мэй', type: 'STORY' },
  { id: 3, text: 'OSCORP: Анализ токсинов (Сектор 4)', type: 'SIDE' },
  { id: 4, text: 'УЧЕБА: Извиниться за прогул', type: 'STORY' },
  { id: 5, text: 'КРАФТ: Починить веб-шутер', type: 'TECH' },
  { id: 6, text: 'ДЕМОНЫ: Сканирование крыш', type: 'CRIME' },
  { id: 7, text: 'ИНФО: Проверить слухи о Кингпине', type: 'SIDE' },
  { id: 8, text: 'НАУКА: Лаборатория Октавиуса', type: 'STORY' },
];

const NEWS_ITEMS = [
  "BREAKING: Странные всплески энергии над Oscorp Tower...",
  "DAILY BUGLE: Кто этот 'Паук' — герой или угроза? Читайте эксклюзив Дж. Дж. Джеймсона!",
  "ПОЛИЦИЯ: Разыскивается Шокер. Особая осторожность.",
  "TEK-NEWS: Акции Stark Industries выросли на 4% после анонса нано-технологий...",
  "ПОГОДА: Ожидается кислотный дождь в районе Адской Кухни."
];

// --- КОМПОНЕНТЫ ---

// 1. Бегущая строка новостей
const NewsTicker = () => {
  const translateX = useRef(new Animated.Value(SW)).current;
  // Склеиваем новости в одну длинную строку
  const fullText = NEWS_ITEMS.join("  ///  ") + "  ///  ";

  useEffect(() => {
    const duration = 15000; // Скорость бегущей строки
    const animate = () => {
      translateX.setValue(SW);
      Animated.timing(translateX, {
        toValue: -SW * 3, // Уводим далеко влево
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate());
    };
    animate();
  }, []);

  return (
    <View style={styles.tickerContainer}>
      <View style={styles.tickerLabelBox}>
        <Text style={styles.tickerLabel}>LIVE FEED</Text>
      </View>
      <View style={styles.tickerTrack}>
        <Animated.Text 
          style={[styles.tickerText, { transform: [{ translateX }] }]}
          numberOfLines={1}
        >
          {fullText}
        </Animated.Text>
      </View>
    </View>
  );
};

// 2. Индикатор заряда костюма (Сегментированный бар)
const PowerCore = ({ percent }) => {
  // Создаем 20 сегментов
  const segments = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <View style={styles.powerBlock}>
      <View style={styles.powerHeader}>
         <Text style={styles.powerTitle}>ЗАРЯД КОСТЮМА</Text>
         <Text style={styles.powerValue}>{percent}%</Text>
      </View>
      <View style={styles.powerBarRow}>
        {segments.map((i) => {
          const isActive = (i / 20) * 100 < percent;
          return (
            <View 
              key={i} 
              style={[
                styles.powerSegment, 
                isActive ? styles.powerSegmentActive : styles.powerSegmentDim
              ]} 
            />
          );
        })}
      </View>
      <Text style={styles.powerStatus}>
        {percent === 100 ? '>> ПЕРЕГРУЗКА ДОСТУПНА <<' : 'СИСТЕМЫ НОРМА'}
      </Text>
    </View>
  );
};

// 3. Строка задания
const MissionRow = ({ item, isDone, onToggle, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100, // Каскадное появление
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.taskRowContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={[styles.taskRow, isDone && styles.taskRowDone]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {/* Чекбокс */}
        <View style={[styles.checkbox, isDone && styles.checkboxActive]}>
          {isDone && <View style={styles.checkboxInner} />}
        </View>
        
        {/* Текст */}
        <View style={styles.taskContent}>
           <View style={styles.taskMetaRow}>
              <Text style={styles.taskType}>{item.type}</Text>
              <Text style={styles.taskId}>ID: 00{item.id}</Text>
           </View>
           <Text style={[styles.taskText, isDone && styles.taskTextDone]}>
             {item.text}
           </Text>
        </View>

        {/* Декор сбоку */}
        <View style={styles.taskDecoLine} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MissionLogScreen() {
  const [doneIds, setDoneIds] = useState([]);

  const toggleTask = (id) => {
    if (doneIds.includes(id)) {
      setDoneIds(doneIds.filter(i => i !== id));
    } else {
      setDoneIds([...doneIds, id]);
    }
  };

  const progress = Math.round((doneIds.length / TASKS.length) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ФОНОВАЯ СЕТКА */}
      <View style={styles.bgGrid} pointerEvents="none">
         <View style={styles.gridVertical} />
         <View style={styles.gridHorizontal} />
         <View style={[styles.gridVertical, { left: SW * 0.9 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* 1. ШАПКА: DAILY BUGLE STYLE */}
        <View style={styles.header}>
           <View style={styles.logoBlock}>
              <View style={styles.logoBox}>
                 <Text style={styles.logoText}>DB</Text>
              </View>
              <View>
                 <Text style={styles.headerTitle}>THE DAILY BUGLE</Text>
                 <Text style={styles.headerSub}>NEWS FEED & OPS TERMINAL</Text>
              </View>
           </View>
           <View style={styles.divider} />
        </View>

        {/* 2. БЕГУЩАЯ СТРОКА */}
        <NewsTicker />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 3. БЛОК ЗАРЯДА (POWER CORE) */}
          <PowerCore percent={progress} />

          {/* 4. СПИСОК МИССИЙ */}
          <View style={styles.missionSection}>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>АКТИВНЫЕ ЗАДАЧИ</Text>
               <View style={styles.decoSquare} />
            </View>
            
            {TASKS.map((task, index) => (
              <MissionRow 
                key={task.id} 
                item={task} 
                index={index}
                isDone={doneIds.includes(task.id)} 
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </View>
          
          {/* Заглушка снизу */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // --- ДЕКОР ФОНА ---
  bgGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  gridVertical: {
    position: 'absolute', left: SW * 0.1, width: 1, height: '100%', backgroundColor: COLORS.grid,
  },
  gridHorizontal: {
    position: 'absolute', top: SH * 0.3, width: '100%', height: 1, backgroundColor: COLORS.grid,
  },

  // --- ШАПКА ---
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logoBlock: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  logoBox: {
    width: 40, height: 40, backgroundColor: COLORS.bugleRed,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
    borderRadius: 4,
  },
  logoText: {
    color: '#fff', fontWeight: '900', fontSize: 20,
  },
  headerTitle: {
    color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase',
  },
  headerSub: {
    color: COLORS.textDim, fontSize: 10, letterSpacing: 2,
  },
  divider: {
    height: 2, backgroundColor: COLORS.accentDark, width: '100%',
  },

  // --- БЕГУЩАЯ СТРОКА ---
  tickerContainer: {
    flexDirection: 'row',
    height: 36,
    backgroundColor: '#000',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#333',
    alignItems: 'center',
    marginBottom: 20,
  },
  tickerLabelBox: {
    backgroundColor: COLORS.accentDark,
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
    zIndex: 10,
  },
  tickerLabel: {
    color: '#fff', fontSize: 10, fontWeight: 'bold',
  },
  tickerTrack: {
    flex: 1, overflow: 'hidden', justifyContent: 'center',
  },
  tickerText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    width: SW * 4, // Ширина для прокрутки
  },

  // --- СКРОЛЛ ---
  scrollContent: {
    paddingHorizontal: 16,
  },

  // --- БЛОК ЗАРЯДА ---
  powerBlock: {
    backgroundColor: COLORS.blockBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },
  powerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10,
  },
  powerTitle: {
    color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1,
  },
  powerValue: {
    color: COLORS.accentLight, fontSize: 24, fontWeight: '900',
  },
  powerBarRow: {
    flexDirection: 'row', justifyContent: 'space-between', height: 12, marginBottom: 10,
  },
  powerSegment: {
    width: (SW - 80) / 20, height: '100%', borderRadius: 2,
  },
  powerSegmentActive: {
    backgroundColor: COLORS.accentLight,
    shadowColor: COLORS.accentLight, shadowOpacity: 0.8, shadowRadius: 4,
  },
  powerSegmentDim: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  powerStatus: {
    color: COLORS.textDim, fontSize: 10, textAlign: 'right', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // --- СЕКЦИЯ МИССИЙ ---
  missionSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1,
  },
  decoSquare: {
    width: 8, height: 8, backgroundColor: COLORS.accentLight,
  },

  // --- СТРОКА ЗАДАЧИ ---
  taskRowContainer: {
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 35, 90, 0.4)', // Полупрозрачный синий
    borderRadius: 6,
    padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  taskRowDone: {
    backgroundColor: 'rgba(0,0,0,0.3)', // Затемняем выполненные
    borderColor: 'transparent',
  },
  
  // Чекбокс
  checkbox: {
    width: 24, height: 24,
    borderWidth: 2, borderColor: COLORS.textDim,
    marginRight: 16,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 4,
  },
  checkboxActive: {
    borderColor: COLORS.accentLight,
  },
  checkboxInner: {
    width: 14, height: 14, backgroundColor: COLORS.accentLight, borderRadius: 2,
  },

  // Контент задачи
  taskContent: {
    flex: 1,
  },
  taskMetaRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingRight: 10,
  },
  taskType: {
    color: COLORS.accentOrange, fontSize: 9, fontWeight: 'bold', color: '#ffaa00',
  },
  taskId: {
    color: COLORS.textDim, fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  taskText: {
    color: '#fff', fontSize: 14, fontWeight: '600',
  },
  taskTextDone: {
    color: COLORS.textDim, textDecorationLine: 'line-through',
  },

  // Декор линия справа
  taskDecoLine: {
    width: 3, height: '80%', backgroundColor: COLORS.accentDark, borderRadius: 2, marginLeft: 10,
  },
});