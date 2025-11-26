// src/screens/MJTacticalScreen.js
// RUSSIAN TACTICAL EDITION v3.0 // TARGET: MJ WATSON // MULTI-SPECTRUM MODE
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  SafeAreaView
} from 'react-native';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SW, height: SH } = Dimensions.get('window');

// =====================================================================
// 1. КОНФИГУРАЦИЯ (ЦВЕТА И РЕЖИМЫ)
// =====================================================================

// Наборы цветов для разных режимов зрения
const SPECTRA = {
  OPTICAL: {
    primary: '#ffffff',
    accent: '#ffffff', // Белый вместо голубого
    bg: '#020510',
    grid: 'rgba(255, 255, 255, 0.08)', // Запрошенный цвет для сетки/фона
    scanColor: '#ffffff',
    imageTint: undefined,
    blockBg: 'rgba(255, 255, 255, 0.08)' // Запрошенный цвет для фона модалки
  },
  THERMAL: {
    primary: '#ffaa00', // Оранжевый
    accent: '#ff3333', // Красный
    bg: '#1a0500', // Темно-красный фон
    grid: 'rgba(255, 51, 51, 0.15)',
    scanColor: '#ffaa00',
    imageTint: '#ff3333', // Красный тинт на фото
    blockBg: 'rgba(104, 18, 18, 0.6)'
  },
  NIGHT_OPS: {
    primary: '#00ff00', // Классический зеленый
    accent: '#ccffcc',
    bg: '#001a00',
    grid: 'rgba(0, 255, 0, 0.1)',
    scanColor: '#00ff00',
    imageTint: '#00ff00', // Зеленый тинт
    blockBg: 'rgba(0, 20, 0, 0.6)'
  }
};

const HEADER_CONFIG = {
  title: "TARGET: MJ WATSON",
  subtitle: "СИСТЕМА УПРАВЛЕНИЯ ТАУ КИТА// v.2.0.25",
  titleSize: 24,
  subtitleSize: 9,
  topPadding: Platform.OS === 'android' ? 40 : 40,
  horizontalPadding: 24,
  titleWeight: '900',
  letterSpacingTitle: 1,
  letterSpacingSub: 2,
};

const SYSTEM_LOGS = [
  "DECRYPTING BIO-METRICS...",
  "SPECTRAL ANALYSIS: ACTIVE",
  "GRID TRIANGULATION: 98%",
  "TARGET LOCK: CONFIRMED",
  "SATELLITE UPLINK: SECURE",
  "INTERCEPTING LOCAL COMMS...",
];

// =====================================================================
// 2. НОВЫЕ GEEK КОМПОНЕНТЫ
// =====================================================================

// ЭФФЕКТ "ЦИФРОВОГО ДОЖДЯ" (DATA STREAM)
const DataStreamColumn = ({ color, side }) => {
  const [chars, setChars] = useState([]);
  
  useEffect(() => {
    // Генерируем случайные символы
    const interval = setInterval(() => {
      const newChars = Array(12).fill(0).map(() => 
        Math.random() > 0.5 ? Math.floor(Math.random() * 9) : String.fromCharCode(65 + Math.floor(Math.random() * 6))
      );
      setChars(newChars);
    }, 100); // Очень быстрое обновление
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.dataStream, side === 'left' ? { left: 10 } : { right: 10 }]}>
      {chars.map((char, i) => (
        <Text key={i} style={[styles.dataChar, { color, opacity: (12 - i) / 12 }]}>
          {char}
        </Text>
      ))}
    </View>
  );
};

// 1. Вращающиеся технологические кольца (Подложка Радара)
const TechRingBackground = ({ color }) => {
    const rotateAnim1 = useRef(new Animated.Value(0)).current;
    const rotateAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createLoop = (anim, duration, direction = 1) => {
            Animated.loop(
                Animated.timing(anim, {
                    toValue: direction,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };

        createLoop(rotateAnim1, 20000, 1);
        createLoop(rotateAnim2, 15000, -1);
    }, []);

    const spin1 = rotateAnim1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const spin2 = rotateAnim2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Внешнее пунктирное кольцо */}
            <Animated.View style={[styles.techRing, styles.ringDashedLg, { borderColor: color, opacity: 0.5, transform: [{ rotate: spin1 }] }]} />
            {/* Среднее сплошное кольцо */}
            <Animated.View style={[styles.techRing, styles.ringSolidMd, { borderColor: color, opacity: 0.3, transform: [{ rotate: spin2 }] }]} />
             {/* Внутреннее пунктирное кольцо */}
            <Animated.View style={[styles.techRing, styles.ringDashedSm, { borderColor: color, opacity: 0.2, transform: [{ rotate: spin1 }] }]} />
             {/* Статичный крест */}
            <View style={[styles.techCrosshairV, { backgroundColor: color }]} />
            <View style={[styles.techCrosshairH, { backgroundColor: color }]} />
        </View>
    );
};

