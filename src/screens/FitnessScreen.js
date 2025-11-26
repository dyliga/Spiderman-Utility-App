// src/screens/FitnessScreen.js
// RUSSIAN TACTICAL EDITION // BIOMETRICS & PERFORMANCE
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SW, height: SH } = Dimensions.get('window');

// --- КОНСТАНТЫ СТИЛЯ (ЕДИНЫЕ) ---
const COLORS = {
  accentDark: '#681212',
  accentLight: '#ff3333',
  blockBg: 'rgba(15, 35, 90, 0.94)', // Глубокий синий
  bg: '#020510', // Почти черный
  textMain: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.5)',
  grid: 'rgba(255, 255, 255, 0.05)',
  success: '#00ff9d', // Для статуса "ОК"
};

// --- ДАННЫЕ ---
const STATS = [
  { id: 'j1', label: 'ВЕРТИКАЛЬНЫЙ ПРЫЖОК', value: 87, max: 100, unit: 'М', code: 'JMP-V' },
  { id: 's1', label: 'СКОРОСТЬ ПОЛЕТА', value: 74, max: 90, unit: 'М/С', code: 'VEL-X' },
  { id: 'p1', label: 'СИЛА УДАРА', value: 92, max: 100, unit: 'КН', code: 'STR-F' },
  { id: 'r1', label: 'РЕГЕНЕРАЦИЯ', value: 68, max: 80, unit: '%/Ч', code: 'HLTH-R' },
];

// --- КОМПОНЕНТЫ ---

// 1. АНИМИРОВАННЫЙ БИО-РИТМ (Oscilloscope)
// Генерирует ряд столбцов, которые двигаются волной
const BioWave = () => {
  const bars = Array.from({ length: 20 }, (_, i) => i);
  const anims = useRef(bars.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const runAnimation = () => {
      const animations = bars.map((_, i) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anims[i], {
              toValue: 1,
              duration: 500,
              delay: i * 50, // Сдвиг фазы для эффекта волны
              useNativeDriver: true,
            }),
            Animated.timing(anims[i], {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
      });
      Animated.parallel(animations).start();
    };
    runAnimation();
  }, []);

  return (
    <View style={styles.waveContainer}>
      {bars.map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: 40, // Базовая высота
              transform: [{ scaleY: anims[i] }], // Анимация высоты
              opacity: anims[i], // Анимация прозрачности
            },
          ]}
        />
      ))}
    </View>
  );
};

// 2. БЛОК ПУЛЬСА (Меняется число)
const HeartRateMonitor = () => {
  const [bpm, setBpm] = useState(60);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Имитация живого пульса (случайные колебания 58-65)
      setBpm(Math.floor(Math.random() * (65 - 58 + 1)) + 58);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.bpmContainer}>
      <Ionicons name="heart" size={20} color={COLORS.accentLight} style={styles.heartIcon} />
      <View>
         <Text style={styles.bpmValue}>{bpm}</Text>
         <Text style={styles.bpmLabel}>BPM // RESTING</Text>
      </View>
    </View>
  );
};

// 3. СТАТИСТИЧЕСКАЯ СТРОКА (Segmented Bar)
const StatItem = ({ item, index }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: (item.value / item.max) * 100,
      duration: 1000,
      delay: index * 200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, []);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.statRow}>
      <View style={styles.statHeader}>
        <Text style={styles.statCode}>{item.code}</Text>
        <Text style={styles.statValue}>{item.value} <Text style={styles.statUnit}>{item.unit}</Text></Text>
      </View>
      <Text style={styles.statLabel}>{item.label}</Text>
      
      {/* Технический прогресс бар */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: widthInterpolated }]} />
        {/* Сетка поверх бара для эффекта сегментов */}
        <View style={styles.barGrid}>
           {[...Array(10)].map((_, i) => <View key={i} style={styles.barDivider} />)}
        </View>
      </View>
    </View>
  );
};

