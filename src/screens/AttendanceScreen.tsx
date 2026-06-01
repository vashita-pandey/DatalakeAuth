import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useTranslation} from 'react-i18next';
import {initializeTFLite, getEmbeddingFromBase64, compareFaceEmbeddings, isMatch} from '../services/TFLiteBridge';
import {
  getAllEmployees,
  saveAttendanceRecord,
  hasMarkedAttendanceToday,
  Employee,
} from '../services/StorageService';
import LivenessScreen from './LivenessScreen';

type ScanState = 'ready' | 'scanning' | 'liveness' | 'success' | 'already' | 'unknown' | 'noemployees';

const AttendanceScreen = () => {
  const {t} = useTranslation();
  const {hasPermission, requestPermission} = useCameraPermission();
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');
  const cameraRef = useRef<Camera>(null);

  const [scanState, setScanState] = useState<ScanState>('ready');
  const [tfReady, setTfReady] = useState(false);
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [pendingConfidence, setPendingConfidence] = useState(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
    initializeTFLite()
      .then(() => setTfReady(true))
      .catch(e => console.error('TFLite init failed:', e));
  }, []);

  const handleScan = async () => {
    if (scanState !== 'ready') return;

    // Ensure TFLite is initialized
    if (!tfReady) {
      try {
        await initializeTFLite();
        setTfReady(true);
      } catch (e) {
        console.error('TFLite init failed:', e);
        return;
      }
    }

    const employees = await getAllEmployees();
    if (employees.length === 0) {
      setScanState('noemployees');
      setTimeout(() => setScanState('ready'), 3000);
      return;
    }

    setScanState('scanning');

    try {
      let embedding: number[];

      const photo = await cameraRef.current?.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false,
      });

      if (photo) {
        const response = await fetch(`file://${photo.path}`);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const result = await getEmbeddingFromBase64(base64);
        embedding = result.embedding;
      } else {
        embedding = Array.from({length: 128}, () => Math.random() * 2 - 1);
      }

      // Find best match
      let bestMatch: Employee | null = null;
      let bestSimilarity = 0;

      for (const emp of employees) {
        const similarity = await compareFaceEmbeddings(embedding, emp.embedding);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = emp;
        }
      }

      console.log('Best similarity:', bestSimilarity, 'Match:', bestMatch?.name);

      if (bestMatch && isMatch(bestSimilarity)) {
        const alreadyMarked = await hasMarkedAttendanceToday(bestMatch.userId);
        if (alreadyMarked) {
          setMatchedEmployee(bestMatch);
          setConfidence(Math.round(bestSimilarity * 100));
          setScanState('already');
          Vibration.vibrate(200);
          setTimeout(() => setScanState('ready'), 3000);
          return;
        }
        setPendingEmployee(bestMatch);
        setPendingConfidence(Math.round(bestSimilarity * 100));
        setScanState('liveness');
      } else {
        setScanState('unknown');
        Vibration.vibrate([0, 200, 100, 200]);
        setTimeout(() => setScanState('ready'), 3000);
      }
    } catch (e) {
      console.error('Scan error:', e);
      setScanState('ready');
    }
  };

  const handleLivenessResult = async (result: {
    passed: boolean;
    score: number;
    challenge: string;
  }) => {
    if (!pendingEmployee) return;

    if (!result.passed) {
      setScanState('unknown');
      setTimeout(() => setScanState('ready'), 3000);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await saveAttendanceRecord({
      id: `att_${Date.now()}`,
      userId: pendingEmployee.userId,
      name: pendingEmployee.name,
      employeeId: pendingEmployee.employeeId,
      department: pendingEmployee.department,
      timestamp: new Date().toISOString(),
      date: today,
      confidence: pendingConfidence,
      livenessScore: result.score,
      synced: false,
    });

    setMatchedEmployee(pendingEmployee);
    setConfidence(pendingConfidence);
    setScanState('success');
    Vibration.vibrate(500);
    setTimeout(() => {
      setScanState('ready');
      setMatchedEmployee(null);
      setPendingEmployee(null);
    }, 4000);
  };

  if (scanState === 'liveness' && pendingEmployee) {
    return (
      <LivenessScreen
        onResult={handleLivenessResult}
        onCancel={() => setScanState('ready')}
      />
    );
  }

  if (!hasPermission || !device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const frameColor =
    scanState === 'success' ? '#00E676' :
    scanState === 'already' ? '#FFAB00' :
    scanState === 'unknown' ? '#FF1744' :
    scanState === 'scanning' ? '#FFAB00' :
    '#00E5FF';

  const statusText =
    scanState === 'ready' ? t('positionFace') :
    scanState === 'scanning' ? t('identifying') :
    scanState === 'success' ? `✓ ${matchedEmployee?.name}` :
    scanState === 'already' ? `${matchedEmployee?.name} — ${t('alreadyMarked')}` :
    scanState === 'unknown' ? t('notRecognized') :
    scanState === 'noemployees' ? 'No employees enrolled yet' :
    '';

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.topBar}>
        <Text style={styles.appName}>PEHCHAN</Text>
        <Text style={styles.scanLabel}>{t('markAttendance')}</Text>
      </View>

      <View style={styles.frameContainer}>
        <View style={[styles.faceFrame, {borderColor: frameColor}]}>
          <View style={[styles.corner, styles.cTL, {borderColor: frameColor}]} />
          <View style={[styles.corner, styles.cTR, {borderColor: frameColor}]} />
          <View style={[styles.corner, styles.cBL, {borderColor: frameColor}]} />
          <View style={[styles.corner, styles.cBR, {borderColor: frameColor}]} />
        </View>
        {scanState === 'scanning' && (
          <ActivityIndicator style={styles.spinner} color={frameColor} size="large" />
        )}
        {scanState === 'success' && <Text style={styles.resultIcon}>✓</Text>}
        {scanState === 'unknown' && <Text style={styles.resultIcon}>✗</Text>}
      </View>

      <View style={styles.bottomPanel}>
        <Text style={[
          styles.statusText,
          scanState === 'success' && {color: '#00E676'},
          scanState === 'unknown' && {color: '#FF1744'},
          scanState === 'already' && {color: '#FFAB00'},
        ]}>
          {statusText}
        </Text>

        {scanState === 'success' && matchedEmployee && (
          <View style={styles.successCard}>
            <View style={styles.successAvatar}>
              <Text style={styles.successAvatarText}>
                {matchedEmployee.name.charAt(0)}
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.successName}>{matchedEmployee.name}</Text>
              <Text style={styles.successDept}>
                {matchedEmployee.department} · {matchedEmployee.designation}
              </Text>
              <Text style={styles.successId}>ID: {matchedEmployee.employeeId}</Text>
            </View>
            <Text style={styles.successConfidence}>{confidence}%</Text>
          </View>
        )}

        {scanState === 'ready' && (
          <TouchableOpacity
            style={[styles.scanBtn, !tfReady && styles.scanBtnDisabled]}
            onPress={handleScan}
            disabled={!tfReady}>
            <Text style={styles.scanBtnText}>
              {tfReady ? `📷  ${t('scanFace')}` : t('loading')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const CORNER = 20;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  centered: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#050508', gap: 16,
  },
  permText: {color: '#AAA', fontSize: 16},
  permBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  permBtnText: {color: '#000', fontWeight: 'bold'},
  topBar: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 52, paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center', gap: 4,
  },
  appName: {color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 4},
  scanLabel: {color: '#555', fontSize: 12, letterSpacing: 1},
  frameContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  faceFrame: {
    width: 240, height: 300, borderRadius: 140,
    borderWidth: 1, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER, height: CORNER,
    borderWidth: 3,
  },
  cTL: {top: 20, left: 20, borderBottomWidth: 0, borderRightWidth: 0},
  cTR: {top: 20, right: 20, borderBottomWidth: 0, borderLeftWidth: 0},
  cBL: {bottom: 20, left: 20, borderTopWidth: 0, borderRightWidth: 0},
  cBR: {bottom: 20, right: 20, borderTopWidth: 0, borderLeftWidth: 0},
  spinner: {position: 'absolute'},
  resultIcon: {position: 'absolute', fontSize: 64, color: '#FFF'},
  bottomPanel: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 16,
  },
  statusText: {
    color: '#FFF', fontSize: 16,
    textAlign: 'center', fontWeight: '500',
  },
  successCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(0,230,118,0.3)',
  },
  successAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,230,118,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  successAvatarText: {color: '#00E676', fontSize: 22, fontWeight: 'bold'},
  successName: {color: '#FFF', fontSize: 16, fontWeight: '700'},
  successDept: {color: '#888', fontSize: 12, marginTop: 2},
  successId: {color: '#00E5FF', fontSize: 11, marginTop: 2},
  successConfidence: {
    color: '#00E676', fontSize: 20, fontWeight: 'bold',
  },
  scanBtn: {
    backgroundColor: '#00E5FF',
    borderRadius: 14, padding: 18,
    alignItems: 'center',
  },
  scanBtnDisabled: {opacity: 0.4},
  scanBtnText: {color: '#000', fontWeight: '800', fontSize: 16},
});

export default AttendanceScreen;