// 2. Улучшенный Радар со сканирующим лучом (Сонар)
const RadarPulseEnhanced = ({ color }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Расходящиеся круги
    Animated.loop(
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 2.5, duration: 2500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 2500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    // Вращение луча сонара
    Animated.loop(
        Animated.timing(sweepAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
        })
    ).start();
  }, []);

  const sweepSpin = sweepAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.radarLayer}>
        {/* Расходящиеся волны */}
        <Animated.View style={[styles.radarCircle, { borderColor: color, transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
        <Animated.View style={[styles.radarCircle, { borderColor: color, transform: [{ scale: scaleAnim }], opacity: Animated.multiply(opacityAnim, 0.5) }, { width: 80, height: 80, marginLeft: -40, marginTop: -40 } ]} />

        {/* Сканирующий луч */}
        <Animated.View style={[styles.radarSweepContainer, { transform: [{ rotate: sweepSpin }] }]}>
            <View style={[styles.radarSweepLine, { backgroundColor: color }]} />
             {/* Градиентный след за лучом */}
            <View style={[styles.radarSweepTrail, { borderRightColor: color }]} />
        </Animated.View>
    </View>
  );
};

// Имитация карты (точки и сетка на фоне)
const MapBackground = ({ color }) => (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Случайные точки карты */}
        {[...Array(10)].map((_, i) => (
            <View 
                key={i} 
                style={{
                    position: 'absolute',
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    width: 2, height: 2,
                    backgroundColor: color,
                    opacity: 0.5
                }} 
            />
        ))}
         {/* Линии сетки */}
         <View style={{position: 'absolute', top: '30%', left: 0, right: 0, height: 1, backgroundColor: color, opacity: 0.1}}/>
         <View style={{position: 'absolute', top: '70%', left: 0, right: 0, height: 1, backgroundColor: color, opacity: 0.1}}/>
         <View style={{position: 'absolute', left: '30%', top: 0, bottom: 0, width: 1, backgroundColor: color, opacity: 0.1}}/>
         <View style={{position: 'absolute', left: '70%', top: 0, bottom: 0, width: 1, backgroundColor: color, opacity: 0.1}}/>
    </View>
);

// ТЕКСТ С ЭФФЕКТОМ ГЛИТЧА
const GlitchText = ({ text, style, color }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const glitched = text.split('').map(c => Math.random() > 0.7 ? String.fromCharCode(33 + Math.floor(Math.random() * 30)) : c).join('');
        setDisplay(glitched);
        setTimeout(() => setDisplay(text), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [text]);
  return <Text style={[style, { color }]}>{display}</Text>;
};

// ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ
const ModeSelector = ({ currentMode, setMode, color }) => {
  return (
    <View style={styles.modeSelectorContainer}>
      {Object.keys(SPECTRA).map((mode) => (
        <TouchableOpacity 
          key={mode} 
          style={[
            styles.modeBtn, 
            { borderColor: color, backgroundColor: currentMode === mode ? color : 'transparent' }
          ]}
          onPress={() => setMode(mode)}
        >
          <Text style={[
            styles.modeText, 
            { color: currentMode === mode ? '#000' : color }
          ]}>
            {mode}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ТЕРМИНАЛ ЛОГОВ
const TerminalLog = ({ color }) => {
    const [lines, setLines] = useState(SYSTEM_LOGS.slice(0, 5));
    useEffect(() => {
        const timer = setInterval(() => {
            const newLine = `>> DATA_PACKET: [${Math.floor(Math.random() * 9999).toString(16).toUpperCase()}]`;
            setLines(prev => {
                const newArr = [...prev, newLine];
                if (newArr.length > 5) newArr.shift();
                return newArr;
            });
        }, 800);
        return () => clearInterval(timer);
    }, []);
    return (
        <View style={[styles.logContainer, { borderLeftColor: color }]}>
            {lines.map((line, i) => (
                <Text key={i} style={[styles.logText, { color }]}>
                    {line}
                </Text>
            ))}
        </View>
    );
};

// =====================================================================
// 3. ГЛАВНЫЙ ЭКРАН
// =====================================================================
export default function MJTacticalScreen() {
  const [mode, setMode] = useState('OPTICAL'); // Текущий режим
  const [bpm, setBpm] = useState(72);
  const [dist, setDist] = useState(1450);

  // Получаем текущую палитру
  const theme = useMemo(() => SPECTRA[mode], [mode]);
  
  // Анимация перехода цвета
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start(() => colorAnim.setValue(0));
    const timer = setInterval(() => {
        setBpm(prev => Math.floor(70 + Math.random() * 10));
        setDist(prev => prev + (Math.random() > 0.5 ? -1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* ФОНОВАЯ СЕТКА */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
         {[0.15, 0.5, 0.85].map((pos, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: SW * pos, backgroundColor: theme.grid }]} />
         ))}
         {[0.2, 0.45, 0.7].map((pos, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: SH * pos, backgroundColor: theme.grid }]} />
         ))}
         <View style={[styles.crosshair, { top: SH * 0.45, left: SW * 0.5, borderColor: theme.accent }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
            
            {/* 1. ЗАГОЛОВОК */}
            <View style={[styles.header, { 
                paddingTop: HEADER_CONFIG.topPadding,
                paddingHorizontal: HEADER_CONFIG.horizontalPadding
            }]}>
                <View>
                    <Text style={[styles.headerSub, { 
                        color: theme.accent,
                        fontSize: HEADER_CONFIG.subtitleSize,
                        letterSpacing: HEADER_CONFIG.letterSpacingSub
                    }]}>
                        {HEADER_CONFIG.subtitle}
                    </Text>
                    <GlitchText 
                        text={HEADER_CONFIG.title} 
                        style={[styles.headerTitle, { 
                            fontSize: HEADER_CONFIG.titleSize,
                            fontWeight: HEADER_CONFIG.titleWeight,
                            letterSpacing: HEADER_CONFIG.letterSpacingTitle
                        }]}
                        color={theme.primary}
                    />
                </View>
                <View style={[styles.modeBadge, { borderColor: theme.accent }]}>
                    <Text style={[styles.modeBadgeText, { color: theme.accent }]}>{mode}</Text>
                </View>
            </View>

            {/* 2. ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ */}
            <ModeSelector currentMode={mode} setMode={setMode} color={theme.accent} />

            {/* 3. ЦЕНТРАЛЬНЫЙ СКАНЕР (ОБНОВЛЕННЫЙ: КРУГЛЫЙ СОНАР + КАРТА) */}
            <View style={styles.scannerLayout}>
                {/* Боковые потоки данных */}
                <DataStreamColumn color={theme.primary} side="left" />
                <DataStreamColumn color={theme.primary} side="right" />

                {/* Основной контейнер "Модалка" */}
                <View style={[
                    styles.radarContainer, 
                    { backgroundColor: theme.blockBg, borderColor: theme.grid }
                ]}>
                    
                    {/* Фон: Кольца и Карта */}
                    <TechRingBackground color={theme.grid} />
                    <MapBackground color={theme.accent} />

                    {/* Центр: Фото и Сонар */}
                    <View style={styles.targetWrapper}>
                         <RadarPulseEnhanced color={theme.scanColor} />
                         <View style={[styles.imageBorder, { borderColor: theme.accent }]}>
                            <Image 
                                source={require('../../assets/mj.png')} 
                                style={[styles.targetImage, { tintColor: theme.imageTint }]} 
                                resizeMode="cover" 
                            />
                        </View>
                    </View>

                    {/* Уголки рамки */}
                    <View style={[styles.corner, styles.tl, { borderColor: theme.accent }]} />
                    <View style={[styles.corner, styles.tr, { borderColor: theme.accent }]} />
                    <View style={[styles.corner, styles.bl, { borderColor: theme.accent }]} />
                    <View style={[styles.corner, styles.br, { borderColor: theme.accent }]} />

                    {/* Координаты */}
                    <Text style={[styles.coordsText, { color: theme.primary, opacity: 0.7 }]}>
                        LAT: 40.7128 N  //  LNG: 74.0060 W
                    </Text>
                </View>
            </View>

            {/* 4. БИОМЕТРИЯ */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: theme.primary, opacity: 0.6 }]}>HEART RATE</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>{bpm}</Text>
                    <Text style={[styles.statUnit, { color: theme.primary, opacity: 0.5 }]}>BPM</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.grid }]} />
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: theme.primary, opacity: 0.6 }]}>DISTANCE</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>{dist}</Text>
                    <Text style={[styles.statUnit, { color: theme.primary, opacity: 0.5 }]}>METERS</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.grid }]} />
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: theme.primary, opacity: 0.6 }]}>BATTERY</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>84</Text>
                    <Text style={[styles.statUnit, { color: theme.primary, opacity: 0.5 }]}>%</Text>
                </View>
            </View>

            {/* 5. НИЖНЯЯ ПАНЕЛЬ (ЛОГИ) */}
            <View style={styles.footer}>
                <TerminalLog color={theme.accent} />
                <TouchableOpacity 
                    style={[styles.btnAction, { borderColor: theme.accent, backgroundColor: 'rgba(255,255,255,0.05)' }]}
                    activeOpacity={0.7}
                    onPress={() => alert('DATA SYNCED')}
                >
                    <Text style={[styles.btnText, { color: theme.primary }]}>
                        SYNC DATA
                    </Text>
                </TouchableOpacity>
            </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // ГЛОБАЛЬНЫЕ ЭЛЕМЕНТЫ
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1 },
  crosshair: { position: 'absolute', width: 20, height: 20, borderWidth: 1, transform:[{translateX:-10},{translateY:-10}]},

  // ШАПКА
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  headerSub: { fontWeight: '700', marginBottom: 4 },
  
  // Бейдж режима
  modeBadge: { paddingHorizontal: 8, marginBottom: 4, paddingVertical: 4, borderWidth: 1, borderRadius: 2 },
  modeBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // СЕЛЕКТОР РЕЖИМОВ
  modeSelectorContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 15, justifyContent: 'space-between' },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1, marginHorizontal: 4, borderRadius: 2 },
  modeText: { fontSize: 10, fontWeight: 'bold' },

  // СКАНЕР ЛЕЙАУТ
  scannerLayout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: SH * 0.42, marginBottom: 10 },
  
  // Data Stream
  dataStream: { position: 'absolute', width: 20, height: '80%', alignItems: 'center', justifyContent: 'center' },
  dataChar: { fontSize: 8, fontWeight: 'bold', marginVertical: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // КОНТЕЙНЕР РАДАРА ("Модалка")
  radarContainer: {
    height: '100%', 
    width: SW * 0.85,
    position: 'relative',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 4
  },
  
  // ЦЕНТР РАДАРА (Иконка и пульс)
  targetWrapper: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  imageBorder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, overflow: 'hidden', zIndex: 12, backgroundColor: '#000' },
  targetImage: { width: '100%', height: '100%' },
  
  // Слои радара
  radarLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  radarCircle: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, top: -20, left: -20 },
  radarSweepContainer: { position: 'absolute', width: 200, height: 200, justifyContent: 'center', alignItems: 'center', top: -40, left: -40 },
 
  // Техно-кольца
  techRing: { position: 'absolute', borderRadius: 300, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  ringDashedLg: { width: SH * 0.38, height: SH * 0.38, borderStyle: 'dashed', borderWidth: 1 },
  ringSolidMd: { width: SH * 0.28, height: SH * 0.28, borderWidth: 2 },
  ringDashedSm: { width: SH * 0.18, height: SH * 0.18, borderStyle: 'dashed' },
  techCrosshairV: { position: 'absolute', width: 1, height: '100%', opacity: 0.3 },
  techCrosshairH: { position: 'absolute', width: '100%', height: 1, opacity: 0.3 },

  coordsText: { position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 1 },
  
  // Уголки
  corner: { position: 'absolute', width: 20, height: 20 },
  tl: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3 },

  // СТАТИСТИКА
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '900' },
  statUnit: { fontSize: 9, fontWeight: 'bold' },
  divider: { width: 1, height: '60%', alignSelf: 'center' },

  // НИЖНЯЯ ПАНЕЛЬ
  footer: { flex: 1, paddingHorizontal: 24, paddingBottom: 20, justifyContent: 'flex-end' },
  logContainer: { 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      padding: 10, 
      borderRadius: 2, 
      borderLeftWidth: 3, 
      marginBottom: 5,
      minHeight: 80 
  },
  logText: { fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 3 },

  // Кнопка
  btnAction: { height: 44, justifyContent: 'center', marginBottom: 80, alignItems: 'center', borderWidth: 1, borderRadius: 2 },
  btnText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
});