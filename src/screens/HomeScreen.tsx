import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {
  getTodayStats,
  getAttendanceByDate,
  AttendanceRecord,
} from '../services/StorageService';
import {subscribeToNetwork, syncPendingRecords} from '../services/SyncService';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [stats, setStats] = useState({present: 0, total: 0, pending: 0});
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const s = await getTodayStats();
    setStats(s);
    const today = new Date().toISOString().split('T')[0];
    const records = await getAttendanceByDate(today);
    setRecentRecords(records.reverse().slice(0, 5));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = subscribeToNetwork(async online => {
      setIsOnline(online);
      if (online) {
        setIsSyncing(true);
        await syncPendingRecords();
        setIsSyncing(false);
        loadData();
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>PEHCHAN</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <View style={[styles.networkBadge,
          isOnline ? styles.online : styles.offline]}>
          <View style={[styles.dot, isOnline ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.networkText}>
            {isSyncing ? 'Syncing...' : t(isOnline ? 'online' : 'offline')}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor="#00E5FF" />
        }>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumber}>{stats.present}</Text>
            <Text style={styles.statLabel}>{t('todayAttendance')}</Text>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View style={styles.statsColumn}>
            <View style={styles.statCardSmall}>
              <Text style={styles.statNumberSmall}>{stats.total}</Text>
              <Text style={styles.statLabelSmall}>{t('totalEmployees')}</Text>
            </View>
            <View style={[styles.statCardSmall, styles.statCardWarning]}>
              <Text style={[styles.statNumberSmall, {color: '#FFAB00'}]}>
                {stats.pending}
              </Text>
              <Text style={styles.statLabelSmall}>{t('pendingSync')}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionLabel}>{t('markAttendance')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Enroll')}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>{t('enrollEmployee')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AttendanceLog')}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionLabel}>{t('attendanceLog')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          {recentRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🕐</Text>
              <Text style={styles.emptyText}>{t('noActivity')}</Text>
            </View>
          ) : (
            recentRecords.map((record, i) => (
              <View key={i} style={styles.recordCard}>
                <View style={styles.recordAvatar}>
                  <Text style={styles.recordAvatarText}>
                    {record.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{record.name}</Text>
                  <Text style={styles.recordDept}>{record.department}</Text>
                </View>
                <View style={styles.recordRight}>
                  <Text style={styles.recordTime}>
                    {new Date(record.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.recordConfidence}>
                    {record.confidence}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{height: 20}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#050508'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  appName: {
    color: '#FFF', fontSize: 24,
    fontWeight: '900', letterSpacing: 4,
  },
  date: {color: '#555', fontSize: 12, marginTop: 2},
  networkBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, gap: 6,
  },
  online: {backgroundColor: 'rgba(0,230,118,0.1)', borderWidth: 1, borderColor: '#00E676'},
  offline: {backgroundColor: 'rgba(255,23,68,0.1)', borderWidth: 1, borderColor: '#FF1744'},
  dot: {width: 6, height: 6, borderRadius: 3},
  dotOn: {backgroundColor: '#00E676'},
  dotOff: {backgroundColor: '#FF1744'},
  networkText: {color: '#FFF', fontSize: 11, fontWeight: '700'},
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1.2,
    backgroundColor: '#0D1F2D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
  },
  statCardPrimary: {},
  statsColumn: {flex: 1, gap: 12},
  statCardSmall: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
  },
  statCardWarning: {
    borderWidth: 1,
    borderColor: 'rgba(255,171,0,0.2)',
  },
  statNumber: {color: '#00E5FF', fontSize: 40, fontWeight: '900'},
  statLabel: {color: '#888', fontSize: 12, marginTop: 4},
  statIcon: {fontSize: 24, position: 'absolute', top: 16, right: 16},
  statNumberSmall: {color: '#FFF', fontSize: 24, fontWeight: 'bold'},
  statLabelSmall: {color: '#666', fontSize: 11, marginTop: 2},
  section: {paddingHorizontal: 20, marginBottom: 24},
  sectionTitle: {
    color: '#FFF', fontSize: 16,
    fontWeight: '700', marginBottom: 12,
  },
  actionsRow: {flexDirection: 'row', gap: 12},
  actionCard: {
    flex: 1, backgroundColor: '#1A1A1A',
    borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  actionIcon: {fontSize: 28},
  actionLabel: {color: '#AAA', fontSize: 11, textAlign: 'center'},
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14, padding: 32,
    alignItems: 'center', gap: 8,
  },
  emptyIcon: {fontSize: 32},
  emptyText: {color: '#555', fontSize: 14},
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 14,
    marginBottom: 8, alignItems: 'center',
  },
  recordAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(0,229,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  recordAvatarText: {color: '#00E5FF', fontSize: 18, fontWeight: 'bold'},
  recordInfo: {flex: 1},
  recordName: {color: '#FFF', fontSize: 15, fontWeight: '600'},
  recordDept: {color: '#666', fontSize: 12, marginTop: 2},
  recordRight: {alignItems: 'flex-end'},
  recordTime: {color: '#AAA', fontSize: 13},
  recordConfidence: {color: '#00E676', fontSize: 12, marginTop: 2},
});

export default HomeScreen;