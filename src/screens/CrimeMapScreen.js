// src/screens/CrimeMapScreen.js
// RUSSIAN TACTICAL EDITION // MAP MONITORING SYSTEM
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// === НАСТРОЙКИ ВНЕШНЕГО ВИДА ===
const HEADER_CONFIG = {
  title: "CRIME MAP",
  subtitle: "СИСТЕМА УПРАВЛЕНИЯ ТАУ КИТА// v.2.0.25",
  titleFontSize: 24,
  subtitleFontSize: 9,
  titleColor: '#ffffff',
  subtitleColor: '#ff3333',
  titleFontWeight: '900',
  subtitleFontWeight: '700',
  titleLetterSpacing: 1,
  subtitleLetterSpacing: 2,
  headerTopPadding: Platform.OS === 'android' ? 40 : 40,
  headerHorizontalPadding: 24,
};

// === ЦВЕТА И СТИЛИ ===
const COLORS = {
  accentDark: '#681212', 
  accentLight: '#ff3333', 
  accentOrange: '#ffaa00',
  blockBg: 'rgba(15, 35, 90, 0.94)', 
  bg: '#020510',
  textMain: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.6)',
  grid: 'rgba(255, 255, 255, 0.05)',
  hudLine: 'rgba(148, 163, 248, 0.4)',
};

// === ДАННЫЕ ===
const CRIMES = [
  { 
    id: 1, 
    left: '32%', top: '28%', 
    title: 'ОГРАБЛЕНИЕ БАНКА', 
    villain: 'РИНО', 
    threatLevel: 'КРИТИЧЕСКИЙ',
    dist: '2.4 КМ',
    coords: '40.7128° N, 74.0060° W'
  },
  { 
    id: 2, 
    left: '68%', top: '52%', 
    title: 'ЗАЛОЖНИКИ', 
    villain: 'ВЕНОМ', 
    threatLevel: 'ЭКСТРЕМАЛЬНЫЙ',
    dist: '5.1 КМ',
    coords: '40.7580° N, 73.9855° W'
  },
  { 
    id: 3, 
    left: '58%', top: '36%', 
    title: 'ПЕСЧАНАЯ БУРЯ', 
    villain: 'ПЕСОЧНЫЙ ЧЕЛОВЕК', 
    threatLevel: 'ВЫСОКИЙ',
    dist: '1.2 КМ',
    coords: '40.7829° N, 73.9654° W'
  },
  { 
    id: 4, 
    left: '20%', top: '65%', 
    title: 'УГОН КОНВОЯ', 
    villain: 'БАНДА', 
    threatLevel: 'СРЕДНИЙ',
    dist: '3.8 КМ',
    coords: '40.7484° N, 73.9857° W'
  },
];

const SYSTEM_LOGS = [
  'SCANNING SECTOR 7G...',
  'CONNECTION ESTABLISHED',
  'ENCRYPTING DATA STREAM...',
  'TARGET LOCKED: MULTIPLE',
  'ANALYZING THREAT LEVEL...',
  'POLICE RADIO: INTERCEPTED',
  'THERMAL SIGNATURE: DETECTED',
];

// === КОМПОНЕНТ АНИМИРОВАННОГО ФУТЕРА ===
const AnimatedFooter = ({ crimeCount }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = `СКАНИРОВАНИЕ ГОРОДА... ОБНАРУЖЕНО ${crimeCount} ЦЕЛЕЙ`;

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Скорость печати
      return () => clearTimeout(timer);
    } else {
      // Перезапуск анимации через 3 секунды
      const restartTimer = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
      }, 3000);
      return () => clearTimeout(restartTimer);
    }
  }, [currentIndex, fullText]);

  return (
    <View style={styles.statusFooter}>
      <Text style={styles.footerText}>{displayText}</Text>
      <View style={styles.loadingBar}>
        <Animated.View style={[styles.loadingFill, styles.loadingFillAnimated]} />
      </View>
    </View>
  );
};

// === КОМПОНЕНТ МИГАЮЩЕЙ КНОПКИ LIVE ===
const LiveIndicator = () => {
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <View style={styles.liveIndicator}>
      <Animated.View style={[styles.liveDot, { opacity }]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
};

// === ОСТАЛЬНЫЕ КОМПОНЕНТЫ ===
const MapMarker = ({ item, onPress, isSelected }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={[styles.markerContainer, { left: item.left, top: item.top }]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.pulseRing, 
          { 
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.8, 0] })
          }
        ]} 
      />
      <View style={[styles.markerCore, isSelected && styles.markerCoreActive]}>
        {isSelected && <View style={styles.markerCenterDot} />}
      </View>
    </TouchableOpacity>
  );
};

