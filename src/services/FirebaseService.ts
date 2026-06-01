import {initializeApp} from 'firebase/app';
import {
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';
import {AttendanceRecord} from './StorageService';

const firebaseConfig = {
  apiKey: 'AIzaSyBXy_fTsRHP82q4MtL7QUkg1ldjtSUH-Ao',
  authDomain: 'pehchan-305b2.firebaseapp.com',
  projectId: 'pehchan-305b2',
  storageBucket: 'pehchan-305b2.firebasestorage.app',
  messagingSenderId: '948654904351',
  appId: '1:948654904351:web:009cea327d33ccab58b12a',
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

export async function uploadAttendanceRecords(
  records: AttendanceRecord[],
): Promise<{success: number; failed: number}> {
  let success = 0;
  let failed = 0;

  try {
    const batch = writeBatch(db);
    const attendanceRef = collection(db, 'attendance');

    for (const record of records) {
      const docRef = doc(attendanceRef, record.id);
      batch.set(docRef, {
        id: record.id,
        userId: record.userId,
        name: record.name,
        employeeId: record.employeeId,
        department: record.department,
        timestamp: record.timestamp,
        date: record.date,
        confidence: record.confidence,
        livenessScore: record.livenessScore,
        synced: true,
        uploadedAt: new Date().toISOString(),
      });
      success++;
    }

    await batch.commit();
    console.log(`Uploaded ${success} records to Firestore`);
  } catch (e: any) {
    console.error('Firestore upload error:', e.message);
    failed = records.length;
    success = 0;
  }

  return {success, failed};
}

export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = collection(db, 'attendance');
    await getDocs(query(testRef, where('date', '==', 'test')));
    return true;
  } catch (e) {
    return false;
  }
}