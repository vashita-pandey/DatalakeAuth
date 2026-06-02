import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {
  getAttendanceByDate,
  getAttendanceDates,
  getAllAttendanceRecords,
  AttendanceRecord,
} from '../services/StorageService';

interface Props {
  navigation: any;
}

const AttendanceLogScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadDates();
    }, []),
  );

  const loadDates = async () => {
    setLoading(true);
    const all = await getAllAttendanceRecords();
    setTotalRecords(all.length);
    const d = await getAttendanceDates();
    setDates(d);
    if (d.length > 0) {
      setSelectedDate(d[0]);
      const r = await getAttendanceByDate(d[0]);
      setRecords(r);
    } else {
      setRecords([]);
    }
    setLoading(false);
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    const r = await getAttendanceByDate(date);
    setRecords(r);
  };

  const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const renderRecord = ({item}: {item: AttendanceRecord}) => (
    <View style={styles.recordCard}>
      <View style={styles.recordAvatar}>
        <Text style={styles.recordAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordName}>{item.name}</Text>
        <Text style={styles.recordId}>ID: {item.employeeId}</Text>
        {item.department ? (
          <Text style={styles.recordDept}>{item.department}</Text>
        ) : null}
      </View>
      <View style={styles.recordRight}>
        <Text style={styles.recordTime}>{formatTime(item.timestamp)}</Text>
        <Text style={styles.recordConfidence}>{item.confidence}% match</Text>
        <View style={[styles.syncDot,
          item.synced ? styles.syncDotSynced : styles.syncDotPending]} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('attendanceLog')}</Text>
          <View style={{width: 60}} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#00E5FF" size="large" />
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
        <Text style={styles.title}>{t('attendanceLog')}</Text>
        <Text style={styles.totalCount}>{totalRecords} total</Text>
      </View>

      {dates.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>{t('noRecords')}</Text>
          <Text style={styles.emptySubText}>
            Attendance records will appear here after marking attendance
          </Text>
        </View>
      ) : (
        <>
          {/* Date selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}>
            {dates.map(date => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateChip,
                  selectedDate === date && styles.dateChipActive,
                ]}
                onPress={() => handleDateSelect(date)}>
                <Text style={[
                  styles.dateChipText,
                  selectedDate === date && styles.dateChipTextActive,
                ]}>
                  {formatDate(date)}
                </Text>
                <Text style={[
                  styles.dateChipCount,
                  selectedDate === date && styles.dateChipCountActive,
                ]}>
                  {date === selectedDate ? records.length : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected date summary */}
          {records.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{records.length}</Text>
                <Text style={styles.summaryLabel}>{t('present')}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, {color: '#00E676'}]}>
                  {records.filter(r => r.synced).length}
                </Text>
                <Text style={styles.summaryLabel}>{t('synced')}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, {color: '#FFAB00'}]}>
                  {records.filter(r => !r.synced).length}
                </Text>
                <Text style={styles.summaryLabel}>{t('pending')}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, {color: '#AAA'}]}>
                  {Math.round(records.reduce((a, b) => a + b.confidence, 0) / records.length)}%
                </Text>
                <Text style={styles.summaryLabel}>Avg Match</Text>
              </View>
            </View>
          )}

          {/* Records list */}
          {records.length === 0 ? (
            <View style={styles.noRecords}>
              <Text style={styles.emptyIcon}>🗓️</Text>
              <Text style={styles.noRecordsText}>{t('noRecords')}</Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={item => item.id}
              renderItem={renderRecord}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {color: '#00E5FF', fontSize: 16},
  title: {color: '#FFF', fontSize: 18, fontWeight: '700'},
  totalCount: {color: '#555', fontSize: 12},
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  dateScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: 8,
    alignItems: 'center',
  },
  dateChipActive: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderColor: '#00E5FF',
  },
  dateChipText: {color: '#666', fontSize: 13},
  dateChipTextActive: {color: '#00E5FF', fontWeight: '600'},
  dateChipCount: {color: '#444', fontSize: 10, marginTop: 2},
  dateChipCountActive: {color: '#00E5FF'},
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#00E5FF', fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {color: '#666', fontSize: 10, marginTop: 4},
  list: {paddingHorizontal: 20, paddingBottom: 80},
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  recordAvatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordAvatarText: {color: '#00E5FF', fontSize: 18, fontWeight: 'bold'},
  recordInfo: {flex: 1},
  recordName: {color: '#FFF', fontSize: 15, fontWeight: '600'},
  recordId: {color: '#00E5FF', fontSize: 11, marginTop: 2},
  recordDept: {color: '#666', fontSize: 12, marginTop: 2},
  recordRight: {alignItems: 'flex-end', gap: 4},
  recordTime: {color: '#AAA', fontSize: 13, fontWeight: '600'},
  recordConfidence: {color: '#00E676', fontSize: 11},
  syncDot: {width: 8, height: 8, borderRadius: 4},
  syncDotSynced: {backgroundColor: '#00E676'},
  syncDotPending: {backgroundColor: '#FFAB00'},
  empty: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 12, padding: 40,
  },
  emptyIcon: {fontSize: 48},
  emptyText: {color: '#555', fontSize: 15, textAlign: 'center'},
  emptySubText: {color: '#333', fontSize: 12, textAlign: 'center'},
  noRecords: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 8,
  },
  noRecordsText: {color: '#555', fontSize: 15},
});

export default AttendanceLogScreen;