import NetInfo from '@react-native-community/netinfo';
import {
  getUnsyncedRecords,
  markAsSyncedAndPurge,
} from './StorageService';
import {uploadAttendanceRecords} from './FirebaseService';

// Check if device is online
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

// Subscribe to network changes
export function subscribeToNetwork(
  callback: (online: boolean) => void,
): () => void {
  const unsubscribe = NetInfo.addEventListener(state => {
    callback(state.isConnected === true && state.isInternetReachable === true);
  });
  return unsubscribe;
}

// Main sync function
export async function syncPendingRecords(): Promise<{
  synced: number;
  failed: number;
  message: string;
}> {
  const online = await isOnline();
  if (!online) {
    return {synced: 0, failed: 0, message: 'No network connection'};
  }

  const pending = await getUnsyncedRecords();
  if (pending.length === 0) {
    return {synced: 0, failed: 0, message: 'No pending records'};
  }

  console.log(`Syncing ${pending.length} records to Firestore...`);

  const {success, failed} = await uploadAttendanceRecords(pending);

  if (success > 0) {
    const ids = pending.slice(0, success).map(r => r.id);
    await markAsSyncedAndPurge(ids);
  }

  return {
    synced: success,
    failed,
    message: `Synced ${success} records to Firebase${failed > 0 ? `, ${failed} failed` : ''}`,
  };
}