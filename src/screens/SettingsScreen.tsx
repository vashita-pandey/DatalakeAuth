import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {saveLanguage, getLanguage, clearAllData} from '../services/StorageService';
import {syncPendingRecords} from '../services/SyncService';
import i18n from '../i18n';

interface Props {
  navigation: any;
}

const SettingsScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [language, setLanguage] = useState('en');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getLanguage().then(lang => setLanguage(lang));
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    await saveLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncPendingRecords();
    setIsSyncing(false);
    Alert.alert(t('syncStatus'), result.message);
  };

  const handleClearData = () => {
    Alert.alert(t('clearData'), t('clearConfirm'), [
      {text: t('cancel'), style: 'cancel'},
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          Alert.alert(t('success'), 'All data cleared');
        },
      },
    ]);
  };

  const Section = ({title}: {title: string}) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const Row = ({
    icon, label, value, onPress, danger, rightElement,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !rightElement}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {rightElement}
      {onPress && !rightElement && (
        <Text style={styles.rowArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App branding */}
        <View style={styles.brandCard}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandLogoText}>👁️</Text>
          </View>
          <Text style={styles.brandName}>PEHCHAN</Text>
          <Text style={styles.brandFull}>
            Personnel Entry & Human-resource{'\n'}
            Check-in through Hybrid AI Network
          </Text>
          <Text style={styles.brandVersion}>Version 1.0.0</Text>
        </View>

        {/* Language */}
        <Section title={t('language')} />
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.langOption,
              language === 'en' && styles.langOptionActive]}
            onPress={() => handleLanguageChange('en')}>
            <Text style={styles.langFlag}>🇬🇧</Text>
            <Text style={[styles.langLabel,
              language === 'en' && styles.langLabelActive]}>
              {t('english')}
            </Text>
            {language === 'en' && <Text style={styles.langCheck}>✓</Text>}
          </TouchableOpacity>
          <View style={styles.langDivider} />
          <TouchableOpacity
            style={[styles.langOption,
              language === 'hi' && styles.langOptionActive]}
            onPress={() => handleLanguageChange('hi')}>
            <Text style={styles.langFlag}>🇮🇳</Text>
            <Text style={[styles.langLabel,
              language === 'hi' && styles.langLabelActive]}>
              {t('hindi')}
            </Text>
            {language === 'hi' && <Text style={styles.langCheck}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Sync */}
        <Section title={t('syncStatus')} />
        <View style={styles.card}>
          <Row
            icon="☁️"
            label={isSyncing ? 'Syncing...' : t('syncNow')}
            onPress={handleSync}
          />
        </View>

        {/* Navigation shortcuts */}
        <Section title="Quick Access" />
        <View style={styles.card}>
          <Row
            icon="📊"
            label="Performance Benchmark"
            onPress={() => navigation.navigate('Benchmark')}
          />
          <View style={styles.divider} />
          <Row
            icon="📋"
            label={t('attendanceLog')}
            onPress={() => navigation.navigate('AttendanceLog')}
          />
          <View style={styles.divider} />
          <Row
            icon="👥"
            label={t('allEmployees')}
            onPress={() => navigation.navigate('Employees')}
          />
        </View>

        {/* Danger zone */}
        <Section title="Danger Zone" />
        <View style={styles.card}>
          <Row
            icon="🗑️"
            label={t('clearData')}
            onPress={handleClearData}
            danger
          />
        </View>

        {/* About */}
        <Section title={t('about')} />
        <View style={styles.card}>
          <Row icon="📱" label={t('version')} value="1.0.0" />
          <View style={styles.divider} />
          <Row icon="🔓" label="License" value="MIT" />
          <View style={styles.divider} />
          <Row icon="🤖" label="AI Models" value="TFLite 2.12" />
          <View style={styles.divider} />
          <Row icon="📦" label="Framework" value="React Native 0.74" />
        </View>

        <Text style={styles.footer}>
          Built for Hackathon 7.0 · All processing on-device
        </Text>

        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#050508'},
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  title: {color: '#FFF', fontSize: 22, fontWeight: '800'},
  brandCard: {
    margin: 20,
    backgroundColor: '#0D1F2D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    gap: 8,
  },
  brandLogo: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1, borderColor: '#00E5FF',
    justifyContent: 'center', alignItems: 'center',
  },
  brandLogoText: {fontSize: 28},
  brandName: {
    color: '#FFF', fontSize: 24,
    fontWeight: '900', letterSpacing: 4,
  },
  brandFull: {
    color: '#555', fontSize: 11,
    textAlign: 'center', lineHeight: 18,
  },
  brandVersion: {color: '#333', fontSize: 11},
  sectionTitle: {
    color: '#444', fontSize: 11,
    fontWeight: '700', letterSpacing: 1,
    paddingHorizontal: 20, marginBottom: 8,
    marginTop: 8, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowIcon: {fontSize: 20},
  rowLabel: {flex: 1, color: '#FFF', fontSize: 15},
  rowLabelDanger: {color: '#FF1744'},
  rowValue: {color: '#555', fontSize: 14},
  rowArrow: {color: '#444', fontSize: 18},
  divider: {height: 1, backgroundColor: '#2A2A2A', marginHorizontal: 16},
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, gap: 12,
  },
  langOptionActive: {backgroundColor: 'rgba(0,229,255,0.05)'},
  langFlag: {fontSize: 24},
  langLabel: {flex: 1, color: '#AAA', fontSize: 15},
  langLabelActive: {color: '#00E5FF', fontWeight: '600'},
  langCheck: {color: '#00E5FF', fontSize: 18, fontWeight: 'bold'},
  langDivider: {height: 1, backgroundColor: '#2A2A2A', marginHorizontal: 16},
  footer: {
    color: '#2A2A2A', fontSize: 11,
    textAlign: 'center', marginTop: 8,
  },
});

export default SettingsScreen;