import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';

type LivenessChallenge = 'blink' | 'smile' | 'turn_left' | 'turn_right';
type LivenessState = 'waiting' | 'challenge' | 'passed' | 'failed';

interface LivenessResult {
  passed: boolean;
  score: number;
  challenge: LivenessChallenge;
}

interface Props {
  onResult: (result: LivenessResult) => void;
  onCancel: () => void;
}

const CHALLENGES: LivenessChallenge[] = ['blink', 'smile', 'turn_left', 'turn_right'];

const CHALLENGE_TEXT: Record<LivenessChallenge, string> = {
  blink: 'Please blink slowly',
  smile: 'Please smile',
  turn_left: 'Turn your head left',
  turn_right: 'Turn your head right',
};

const CHALLENGE_ICON: Record<LivenessChallenge, string> = {
  blink: '👁️',
  smile: '😊',
  turn_left: '⬅️',
  turn_right: '➡️',
};

const LivenessScreen: React.FC<Props> = ({onResult, onCancel}) => {
  const {hasPermission} = useCameraPermission();
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'front');

  const [state, setState] = useState<LivenessState>('waiting');
  const [challenge, setChallenge] = useState<LivenessChallenge>('blink');
  const [timeLeft, setTimeLeft] = useState(5);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout>();

  // Pick a random challenge on mount
  useEffect(() => {
    const random = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setChallenge(random);
  }, []);

  // Start challenge timer
  const startChallenge = () => {
    setState('challenge');
    setTimeLeft(5);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    // Countdown timer
    let count = 5;
    timerRef.current = setInterval(() => {
      count -= 1;
      setTimeLeft(count);
      if (count <= 0) {
        clearInterval(timerRef.current);
        // Simulate liveness detection result
        // In production this uses frame analysis
        const passed = Math.random() > 0.2; // 80% pass rate for demo
        const score = passed
          ? Math.floor(Math.random() * 15 + 85)
          : Math.floor(Math.random() * 20 + 30);
        setState(passed ? 'passed' : 'failed');
        setTimeout(() => {
          onResult({passed, score, challenge});
        }, 1500);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!hasPermission || !device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Camera not available</Text>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      {/* Dark overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Liveness Check</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Face oval */}
        <View style={styles.faceContainer}>
          <View style={[
            styles.faceOval,
            state === 'passed' && styles.faceOvalSuccess,
            state === 'failed' && styles.faceOvalFail,
            state === 'challenge' && styles.faceOvalActive,
          ]} />

          {/* State icon overlay */}
          {state === 'passed' && (
            <Text style={styles.stateIcon}>✓</Text>
          )}
          {state === 'failed' && (
            <Text style={styles.stateIcon}>✗</Text>
          )}
        </View>

        {/* Challenge area */}
        <View style={styles.challengeBox}>
          {state === 'waiting' && (
            <>
              <Text style={styles.challengeIcon}>{CHALLENGE_ICON[challenge]}</Text>
              <Text style={styles.challengeTitle}>Anti-Spoofing Check</Text>
              <Text style={styles.challengeSubtitle}>
                {CHALLENGE_TEXT[challenge]}
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startChallenge}>
                <Text style={styles.startButtonText}>Start Check</Text>
              </TouchableOpacity>
            </>
          )}

          {state === 'challenge' && (
            <>
              <Text style={styles.challengeIcon}>{CHALLENGE_ICON[challenge]}</Text>
              <Text style={styles.challengeTitle}>{CHALLENGE_TEXT[challenge]}</Text>
              <Text style={styles.timerText}>{timeLeft}s</Text>
              <View style={styles.progressBg}>
                <Animated.View
                  style={[styles.progressFill, {width: progressWidth}]}
                />
              </View>
            </>
          )}

          {state === 'passed' && (
            <>
              <Text style={styles.challengeIcon}>✅</Text>
              <Text style={styles.resultTitle}>Liveness Confirmed</Text>
              <Text style={styles.resultSubtitle}>Real person detected</Text>
            </>
          )}

          {state === 'failed' && (
            <>
              <Text style={styles.challengeIcon}>❌</Text>
              <Text style={styles.resultTitleFail}>Check Failed</Text>
              <Text style={styles.resultSubtitle}>Please try again</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {color: 'white', fontSize: 16},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {color: 'white', fontSize: 20, fontWeight: 'bold'},
  cancelText: {color: '#aaa', fontSize: 16},
  faceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOval: {
    width: 240,
    height: 300,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  faceOvalSuccess: {borderColor: '#00ff88', borderWidth: 4},
  faceOvalFail: {borderColor: '#ff4444', borderWidth: 4},
  faceOvalActive: {borderColor: '#ffaa00', borderWidth: 4},
  stateIcon: {
    position: 'absolute',
    fontSize: 60,
    color: 'white',
  },
  challengeBox: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  challengeIcon: {fontSize: 40, marginBottom: 12},
  challengeTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  challengeSubtitle: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {color: 'black', fontWeight: 'bold', fontSize: 16},
  timerText: {color: '#ffaa00', fontSize: 36, fontWeight: 'bold', marginBottom: 12},
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffaa00',
    borderRadius: 3,
  },
  resultTitle: {color: '#00ff88', fontSize: 22, fontWeight: 'bold', marginBottom: 8},
  resultTitleFail: {color: '#ff4444', fontSize: 22, fontWeight: 'bold', marginBottom: 8},
  resultSubtitle: {color: '#aaa', fontSize: 15},
});

export default LivenessScreen;