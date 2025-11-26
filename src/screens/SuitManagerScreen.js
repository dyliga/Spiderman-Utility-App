// src/screens/SuitManagerScreen.js
// RUSSIAN TACTICAL EDITION // COLORS: #681212 & DEEP BLUE
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  Dimensions,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// --- ТВОИ КОНСТАНТЫ ---
const COLORS = {
  accentDark: '#681212', // Темно-красный (для теней и подложек)
  accentLight: '#ff3333', // Ярко-красный (для текста и активных элементов, чтобы читалось)
  blockBg: 'rgba(15, 35, 90, 0.94)', // Твой синий фон блоков
  bg: '#020510', // Почти черный фон всего экрана
  textMain: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.6)',
  grid: 'rgba(255, 255, 255, 0.05)',
};

// --- ДАННЫЕ (НА РУССКОМ) ---
const SUITS = [
  { 
    id: 's1', 
    name: 'Advanced suit', 
    image: require('../../assets/advanced.png'), 
    stats: { armor: 70, mobility: 85, energy: 80, stealth: 50 },
    status: 'ГОТОВ К БОЮ',
    class: 'ШТУРМОВИК',
    weight: '80 КГ',
    desc: 'Универсальный костюм для боя. Баланс защиты и маневренности.'
  },
  { 
    id: 's2', 
    name: 'Hybrid suit', 
    image: require('../../assets/Hybrid.png'), 
    stats: { armor: 95, mobility: 40, energy: 65, stealth: 20 },
    status: 'РЕМОНТ',
    repairTime: '45:00',
    class: 'ТЯЖЕЛЫЙ',
    weight: '900 КГ',
    desc: 'Комбинированная броня с усиленной защитой, но ограниченной подвижностью.'
  },
  { 
    id: 's3', 
    name: 'Iron Spider Armor', 
    image: require('../../assets/Armor.png'), 
    stats: { armor: 50, mobility: 95, energy: 50, stealth: 75 },
    status: 'ГОТОВ К БОЮ',
    class: 'ЛЕГКИЙ',
    weight: '65 КГ',
    desc: 'Лёгкий высокотехнологичный костюм с усиленной мобильностью и дополнительными функциями.'
  },
  { 
    id: 's4', 
    name: 'Superior suit', 
    image: require('../../assets/Superior.png'), 
    stats: { armor: 90, mobility: 80, energy: 100, stealth: 60 },
    status: 'ГОТОВ К БОЮ',
    class: 'НАНО-ТЕХ',
    weight: '115 КГ',
    desc: 'Костюм с нанотехнологиями, дополнительными конечностями и автономной защитой.'
  },
  { 
    id: 's5', 
    name: 'Velocity suit', 
    image: require('../../assets/Velocity.png'), 
    stats: { armor: 55, mobility: 95, energy: 60, stealth: 100 },
    status: 'ОХЛАЖДЕНИЕ',
    repairTime: '05:30',
    class: 'РАЗВЕДКА',
    weight: '60 КГ',
    desc: 'Максимальная скорость и скрытность. Поглощение звука и света.'
  },
];


// --- КОМПОНЕНТЫ ---

// Полоска статистики
const StatRow = ({ label, value, delay = 0 }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    widthAnim.setValue(0);
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 1000,
      delay: delay,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) 
            }
          ]} 
        />
      </View>
    </View>
  );
};

// Сканер (Линия поверх костюма)
const Scanner = () => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SH * 0.25, SH * 0.25] 
  });

  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
      <View style={styles.scanGlow} />
    </Animated.View>
  );
};

