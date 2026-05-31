import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserEmbedding {
  userId: string;
  name: string;
  embedding: number[];
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  timestamp: string;
  confidence: number;
  livenessScore: number;
  synced: boolean;
}

const EMBEDDINGS_KEY = 'face_embeddings';
const ATTENDANCE_KEY = 'attendance_records';

// Save a new face embedding for a user
export async function saveEmbedding(user: UserEmbedding): Promise<void> {
  try {
    const existing = await getAllEmbeddings();
    const updated = existing.filter(e => e.userId !== user.userId);
    updated.push(user);
    await AsyncStorage.setItem(EMBEDDINGS_KEY, JSON.stringify(updated));
    console.log('Embedding saved for:', user.name);
  } catch (e) {
    console.error('Failed to save embedding:', e);
  }
}

// Get all stored face embeddings
export async function getAllEmbeddings(): Promise<UserEmbedding[]> {
  try {
    const data = await AsyncStorage.getItem(EMBEDDINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Save an attendance record
export async function saveAttendanceRecord(
  record: AttendanceRecord,
): Promise<void> {
  try {
    const existing = await getAllAttendanceRecords();
    existing.push(record);
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save attendance:', e);
  }
}

// Get all attendance records
export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const data = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Get unsynced records for AWS upload
export async function getUnsyncedRecords(): Promise<AttendanceRecord[]> {
  const all = await getAllAttendanceRecords();
  return all.filter(r => !r.synced);
}

// Mark records as synced and purge embedding data
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

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([EMBEDDINGS_KEY, ATTENDANCE_KEY]);
}