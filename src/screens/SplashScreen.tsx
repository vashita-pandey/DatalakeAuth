import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

interface Props {
  onFinish: () => void;
}

const SplashScreen: React.FC<Props> = ({onFinish}) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Animated.View
        style={[
          styles.content,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>👁️</Text>
            </View>
          </View>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cTL]} />
          <View style={[styles.corner, styles.cTR]} />
          <View style={[styles.corner, styles.cBL]} />
          <View style={[styles.corner, styles.cBR]} />
        </View>

        {/* App name */}
        <Text style={styles.appName}>PEHCHAN</Text>
        <View style={styles.divider} />
        <Text style={styles.acronym}>
          <Text style={styles.letter}>P</Text>ersonnel{' '}
          <Text style={styles.letter}>E</Text>ntry &{' '}
          <Text style={styles.letter}>H</Text>uman-resource{'\n'}
          <Text style={styles.letter}>C</Text>heck-in through{' '}
          <Text style={styles.letter}>H</Text>ybrid{' '}
          <Text style={styles.letter}>A</Text>I{' '}
          <Text style={styles.letter}>N</Text>etwork
        </Text>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[styles.dot, i === 1 && styles.dotActive]}
            />
          ))}
        </View>

        <Text style={styles.tagline}>Powered by On-Device AI</Text>
      </Animated.View>

      {/* Bottom branding */}
      <Text style={styles.bottomText}>Ministry of Field Operations</Text>
    </View>
  );
};

const CORNER = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0,229,255,0.03)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0,230,118,0.03)',
    bottom: -50,
    left: -50,
  },
  content: {alignItems: 'center', gap: 16},
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,229,255,0.05)',
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {fontSize: 32},
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#00E5FF',
    borderWidth: 2,
  },
  cTL: {top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0},
  cTR: {top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0},
  cBL: {bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0},
  cBR: {bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0},
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#00E5FF',
    borderRadius: 1,
  },
  acronym: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  letter: {color: '#00E5FF', fontWeight: 'bold'},
  dotsRow: {flexDirection: 'row', gap: 8, marginTop: 8},
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
  },
  dotActive: {backgroundColor: '#00E5FF', width: 20},
  tagline: {color: '#333', fontSize: 11, letterSpacing: 2},
  bottomText: {
    position: 'absolute',
    bottom: 40,
    color: '#222',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default SplashScreen;