export default function FitnessScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ФОНОВАЯ СЕТКА */}
      <View style={styles.bgGrid} pointerEvents="none">
         <View style={styles.gridVertical} />
         <View style={styles.gridHorizontal} />
         <View style={[styles.gridHorizontal, { top: SH * 0.7 }]} />
         <ImageBackgroundDeco />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 1. ШАПКА */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerSub}>СИСТЕМА УПРАВЛЕНИЯ ТАУ КИТА// v.2.0.25</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>OPTIMAL</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>BIO-STATUS</Text>
            <View style={styles.divider} />
          </View>

          {/* 2. ГЛАВНЫЙ ВИЗУАЛИЗАТОР (ОСЦИЛЛОГРАФ) */}
          <View style={styles.monitorBlock}>
            <View style={styles.monitorHeader}>
               <Text style={styles.monitorTitle}>METABOLIC RATE ANALYZER</Text>
               <Ionicons name="pulse" size={18} color={COLORS.accentLight} />
            </View>
            
            {/* ГРАФИК ВОЛНЫ */}
            <BioWave />
            
            {/* ПУЛЬС + ИНФО */}
            <View style={styles.monitorFooter}>
               <HeartRateMonitor />
               <View style={styles.tempBlock}>
                  <Text style={styles.tempValue}>36.6°C</Text>
                  <Text style={styles.tempLabel}>CORE TEMP</Text>
               </View>
            </View>

            {/* Декор уголки */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>

          {/* 3. ДЕТАЛЬНАЯ СТАТИСТИКА */}
          <View style={styles.statsContainer}>
            {STATS.map((item, index) => (
              <StatItem key={item.id} item={item} index={index} />
            ))}
          </View>

          {/* 4. НИЖНИЙ БЛОК (Инфо о костюме) */}
          <View style={styles.suitInfo}>
            <View style={styles.suitRow}>
               <Text style={styles.suitLabel}>MUSCLE DENSITY</Text>
               <Text style={styles.suitVal}>ENHANCED (15x)</Text>
            </View>
            <View style={styles.suitRow}>
               <Text style={styles.suitLabel}>LACTIC ACID</Text>
               <Text style={styles.suitVal}>0.05% (LOW)</Text>
            </View>
             <View style={styles.suitRow}>
               <Text style={styles.suitLabel}>ADRENALINE</Text>
               <Text style={styles.suitVal}>NORMAL LEVELS</Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Простой компонент для фоновых линий
const ImageBackgroundDeco = () => (
  <View style={StyleSheet.absoluteFill}>
    {/* Диагональная линия */}
    <View style={{
      position: 'absolute', right: -50, top: 100, width: 200, height: 1, 
      backgroundColor: COLORS.accentDark, transform: [{ rotate: '45deg' }] 
    }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // --- ДЕКОР ФОНА ---
  bgGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  gridVertical: {
    position: 'absolute', left: SW * 0.15, width: 1, height: '100%', backgroundColor: COLORS.grid,
  },
  gridHorizontal: {
    position: 'absolute', top: SH * 0.25, width: '100%', height: 1, backgroundColor: COLORS.grid,
  },

  // --- ШАПКА ---
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  headerSub: { color: COLORS.textDim, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 255, 157, 0.1)', paddingHorizontal: 6, borderRadius: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success, marginRight: 6 },
  statusText: { color: COLORS.success, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  divider: { height: 2, width: 40, backgroundColor: COLORS.accentLight, marginTop: 8 },

  // --- МОНИТОР (OSCILLOSCOPE) ---
  monitorBlock: {
    marginHorizontal: 16,
    height: 220,
    backgroundColor: COLORS.blockBg,
    borderRadius: 2, // Квадратные углы для техничности
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
    padding: 16,
    position: 'relative',
    justifyContent: 'space-between',
  },
  monitorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monitorTitle: { color: COLORS.accentLight, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  
  // Волна
  waveContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 100,
  },
  waveBar: {
    width: (SW - 64) / 25,
    backgroundColor: COLORS.accentLight,
    borderRadius: 2,
  },

  // Футер монитора
  monitorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },
  bpmContainer: { flexDirection: 'row', alignItems: 'center' },
  heartIcon: { marginRight: 10 },
  bpmValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  bpmLabel: { color: COLORS.textDim, fontSize: 8, letterSpacing: 1 },
  
  tempBlock: { alignItems: 'flex-end' },
  tempValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tempLabel: { color: COLORS.textDim, fontSize: 8 },

  // Уголки
  corner: { position: 'absolute', width: 8, height: 8, borderColor: COLORS.accentLight },
  tl: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },

  // --- СТАТИСТИКА ---
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  statRow: { marginBottom: 24 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 2 },
  statCode: { color: COLORS.accentDark, fontSize: 10, fontWeight: '900' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statUnit: { fontSize: 12, color: COLORS.textDim, fontWeight: 'normal' },
  statLabel: { color: COLORS.textDim, fontSize: 12, marginBottom: 8 },
  
  barTrack: {
    height: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', position: 'relative',
  },
  barFill: {
    height: '100%', backgroundColor: COLORS.accentLight,
  },
  barGrid: {
    ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-between',
  },
  barDivider: {
    width: 2, height: '100%', backgroundColor: COLORS.bg, opacity: 0.5,
  },

  // --- ИНФО КОСТЮМА ---
  suitInfo: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderLeftWidth: 2, borderColor: COLORS.accentDark,
    padding: 16,
  },
  suitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  suitLabel: { color: COLORS.textDim, fontSize: 11 },
  suitVal: { color: '#fff', fontSize: 11, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

});