export default function SuitManagerScreen() {
  const [selected, setSelected] = useState(SUITS[0]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onSelect = (item) => {
    if (item.id === selected.id) return;
    // Эффект переключения
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setSelected(item);
  };

  const renderItem = ({ item }) => {
    const isActive = selected.id === item.id;
    return (
      <TouchableOpacity 
        style={[
          styles.cardItem, 
          isActive && styles.cardActive
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.8}
      >
        <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
        {item.status !== 'ГОТОВ К БОЮ' && (
          <View style={styles.statusDot} />
        )}
      </TouchableOpacity>
    );
  };

  const isReady = selected.status === 'ГОТОВ К БОЮ';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ФОНОВАЯ СЕТКА */}
      <View style={styles.bgGrid} pointerEvents="none">
         <View style={styles.gridVertical} />
         <View style={styles.gridHorizontal} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* 1. ШАПКА (ОТСТУП УВЕЛИЧЕН) */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>СИСТЕМА УПРАВЛЕНИЯ ТАУ КИТА// v.2.0.25</Text>
          <Text style={styles.headerTitle}>АРСЕНАЛ</Text>
          <View style={styles.divider} />
        </View>

        {/* 2. ОСНОВНОЙ КОНТЕНТ (ЦЕНТР) */}
        <View style={styles.content}>
          
          {/* ЛЕВАЯ КОЛОНКА: ИНФО */}
          <Animated.View style={[styles.leftCol, { opacity: fadeAnim }]}>
            <View style={styles.infoBox}>
              <Text style={styles.classBadge}>{selected.class}</Text>
              <Text style={styles.suitName}>{selected.name}</Text>
              <Text style={styles.suitDesc}>{selected.desc}</Text>
              <Text style={styles.suitWeight}>ВЕС: {selected.weight}</Text>
            </View>

            <View style={styles.statsBlock}>
              <StatRow label="БРОНЯ" value={selected.stats.armor} delay={0} />
              <StatRow label="МОБИЛЬНОСТЬ" value={selected.stats.mobility} delay={100} />
              <StatRow label="ЭНЕРГИЯ" value={selected.stats.energy} delay={200} />
              <StatRow label="СТЕЛС" value={selected.stats.stealth} delay={300} />
            </View>

            {/* КНОПКА ДЕЙСТВИЯ */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.actionBtn, !isReady && styles.actionBtnDisabled]}
            >
              <Text style={styles.btnText}>
                {isReady ? 'ЭКИПИРОВАТЬ' : `РЕМОНТ ${selected.repairTime}`}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ПРАВАЯ КОЛОНКА: ВИЗУАЛ */}
          <View style={styles.rightCol}>
            <Animated.View style={[styles.suitWrapper, { opacity: fadeAnim }]}>
              <Image source={selected.image} style={styles.heroImage} resizeMode="contain" />
              <Scanner />
            </Animated.View>
            {/* Декоративный круг под ногами */}
            
          </View>

        </View>

        {/* 3. НИЖНИЙ СКРОЛЛ (ФУТЕР) */}
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>ВЫБОР КОСТЮМА</Text>
          <FlatList
            data={SUITS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  
  // --- ДЕКОР ---
  bgGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  gridVertical: {
    position: 'absolute',
    left: SW * 0.35,
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: COLORS.accentDark,
  },
  gridHorizontal: {
    position: 'absolute',
    top: SH * 0.2,
    left: 0, right: 0,
    height: 1,
    backgroundColor: COLORS.grid,
  },

  // --- ШАПКА ---
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 60, // Доп отступ
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerSub: {
    color: COLORS.accentLight,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    height: 2,
    width: 40,
    backgroundColor: COLORS.accentDark,
    marginTop: 10,
  },

  // --- КОНТЕНТ (Сплит экран) ---
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Левая часть
  leftCol: {
    width: '55%', // Чуть больше половины для текста
    paddingLeft: 24,
    paddingRight: 10,
    zIndex: 10,
  },
  infoBox: {
    marginBottom: 30,
  },
  classBadge: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suitName: {
    color: '#fff',
    fontSize: 26, // Крупно, но влазит
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 10,
    textShadowColor: COLORS.accentDark,
    textShadowRadius: 10,
  },
  suitDesc: {
    color: COLORS.textDim,
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 14,
  },
  suitWeight: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    opacity: 0.8,
  },

  // Статистика
  statsBlock: {
    marginBottom: 20,
    backgroundColor: COLORS.blockBg, // Твой синий фон
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statContainer: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    color: COLORS.accentLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.accentLight,
    borderRadius: 2,
    shadowColor: COLORS.accentLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  // Кнопка
  actionBtn: {
    backgroundColor: COLORS.accentDark,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accentLight,
  },
  actionBtnDisabled: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },

  // Правая часть (Картинка)
  rightCol: {
    width: '45%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  suitWrapper: {
    width: '140%', // Вылезаем за границы для эффекта
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  platform: {
    position: 'absolute',
    bottom: SH * 0.15,
    width: 150,
    height: 30,
    borderRadius: 100,
    backgroundColor: COLORS.accentDark,
    opacity: 0.3,
    transform: [{ scaleX: 1.5 }],
    zIndex: 1,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.accentLight,
  },
  scanGlow: {
    position: 'absolute',
    top: -20, left: 0, right: 0, height: 40,
    backgroundColor: COLORS.accentLight,
    opacity: 0.15,
  },

  // --- ФУТЕР (НИЖНИЙ СКРОЛЛ) ---
  footer: {
    height: 230, // Фиксированная высота
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)', // Легкое затемнение фона скролла
    borderTopWidth: 1,
    borderColor: COLORS.accentDark,
  },
  footerLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    marginLeft: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 25, // ВАЖНО: Отступ снизу для iPhone полоски
  },
  cardItem: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.blockBg, // Твой синий
    marginRight: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardActive: {
    borderColor: COLORS.accentLight, // Красная рамка при выборе
    borderWidth: 2,
    shadowColor: COLORS.accentDark,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    backgroundColor: '#0a1525',
  },
  cardImage: {
    width: 45,
    height: 55,
  },
  statusDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#ffaa00', // Желтый индикатор ремонта
  },
});