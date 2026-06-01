import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Employee {
  userId: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  phoneNumber: string;
  embedding: number[];
  registeredAt: string;
  photoBase64?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  employeeId: string;
  department: string;
  timestamp: string;
  date: string; // YYYY-MM-DD for easy filtering
  confidence: number;
  livenessScore: number;
  synced: boolean;
}

const EMPLOYEES_KEY = 'pehchan_employees';
const ATTENDANCE_KEY = 'pehchan_attendance';
const LANGUAGE_KEY = 'pehchan_language';

// ─── Employee Operations ───────────────────────────────────────

export async function saveEmployee(employee: Employee): Promise<void> {
  try {
    const existing = await getAllEmployees();
    const updated = existing.filter(e => e.userId !== employee.userId);
    updated.push(employee);
    await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save employee:', e);
  }
}

export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const data = await AsyncStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function getEmployeeById(userId: string): Promise<Employee | null> {
  const employees = await getAllEmployees();
  return employees.find(e => e.userId === userId) || null;
}

export async function deleteEmployee(userId: string): Promise<void> {
  try {
    const existing = await getAllEmployees();
    const updated = existing.filter(e => e.userId !== userId);
    await AsyncStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete employee:', e);
  }
}

// ─── Attendance Operations ─────────────────────────────────────

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  try {
    const existing = await getAllAttendanceRecords();
    existing.push(record);
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save attendance:', e);
  }
}

export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const data = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const all = await getAllAttendanceRecords();
  return all.filter(r => r.date === date);
}

export async function getAttendanceDates(): Promise<string[]> {
  const all = await getAllAttendanceRecords();
  const dates = [...new Set(all.map(r => r.date))];
  return dates.sort().reverse();
}

export async function hasMarkedAttendanceToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const records = await getAttendanceByDate(today);
  return records.some(r => r.userId === userId);
}

export async function getUnsyncedRecords(): Promise<AttendanceRecord[]> {
  const all = await getAllAttendanceRecords();
  return all.filter(r => !r.synced);
}

export async function markAsSyncedAndPurge(ids: string[]): Promise<void> {
  try {
    const all = await getAllAttendanceRecords();
    const updated = all.map(r =>
      ids.includes(r.id) ? {...r, synced: true} : r,
    );
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark synced:', e);
  }
}

// ─── Language ──────────────────────────────────────────────────

export async function saveLanguage(lang: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export async function getLanguage(): Promise<string> {
  const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
  return lang || 'en';
}

// ─── Stats ─────────────────────────────────────────────────────

export async function getTodayStats(): Promise<{
  present: number;
  total: number;
  pending: number;
}> {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = await getAttendanceByDate(today);
  const employees = await getAllEmployees();
  const unsynced = await getUnsyncedRecords();
  return {
    present: todayRecords.length,
    total: employees.length,
    pending: unsynced.length,
  };
}

// ─── Clear All ─────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([EMPLOYEES_KEY, ATTENDANCE_KEY]);
}