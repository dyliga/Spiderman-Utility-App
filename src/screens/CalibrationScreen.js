// src/screens/WebShooterScreen.js

// RUSSIAN TACTICAL EDITION // MODULE: WEB_FLUID_LAB // V.6.0 - ANIMATED

import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Animated,
  Easing,
  StatusBar,
  Platform,
  FlatList,
  Pressable,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// --- КОНСТАНТЫ СТИЛЯ ---
const COLORS = {
  bg: '#020510',
  blockBg: 'rgba(15, 35, 90, 0.6)',
  accentDark: '#681212',
  accentLight: '#ff3333',
  success: '#ff3333',
  cyan: '#ff3333',
  textMain: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.5)',
  grid: 'rgba(255,255,255,0.05)',
};

// --- ДАННЫЕ: ТИПЫ ПАУТИНЫ ---
const WEB_MODES = [
  { id: 'm1', name: 'STANDARD V.1', formula: 'C8H10N4O2', desc: 'BALANCED POLYMER' },
  { id: 'm2', name: 'RICOCHET', formula: 'Si-C3H6', desc: 'HIGH ELASTICITY' },
  { id: 'm3', name: 'TASER WEB', formula: 'Cu-Al-Ni', desc: 'CONDUCTIVE MESH' },
  { id: 'm4', name: 'IMPACT', formula: 'Fe-C-V', desc: 'HIGH DENSITY' },
];

const PARAMS = [
  { key: 'viscosity', label: 'VISCOSITY', unit: 'P' },
  { key: 'pressure', label: 'PRESSURE', unit: 'PSI' },
  { key: 'tensile', label: 'TENSILE STR', unit: 'GPa' },
];

// ------------------ GEEK КОМПОНЕНТЫ ------------------

// 1. Oscilloscope — проценты теперь в правом верхнем углу самой модалки
const Oscilloscope = ({ stability, neon }) => {
  const [bars, setBars] = useState(new Array(28).fill(10));

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setBars(prev => prev.map(() => {
        const noise = Math.random() * (100 - stability);
        const base = stability / 1.6;
        return Math.max(4, Math.min(60, base + noise - 12));
      }));
    }, 90);
    return () => { mounted = false; clearInterval(interval); };
  }, [stability]);

  return (
    <View style={[styles.scopeContainer, { borderColor: neon ? COLORS.cyan : COLORS.grid }]}>
      <View style={styles.scopeHeader}>
        <Text style={styles.techLabel}>MOLECULAR STABILITY</Text>
      </View>

      {/* Проценты в правом верхнем углу */}
      <View style={styles.stabilityCorner}>
        <Text style={[styles.techValue, { color: stability > 50 ? COLORS.success : COLORS.accentLight }]}>
          {stability}%
        </Text>
      </View>

      <View style={styles.scopeGraph}>
        {bars.map((h, i) => (
          <Animated.View key={i} style={[styles.scopeBar, { height: h, backgroundColor: stability > 50 ? COLORS.cyan : COLORS.accentLight }]} />
        ))}
      </View>
    </View>
  );
};