const ScannerLine = () => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 500],
  });

  return (
    <Animated.View style={[styles.scannerLine, { transform: [{ translateY }] }]}>
      <View style={styles.scannerGlow} />
    </Animated.View>
  );
};

const CrimeDetailPanel = ({ crime, onEngage, onClose }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [crime]);

  return (
    <Animated.View style={[styles.detailPanel, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailCoords}>КООРДИНАТЫ: {crime.coords}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>ЗАКРЫТЬ [X]</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailContent}>
        <View style={styles.detailLeft}>
           <Text style={styles.detailLabel}>ЦЕЛЬ</Text>
           <Text style={styles.detailVillain}>{crime.villain}</Text>
           <Text style={styles.detailLabel}>СОБЫТИЕ</Text>
           <Text style={styles.detailTitle}>{crime.title}</Text>
        </View>
        <View style={styles.detailRight}>
           <View style={styles.threatBox}>
             <Text style={styles.threatLabel}>УГРОЗА</Text>
             <Text style={styles.threatValue}>{crime.threatLevel}</Text>
           </View>
           <Text style={styles.distText}>{crime.dist}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.engageBtn} onPress={onEngage}>
        <Text style={styles.engageText}>ПРОЛОЖИТЬ МАРШРУТ</Text>
        <View style={styles.btnDeco} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CrimeMapScreen() {
  const [selectedCrime, setSelectedCrime] = useState(null);
  
  const [logs, setLogs] = useState(SYSTEM_LOGS);
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev];
        const first = newLogs.shift();
        newLogs.push(first);
        return newLogs;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (crime) => {
    setSelectedCrime(crime);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.bgGrid} pointerEvents="none">
         <View style={styles.gridVertical} />
         <View style={styles.gridHorizontal} />
         <View style={[styles.gridHorizontal, { top: SH * 0.8 }]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* ШАПКА С ИСПОЛЬЗОВАНИЕМ КОНФИГА */}
        <View style={[styles.header, {
          paddingTop: HEADER_CONFIG.headerTopPadding,
          paddingHorizontal: HEADER_CONFIG.headerHorizontalPadding
        }]}>
          <View style={styles.headerTopRow}>
             <Text style={[styles.headerSub, {
               color: HEADER_CONFIG.subtitleColor,
               fontSize: HEADER_CONFIG.subtitleFontSize,
               letterSpacing: HEADER_CONFIG.subtitleLetterSpacing
             }]}>
               {HEADER_CONFIG.subtitle}
             </Text>
             <LiveIndicator />
          </View>
          <Text style={[styles.headerTitle, {
            color: HEADER_CONFIG.titleColor,
            fontSize: HEADER_CONFIG.titleFontSize,
            fontWeight: HEADER_CONFIG.titleFontWeight,
            letterSpacing: HEADER_CONFIG.titleLetterSpacing
          }]}>
            {HEADER_CONFIG.title}
          </Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.mainContent}>
          
          <View style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={[styles.logText, { opacity: (7 - index) / 7 }]}>
                {`> ${log}`}
              </Text>
            ))}
          </View>

          <View style={styles.mapFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={styles.mapClip}>
              <Image 
                source={require('../../assets/nyc_spider_map.jpg')}
                style={styles.mapImage}
                resizeMode="cover"
              />
              
              <View style={styles.mapOverlayGrid} />
              
              <ScannerLine />

              {CRIMES.map(crime => (
                <MapMarker 
                  key={crime.id} 
                  item={crime} 
                  onPress={handleSelect}
                  isSelected={selectedCrime?.id === crime.id}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomArea}>
          {selectedCrime ? (
            <CrimeDetailPanel 
              crime={selectedCrime} 
              onClose={() => setSelectedCrime(null)}
              onEngage={() => alert('МАРШРУТ ПОСТРОЕН')}
            />
          ) : (
            <AnimatedFooter crimeCount={CRIMES.length} />
          )}
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
  
  bgGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.3 },
  gridVertical: {
    position: 'absolute', left: SW * 0.1, width: 1, height: '100%', backgroundColor: COLORS.grid,
  },
  gridHorizontal: {
    position: 'absolute', top: SH * 0.15, width: '100%', height: 1, backgroundColor: COLORS.grid,
  },

  header: {
    marginBottom: 10,
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4
  },
  headerSub: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 51, 51, 0.2)', 
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accentLight, marginRight: 4
  },
  liveText: {
    color: COLORS.accentLight, fontSize: 8, fontWeight: '900'
  },
  headerTitle: {
    textShadowColor: COLORS.accentDark, 
    textShadowRadius: 10,
  },
  divider: {
    height: 2, width: 60, backgroundColor: COLORS.accentLight, marginTop: 8,
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  
  logContainer: {
    width: 80,
    paddingTop: 20,
    overflow: 'hidden',
  },
  logText: {
    color: COLORS.textDim, fontSize: 7, marginBottom: 6, 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  mapFrame: {
    flex: 1,
    backgroundColor: COLORS.blockBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  mapClip: {
    flex: 1,
    margin: 4,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%', height: '100%', opacity: 0.6,
  },
  mapOverlayGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: COLORS.grid,
    opacity: 0.2,
  },

  corner: {
    position: 'absolute', width: 10, height: 10, borderColor: COLORS.accentLight,
    zIndex: 10,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },

  markerContainer: {
    position: 'absolute', width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    marginLeft: -20, marginTop: -20,
  },
  pulseRing: {
    position: 'absolute', width: '100%', height: '100%', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.accentLight,
  },
  markerCore: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accentLight,
    borderWidth: 2, borderColor: '#fff',
    shadowColor: COLORS.accentLight, shadowOpacity: 0.8, shadowRadius: 10,
  },
  markerCoreActive: {
    backgroundColor: '#fff', borderColor: COLORS.accentLight,
  },

  scannerLine: {
    position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: COLORS.hudLine,
    zIndex: 5,
  },
  scannerGlow: {
    position: 'absolute', top: -20, width: '100%', height: 40, backgroundColor: COLORS.hudLine, opacity: 0.2,
  },

  bottomArea: {
    height: 180,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  
  detailPanel: {
    backgroundColor: COLORS.blockBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, 
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 8,
  },
  detailCoords: {
    color: COLORS.textDim, fontSize: 10, 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  closeBtn: {
    color: COLORS.accentLight, fontSize: 10, fontWeight: 'bold',
  },
  detailContent: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16,
  },
  detailLeft: { flex: 1 },
  detailRight: { alignItems: 'flex-end' },
  
  detailLabel: {
    color: COLORS.textDim, fontSize: 9, marginBottom: 2, fontWeight: 'bold',
  },
  detailVillain: {
    color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8, textTransform: 'uppercase',
  },
  detailTitle: {
    color: COLORS.accentLight, fontSize: 14, fontWeight: 'bold',
  },
  threatBox: {
    backgroundColor: 'rgba(104, 18, 18, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.accentDark,
  },
  threatLabel: { color: COLORS.textDim, fontSize: 8, textAlign: 'right' },
  threatValue: { color: COLORS.accentLight, fontSize: 12, fontWeight: 'bold' },
  distText: { 
    color: '#fff', fontSize: 16, 
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
    fontWeight: 'bold' 
  },

  engageBtn: {
    backgroundColor: COLORS.accentDark,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: 1, borderColor: COLORS.accentLight,
    flexDirection: 'row',
  },
  engageText: {
    color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1,
  },
  btnDeco: {
    width: 10, height: 2, backgroundColor: '#fff', marginLeft: 8,
  },

  statusFooter: {
    alignItems: 'center', 
  },
  footerText: {
    color: '#ff3333', 
    fontSize: 12, 
    marginBottom: 10, 
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 20,
  },
  loadingBar: {
    width: '100%', 
    height: 2, 
    backgroundColor: '#ff3333',
    overflow: 'hidden',
  },
  loadingFill: {
    width: '40%', 
    height: '100%', 
    backgroundColor: COLORS.accentLight,
  },
  loadingFillAnimated: {
    animationDuration: '2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationName: 'loadingAnimation',
  },
});

// Добавляем анимацию для loading bar
const additionalStyles = StyleSheet.create({
  '@keyframes loadingAnimation': {
    '0%': { transform: [{ translateX: '-100%' }] },
    '100%': { transform: [{ translateX: '250%' }] },
  },
});