import { db, doc, getDoc, setDoc, onSnapshot } from '../lib/firebase';
import { TaskItem, DailyReport, ViewerFeedback, normalizeCategory } from '../types';

export interface CloudAppData {
  tasks: TaskItem[];
  dailyReports: DailyReport[];
  feedbacks: ViewerFeedback[];
  updatedAt: string;
}

const SHARED_DOC_REF = doc(db, 'sharedState', 'appData');

/**
 * Subscribe to real-time changes in Firestore
 */
export function subscribeToCloudData(
  onData: (data: {
    tasks?: TaskItem[];
    dailyReports?: DailyReport[];
    feedbacks?: ViewerFeedback[];
    updatedAt?: string;
  }) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const unsubscribe = onSnapshot(
      SHARED_DOC_REF,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<CloudAppData>;
          const normalizedTasks = data.tasks
            ? data.tasks.map((t) => ({
                ...t,
                category: normalizeCategory(t.category),
              }))
            : undefined;

          onData({
            tasks: normalizedTasks,
            dailyReports: data.dailyReports,
            feedbacks: data.feedbacks,
            updatedAt: data.updatedAt,
          });
        } else {
          // Document does not exist yet
          onData({});
        }
      },
      (error) => {
        console.warn('Firestore snapshot listener error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to subscribe to Firestore:', error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Fetch initial cloud data once
 */
export async function getCloudData(): Promise<{
  tasks?: TaskItem[];
  dailyReports?: DailyReport[];
  feedbacks?: ViewerFeedback[];
} | null> {
  try {
    const snapshot = await getDoc(SHARED_DOC_REF);
    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<CloudAppData>;
      return {
        tasks: data.tasks?.map((t) => ({
          ...t,
          category: normalizeCategory(t.category),
        })),
        dailyReports: data.dailyReports,
        feedbacks: data.feedbacks,
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to read from Firestore:', error);
    return null;
  }
}

/**
 * Save entire state to Firestore Cloud Database
 */
export async function saveCloudData(
  tasks: TaskItem[],
  dailyReports: DailyReport[],
  feedbacks: ViewerFeedback[]
): Promise<boolean> {
  try {
    await setDoc(
      SHARED_DOC_REF,
      {
        tasks,
        dailyReports,
        feedbacks,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save data to Firestore:', error);
    return false;
  }
}
