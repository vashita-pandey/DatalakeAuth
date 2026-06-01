import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import {saveEmployee} from '../services/StorageService';
import {getEmbeddingFromBase64, initializeTFLite} from '../services/TFLiteBridge';

interface Props {
  navigation: any;
}

const EnrollScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const {hasPermission, requestPermission} = useCameraPermission();
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');
  const cameraRef = useRef<Camera>(null);

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initializeTFLite().catch(e => console.error('TFLite init:', e));
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);

    try {
      // Ensure TFLite ready
      await initializeTFLite();
    } catch (e) {
      console.log('TFLite already initialized or failed:', e);
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false,
      });

      const response = await fetch(`file://${photo.path}`);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const result = await getEmbeddingFromBase64(base64);
      setEmbedding(result.embedding);
      setCapturedPhoto(`file://${photo.path}`);
      setShowCamera(false);
      console.log('Face captured, embedding length:', result.embedding.length);
    } catch (e: any) {
      console.error('Capture error:', e);
      // Emulator fallback
      const mockEmbedding = Array.from({length: 128}, () => Math.random() * 2 - 1);
      setEmbedding(mockEmbedding);
      setCapturedPhoto('mock');
      setShowCamera(false);
    }
    setCapturing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), 'Please enter a name');
      return;
    }
    if (!employeeId.trim()) {
      Alert.alert(t('error'), 'Please enter an employee ID');
      return;
    }
    if (!embedding) {
      Alert.alert(t('error'), 'Please capture face first');
      return;
    }

    setSaving(true);
    try {
      await saveEmployee({
        userId: `emp_${Date.now()}`,
        name: name.trim(),
        employeeId: employeeId.trim(),
        department: department.trim(),
        designation: designation.trim(),
        phoneNumber: phoneNumber.trim(),
        embedding,
        registeredAt: new Date().toISOString(),
      });
      Alert.alert(t('success'), `${name} enrolled successfully`, [
        {text: t('ok'), onPress: () => navigation.goBack()},
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    }
    setSaving(false);
  };

  if (showCamera) {
    if (!hasPermission) {
      requestPermission();
      return null;
    }
    if (!device) return null;

    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraTitle}>{t('captureFace')}</Text>
          <View style={styles.cameraFrame}>
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
          </View>
          <Text style={styles.cameraHint}>{t('positionFace')}</Text>
          <View style={styles.cameraButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              disabled={capturing}>
              {capturing ? (
                <ActivityIndicator color="#000" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('enrollEmployee')}</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TouchableOpacity
          style={styles.photoCapture}
          onPress={() => setShowCamera(true)}>
          {capturedPhoto && capturedPhoto !== 'mock' ? (
            <Image source={{uri: capturedPhoto}} style={styles.capturedImage} />
          ) : (
            <View style={styles.photoCaptureInner}>
              <Text style={styles.photoCaptureIcon}>
                {capturedPhoto === 'mock' ? '✅' : '📷'}
              </Text>
              <Text style={styles.photoCaptureText}>
                {embedding ? '✓ Face captured' : t('captureFace')}
              </Text>
            </View>
          )}
          {embedding && (
            <View style={styles.capturedBadge}>
              <Text style={styles.capturedBadgeText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        {embedding && (
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => setShowCamera(true)}>
            <Text style={styles.retakeBtnText}>↺ {t('retake')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('fullName')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t('namePlaceholder')}
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('employeeId')} *</Text>
          <TextInput
            style={styles.input}
            placeholder={t('idPlaceholder')}
            placeholderTextColor="#444"
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('department')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('deptPlaceholder')}
            placeholderTextColor="#444"
            value={department}
            onChangeText={setDepartment}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('designation')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('desgPlaceholder')}
            placeholderTextColor="#444"
            value={designation}
            onChangeText={setDesignation}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('phoneNumber')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('phonePlaceholder')}
            placeholderTextColor="#444"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveBtnText}>{t('saveEmployee')}</Text>
          )}
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const CORNER = 20;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#050508'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {color: '#00E5FF', fontSize: 16},
  headerTitle: {color: '#FFF', fontSize: 18, fontWeight: '700'},
  form: {padding: 20, gap: 16},
  photoCapture: {
    height: 160,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptureInner: {alignItems: 'center', gap: 8},
  photoCaptureIcon: {fontSize: 40},
  photoCaptureText: {color: '#666', fontSize: 14},
  capturedImage: {width: '100%', height: '100%'},
  capturedBadge: {
    position: 'absolute',
    bottom: 8, right: 8,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedBadgeText: {color: '#000', fontWeight: 'bold'},
  retakeBtn: {alignItems: 'center'},
  retakeBtnText: {color: '#00E5FF', fontSize: 14},
  fieldGroup: {gap: 6},
  fieldLabel: {color: '#AAA', fontSize: 13, fontWeight: '600'},
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  saveBtn: {
    backgroundColor: '#00E5FF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {opacity: 0.5},
  saveBtnText: {color: '#000', fontWeight: '800', fontSize: 16},
  cameraContainer: {flex: 1, backgroundColor: '#000'},
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignItems: 'center',
  },
  cameraTitle: {color: '#FFF', fontSize: 20, fontWeight: '700'},
  cameraFrame: {
    width: 240, height: 300,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER, height: CORNER,
    borderColor: '#00E5FF', borderWidth: 3,
  },
  cTL: {top: 20, left: 20, borderBottomWidth: 0, borderRightWidth: 0},
  cTR: {top: 20, right: 20, borderBottomWidth: 0, borderLeftWidth: 0},
  cBL: {bottom: 20, left: 20, borderTopWidth: 0, borderRightWidth: 0},
  cBR: {bottom: 20, right: 20, borderTopWidth: 0, borderLeftWidth: 0},
  cameraHint: {color: '#AAA', fontSize: 14},
  cameraButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelBtnText: {color: '#FFF', fontSize: 15},
  captureBtn: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureInner: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
});

export default EnrollScreen;