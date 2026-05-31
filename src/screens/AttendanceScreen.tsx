import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  getAllAttendanceRecords,
  clearAllData,
  AttendanceRecord,
} from '../services/StorageService';

interface Props {
  onBack: () => void;
}

const AttendanceScreen: React.FC<Props> = ({onBack}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await getAllAttendanceRecords();
    setRecords(data.reverse()); // newest first
  };

  const handleClear = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all attendance records and registered faces.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            setRecords([]);
          },
        },
      ],
    );
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const renderItem = ({item}: {item: AttendanceRecord}) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={[styles.dot, item.synced ? styles.dotSynced : styles.dotPending]} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardTime}>{formatTime(item.timestamp)}</Text>
        <View style={styles.cardMetrics}>
          <Text style={styles.metric}>Match: {item.confidence}%</Text>
          <Text style={styles.metricDivider}>·</Text>
          <Text style={styles.metric}>Liveness: {item.livenessScore}%</Text>
          <Text style={styles.metricDivider}>·</Text>
          <Text style={[styles.syncBadge, item.synced ? styles.synced : styles.pending]}>
            {item.synced ? 'Synced' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Attendance Log</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{records.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {records.filter(r => !r.synced).length}
          </Text>
          <Text style={styles.statLabel}>Pending Sync</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {records.filter(r => r.synced).length}
          </Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>
      </View>

      {/* List */}
      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No attendance records yet</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {color: '#00ff88', fontSize: 16},
  title: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  clearButton: {color: '#ff4444', fontSize: 16},
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {color: '#00ff88', fontSize: 28, fontWeight: 'bold'},
  statLabel: {color: '#888', fontSize: 12, marginTop: 4},
  list: {paddingHorizontal: 16, paddingBottom: 40},
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardLeft: {marginRight: 12},
  dot: {width: 10, height: 10, borderRadius: 5},
  dotSynced: {backgroundColor: '#00ff88'},
  dotPending: {backgroundColor: '#ffaa00'},
  cardBody: {flex: 1},
  cardName: {color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4},
  cardTime: {color: '#666', fontSize: 12, marginBottom: 6},
  cardMetrics: {flexDirection: 'row', alignItems: 'center', gap: 6},
  metric: {color: '#aaa', fontSize: 12},
  metricDivider: {color: '#444', fontSize: 12},
  syncBadge: {fontSize: 11, fontWeight: 'bold', paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4},
  synced: {backgroundColor: '#0a2a1a', color: '#00ff88'},
  pending: {backgroundColor: '#2a1a00', color: '#ffaa00'},
  empty: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyIcon: {fontSize: 48, marginBottom: 16},
  emptyText: {color: '#666', fontSize: 16},
});

export default AttendanceScreen;