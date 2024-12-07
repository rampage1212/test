import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface LeaderboardEntry {
  userId: string;
  count: number;
  trend: 'up' | 'down' | 'neutral';
  date: Date;
}

export function useSalesLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up sales leaderboard subscription');
    
    const q = query(
      collection(db, 'sales'),
      orderBy('date', 'desc') // Get most recent entries first
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          // Create a map to aggregate sales per user
          const salesByUser = new Map<string, {
            totalCount: number,
            latestDate: Date
          }>();

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            const count = data.count || 0;
            const date = data.date?.toDate() || new Date();

            const current = salesByUser.get(userId) || {
              totalCount: 0,
              latestDate: date
            };

            salesByUser.set(userId, {
              totalCount: current.totalCount + count,
              latestDate: date > current.latestDate ? date : current.latestDate
            });
          });

          // Convert map to array and sort by total count
          const aggregatedSales = Array.from(salesByUser.entries())
            .map(([userId, data]) => ({
              userId,
              count: data.totalCount,
              trend: 'neutral', // You can implement trend calculation if needed
              date: data.latestDate
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5 users

          console.log('Processed sales data:', aggregatedSales);
          setEntries(aggregatedSales);
          setError(null);
        } catch (err) {
          console.error('Error processing sales data:', err);
          setError('Failed to process sales data');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching sales data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { entries, loading, error };
}

export function useCallLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up calls leaderboard subscription');
    
    const q = query(
      collection(db, 'calls'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          // Create a map to aggregate calls per user
          const callsByUser = new Map<string, {
            totalCount: number,
            latestDate: Date
          }>();

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            const count = data.count || 0;
            const date = data.date?.toDate() || new Date();

            const current = callsByUser.get(userId) || {
              totalCount: 0,
              latestDate: date
            };

            callsByUser.set(userId, {
              totalCount: current.totalCount + count,
              latestDate: date > current.latestDate ? date : current.latestDate
            });
          });

          // Convert map to array and sort by total count
          const aggregatedCalls = Array.from(callsByUser.entries())
            .map(([userId, data]) => ({
              userId,
              count: data.totalCount,
              trend: 'neutral',
              date: data.latestDate
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5 users

          console.log('Processed calls data:', aggregatedCalls);
          setEntries(aggregatedCalls);
          setError(null);
        } catch (err) {
          console.error('Error processing calls data:', err);
          setError('Failed to process calls data');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching calls data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { entries, loading, error };
}