// 2. TechSlider
const TechSlider = ({ label, value, unit, onChange }) => {
  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value} <Text style={styles.sliderUnit}>{unit}</Text></Text>
      </View>

      <View style={styles.sliderTrackContainer}>
        <TouchableOpacity onPress={() => onChange(-5)} style={styles.adjustBtn}><Text style={styles.adjustText}>-</Text></TouchableOpacity>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${value}%` }]} />
          <View style={styles.trackGrid}>{[...Array(10)].map((_, i) => <View key={i} style={styles.trackLine} />)}</View>
          <View style={[styles.pulseMarker, { left: `${value}%`, backgroundColor: value > 60 ? COLORS.cyan : COLORS.accentLight }]} />
        </View>

        <TouchableOpacity onPress={() => onChange(5)} style={styles.adjustBtn}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
};

// 3. FluidTank — теперь с реалистичным "переливанием" жидкости
const FluidTank = ({ level, color }) => {
  const heightAnim = useRef(new Animated.Value(level)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: level,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();

    // Постоянные лёгкие волны
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2200, easing: Easing.sin, useNativeDriver: false }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2200, easing: Easing.sin, useNativeDriver: false }),
      ])
    ).start();

    // Лёгкое покачивание бака
    Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: -6.2, duration: 100, useNativeDriver: false }),
        Animated.timing(tilt, { toValue: 6.2, duration: 100, useNativeDriver: false }),
      ])
    ).start();
  }, [level]);

  const heightInter = heightAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const waveOffset = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const tiltRotate = tilt.interpolate({ inputRange: [-5, 5], outputRange: ['-1.5deg', '1.5deg'] });

  return (
    <View style={styles.tankContainer}>
      <Animated.View style={[styles.tankGlass, { transform: [{ rotate: tiltRotate }] }]}>
        {/* Основная жидкость */}
        <Animated.View style={[styles.tankFluid, { height: heightInter, backgroundColor: color }]} />

        {/* Волна сверху (переливание) */}
        <Animated.View style={[styles.tankWave, { bottom: heightInter, transform: [{ translateY: waveOffset }] }]}>
          <Animated.View style={[styles.waveLayer, { backgroundColor: color, opacity: 0.6 }]} />
          <Animated.View style={[styles.waveLayer, { backgroundColor: color, opacity: 0.4, transform: [{ translateX: 8 }] }]} />
        </Animated.View>

        <View style={styles.tankGloss} />
      </Animated.View>
      <Text style={styles.tankLabel}>FLUID LVL</Text>
    </View>
  );
};

// 4. GeekConsole
const GeekConsole = ({ lines }) => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!lines || lines.length === 0) return;
    const loop = setInterval(() => {
      setIdx(i => (i + 1) % lines.length);
    }, 4200);
    return () => { mounted = false; clearInterval(loop); };
  }, [lines]);

  useEffect(() => {
    setText('');
    let i = 0;
    let mounted = true;
    const line = lines[idx] || '';
    const t = setInterval(() => {
      if (!mounted) return;
      i++;
      setText(line.slice(0, i));
      if (i >= line.length) clearInterval(t);
    }, 20);
    return () => { mounted = false; clearInterval(t); };
  }, [idx, lines]);

  return (
    <View style={styles.consoleContainer}>
      <Text style={styles.consoleText}>{text}<Text style={{opacity:0.6}}>|</Text></Text>
    </View>
  );
};

// 5. Particles
const Particles = ({ intensity = 14 }) => {
  const particles = useRef([...Array(intensity)].map(() => ({
    x: Math.random() * SW,
    y: Math.random() * SH * 0.6,
    size: Math.random() * 6 + 2,
    id: Math.random().toString(36).slice(2)
  }))).current;
  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 3000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0, duration: 3000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: false }),
      ])).start();
    });
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => {
        const top = anims[i].interpolate({ inputRange: [0,1], outputRange: [p.y, p.y - 30 - Math.random() * 100] });
        const left = anims[i].interpolate({ inputRange: [0,1], outputRange: [p.x, p.x + Math.random() * 40 - 20] });
        const opacity = anims[i].interpolate({ inputRange: [0,0.5,1], outputRange: [0.05, 0.35, 0.05] });
        const scale = anims[i].interpolate({ inputRange: [0,0.5,1], outputRange: [0.6, 1.2, 0.6] });
        return (
          <Animated.View key={p.id} style={{ position: 'absolute', top, left, width: p.size, height: p.size, borderRadius: p.size/2, backgroundColor: COLORS.cyan, opacity, transform: [{ scale }] }} />
        );
      })}
    </View>
  );
};

// ------------------ MAIN SCREEN ------------------
export default function WebShooterScreen() {
  const [activeMode, setActiveMode] = useState(WEB_MODES[0]);
  const [params, setParams] = useState({ viscosity: 65, pressure: 80, tensile: 70 });
  const [stability, setStability] = useState(92);
  const [uploading, setUploading] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const scanX = useRef(new Animated.Value(-SW)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;
  const shooterTilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(scanX, { toValue: SW, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: false })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(btnPulse, { toValue: 1.06, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(btnPulse, { toValue: 1.0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(shooterTilt, { toValue: -4, duration: 1200, useNativeDriver: false }),
      Animated.timing(shooterTilt, { toValue: 4, duration: 1200, useNativeDriver: false }),
    ])).start();
  }, []);

  const updateParam = (key, delta) => {
    Vibration.vibrate(10);
    const newVal = Math.max(0, Math.min(100, params[key] + delta));
    setParams(p => {
      const newParams = { ...p, [key]: newVal };
      let stab = 100 - Math.abs(newParams.pressure - newParams.viscosity) * 0.5;
      if (newParams.pressure > 90) stab -= 10;
      if (newParams.viscosity < 30) stab -= 6;
      setStability(Math.max(8, Math.min(100, Math.floor(stab))));
      return newParams;
    });
  };

  const renderModeItem = ({ item }) => {
    const isActive = activeMode.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.modeCard, isActive && styles.modeCardActive]}
        onPress={() => { setActiveMode(item); Vibration.vibrate(20); }}
        activeOpacity={0.85}
      >
        <Text style={[styles.modeTitle, isActive && { color: COLORS.bg }]}>{item.name}</Text>
        <Text style={[styles.modeFormula, isActive && { color: COLORS.bg }]}>{item.formula}</Text>
      </TouchableOpacity>
    );
  };

  const startUpload = () => {
    if (uploading) return;
    Vibration.vibrate([0,40,20,40]);
    setUploading(true);
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start(() => {
      setTimeout(() => {
        Vibration.vibrate([0,80]);
        setUploading(false);
        progress.setValue(0);
      }, 700);
    });
  };

  const progressWidth = progress.interpolate({ inputRange: [0,1], outputRange: ['0%', '100%'] });
  const tiltInter = shooterTilt.interpolate({ inputRange: [-10,10], outputRange: ['-6deg','6deg'] });
  const scanStyle = { left: scanX, width: 120, opacity: 0.25, transform: [{ rotate: '12deg' }] };

  const consoleLines = [
    `INIT: handshake -> STARK.NET`,
    `DIAGNOSTIC: polymer matrix nominal`,
    `CHECKSUM: ${((params.viscosity*7 + params.pressure*11 + params.tensile*5) % 9999).toString().padStart(4,'0')}`,
    `DEPLOY READY: ${activeMode.name}`,
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Particles intensity={18} />

      <View style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>СИСТЕМА УПРАВЛЕНИЯ ТАУ КИТА// v.2.0.25</Text>
            <Text style={styles.headerTitle}> WEB CONFIGURATOR</Text>
          </View>
          <View style={styles.batteryBlock}>
            <Text style={styles.batText}>PWR: 98%</Text>
            <View style={styles.batIcon} />
          </View>
        </View>

        <View style={styles.topSection}>
          <View style={styles.shooterPreview}>
            <Animated.View style={[styles.scannerLine, scanStyle]} />
            <Animated.Image source={require('../../assets/webshooter.png')} style={[styles.shooterImg, { transform: [{ rotate: '-12deg' }, { translateY: -6 }, { rotate: tiltInter }] }]} resizeMode="contain" />
            <Animated.View style={[styles.targetReticle, { transform: [{ scale: btnPulse }] }]} />
            <View style={styles.shooterGlow} />
          </View>

          <View style={styles.infoCol}>
            <FluidTank level={params.pressure} color={stability > 10 ? COLORS.cyan : COLORS.accentLight} />
            <Oscilloscope stability={stability} neon={stability > 60} />
          </View>
        </View>

        <View style={styles.modeSelectorContainer}>
          <Text style={styles.sectionLabel}>SELECT CARTRIDGE TYPE</Text>
          <FlatList data={WEB_MODES} horizontal showsHorizontalScrollIndicator={false} renderItem={renderModeItem} keyExtractor={i => i.id} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }} />
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.controlsHeader}>
            <Text style={styles.activeDesc}>{activeMode.desc}</Text>
            <Text style={styles.activeFormula}>COMPOSITION: {activeMode.formula}</Text>
          </View>

          {PARAMS.map((p) => (
            <TechSlider key={p.key} label={p.label} value={params[p.key]} unit={p.unit} onChange={(d) => updateParam(p.key, d)} />
          ))}

          <GeekConsole lines={consoleLines} />
        </View>

        <Animated.View style={[styles.calibBtnWrap, { transform: [{ scale: btnPulse }] }]}>
          <Pressable style={({pressed}) => [styles.calibBtn, pressed && { opacity: 0.85 }]} onPress={startUpload} android_ripple={{ color: '#ffffff08' }}>
            <Text style={styles.calibBtnText}>UPLOAD CONFIGURATION</Text>
            <View style={styles.btnDeco} />
            {uploading && (
              <Animated.View style={[styles.uploadProgress, { width: progressWidth }]} />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 40 : 90 },

  header: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  headerSub: { color: COLORS.accentLight, fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  batteryBlock: { flexDirection: 'row', alignItems: 'center', opacity: 0.9 },
  batText: { color: COLORS.textDim, fontSize: 10, marginRight: 6, fontWeight: 'bold' },
  batIcon: { width: 18, height: 10, borderWidth: 1, borderColor: COLORS.textMain, backgroundColor: COLORS.success },

  topSection: { flexDirection: 'row', paddingHorizontal: 24, height: 200, marginBottom: 18 },
  shooterPreview: { flex: 1, marginRight: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  shooterImg: { width: '78%', height: '78%' },
  scannerLine: { position: 'absolute', height: 140, backgroundColor: COLORS.cyan, top: '10%', opacity: 0.08, borderRadius: 8 },
  targetReticle: { position: 'absolute', width: 48, height: 48, borderWidth: 1.2, borderColor: COLORS.accentLight, borderRadius: 24, top: 18, right: 18, opacity: 0.85 },
  shooterGlow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: COLORS.cyan, opacity: 0.02, bottom: -40, right: -40 },

  infoCol: { width: 110, justifyContent: 'space-between' },

  // Oscilloscope
  scopeContainer: { backgroundColor: COLORS.blockBg, borderRadius: 10, padding: 8, flex: 1, borderWidth: 1, position: 'relative' },
  scopeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  techLabel: { fontSize: 8, color: COLORS.textDim, fontWeight: '700' },
  techValue: { fontSize: 10, fontWeight: '900' },
  stabilityCorner: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
  scopeGraph: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 62 },
  scopeBar: { width: 3, borderRadius: 2 },

  // Fluid Tank — новые стили для волн
  tankContainer: { flex: 1, alignItems: 'center', paddingBottom: 6 },
  tankGlass: { width: 48, flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, borderWidth: 2, borderColor: '#333', overflow: 'hidden', position: 'relative' },
  tankFluid: { width: '100%', position: 'absolute', bottom: 0 },
  tankWave: { position: 'absolute', left: -20, right: -20, height: 30, overflow: 'hidden' },
  waveLayer: {
    height: 40,
    width: '200%',
    borderRadius: 20,
    transform: [{ translateX: -20 }]
  },
  tankGloss: { position: 'absolute', width: 6, height: '86%', backgroundColor: 'rgba(255,255,255,0.18)', left: 10, top: '7%', borderRadius: 3 },
  tankLabel: { fontSize: 9, color: COLORS.textDim, marginTop: 6, fontWeight: '700' },

  modeSelectorContainer: { marginBottom: 12 },
  sectionLabel: { paddingHorizontal: 24, color: COLORS.textDim, fontSize: 10, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  modeCard: { width: 150, height: 80, backgroundColor: COLORS.blockBg, marginRight: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', padding: 14 },
  modeCardActive: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan, shadowColor: COLORS.cyan, shadowOpacity: 0.35, shadowRadius: 18 },
  modeTitle: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
  modeFormula: { color: COLORS.textDim, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 6 },

  controlsSection: { flex: 1, paddingHorizontal: 24 },
  controlsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.grid, paddingBottom: 10 },
  activeDesc: { color: '#fff', fontSize: 14, fontWeight: '900' },
  activeFormula: { color: COLORS.cyan, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  sliderContainer: { marginBottom: 14 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sliderLabel: { color: '#ccc', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sliderValue: { color: COLORS.accentLight, fontSize: 12, fontWeight: '900' },
  sliderUnit: { color: COLORS.textDim, fontSize: 9 },
  sliderTrackContainer: { flexDirection: 'row', alignItems: 'center' },
  adjustBtn: { width: 34, height: 34, backgroundColor: '#0c0c0c', alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#222' },
  adjustText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  track: { flex: 1, height: 14, backgroundColor: '#0a0a0a', borderRadius: 4, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#1a1a1a' },
  fill: { height: '100%', backgroundColor: COLORS.accentLight },
  trackGrid: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-between' },
  trackLine: { width: 1, height: '100%', backgroundColor: 'rgba(0,0,0,0.4)' },
  pulseMarker: { position: 'absolute', top: -4, width: 10, height: 22, borderRadius: 4, opacity: 0.95, borderWidth: 1, borderColor: '#000' },

  consoleContainer: { marginTop: 50, backgroundColor: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  consoleText: { color: COLORS.textDim, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  calibBtnWrap: { marginHorizontal: 24, marginBottom: 145, height: 60 },
  calibBtn: { flex: 1, backgroundColor: COLORS.accentDark, justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: COLORS.accentLight, overflow: 'hidden' },
  calibBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  btnDeco: { position: 'absolute', bottom: 8, right: 10, width: 12, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#fff' },
  uploadProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,255,170,0.12)' },
});