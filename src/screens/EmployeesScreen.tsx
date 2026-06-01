import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {getAllEmployees, deleteEmployee, Employee} from '../services/StorageService';

interface Props {
  navigation: any;
}

const EmployeesScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, []),
  );

  const loadEmployees = async () => {
    const data = await getAllEmployees();
    setEmployees(data.reverse());
  };

  const filtered = employees.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (employee: Employee) => {
    Alert.alert(t('deleteEmployee'), t('deleteConfirm'), [
      {text: t('cancel'), style: 'cancel'},
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteEmployee(employee.userId);
          loadEmployees();
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: Employee}) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.id}>ID: {item.employeeId}</Text>
        {item.department ? (
          <Text style={styles.dept}>{item.department}
            {item.designation ? ` · ${item.designation}` : ''}
          </Text>
        ) : null}
        <Text style={styles.date}>
          Enrolled: {new Date(item.registeredAt).toLocaleDateString('en-IN')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('allEmployees')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('Enroll')}>
          <Text style={styles.addBtnText}>+ Enroll</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchEmployees')}
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={styles.count}>
        {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
        {search ? ' found' : ' enrolled'}
      </Text>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>
            {search ? 'No employees match your search' : t('noEmployees')}
          </Text>
          {!search && (
            <TouchableOpacity
              style={styles.enrollBtn}
              onPress={() => navigation.navigate('Enroll')}>
              <Text style={styles.enrollBtnText}>{t('enrollFirst')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  },
  title: {color: '#FFF', fontSize: 22, fontWeight: '800'},
  addBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {color: '#000', fontWeight: '700', fontSize: 14},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  searchIcon: {fontSize: 16, marginRight: 8},
  searchInput: {flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 12},
  clearSearch: {color: '#555', fontSize: 16, padding: 4},
  count: {
    color: '#555', fontSize: 12,
    paddingHorizontal: 20, marginBottom: 8,
  },
  list: {paddingHorizontal: 20, paddingBottom: 80},
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  avatar: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {color: '#00E5FF', fontSize: 20, fontWeight: 'bold'},
  info: {flex: 1},
  name: {color: '#FFF', fontSize: 16, fontWeight: '600'},
  id: {color: '#00E5FF', fontSize: 12, marginTop: 2},
  dept: {color: '#888', fontSize: 12, marginTop: 2},
  date: {color: '#444', fontSize: 11, marginTop: 4},
  deleteBtn: {padding: 8},
  deleteBtnText: {fontSize: 20},
  empty: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 12,
  },
  emptyIcon: {fontSize: 56},
  emptyText: {color: '#555', fontSize: 15, textAlign: 'center'},
  enrollBtn: {
    borderWidth: 1, borderColor: '#00E5FF',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, marginTop: 8,
  },
  enrollBtnText: {color: '#00E5FF', fontSize: 14},
});

export default EmployeesScreen;