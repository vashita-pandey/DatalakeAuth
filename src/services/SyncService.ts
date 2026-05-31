import NetInfo from '@react-native-community/netinfo';
import {
  getUnsyncedRecords,
  markAsSyncedAndPurge,
  AttendanceRecord,
} from './StorageService';

// AWS API endpoint — replace with your actual endpoint in production
const AWS_ENDPOINT = 'https://your-api-gateway-url.amazonaws.com/prod/attendance';

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

// Upload a batch of records to AWS
async function uploadRecords(records: AttendanceRecord[]): Promise<boolean> {
  try {
    const response = await fetch(AWS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production: add Cognito JWT token here
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        records: records.map(r => ({
          id: r.id,
          userId: r.userId,
          name: r.name,
          timestamp: r.timestamp,
          confidence: r.confidence,
          livenessScore: r.livenessScore,
        })),
        deviceId: 'device_001', // replace with actual device ID
        syncedAt: new Date().toISOString(),
      }),
    });
    return response.ok;
  } catch (e) {
    console.error('Upload failed:', e);
    return false;
  }
}

// Main sync function — call this when network is restored
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

  console.log(`Syncing ${pending.length} records to AWS...`);

  // Upload in batches of 10
  const batchSize = 10;
  let synced = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += batchSize) {
    const batch = pending.slice(i, i + batchSize);
    const success = await uploadRecords(batch);

    if (success) {
      const ids = batch.map(r => r.id);
      await markAsSyncedAndPurge(ids);
      synced += batch.length;
    } else {
      failed += batch.length;
    }
  }

  return {
    synced,
    failed,
    message: `Synced ${synced} records, ${failed} failed`,
  };
}