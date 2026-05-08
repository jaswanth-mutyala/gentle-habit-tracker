import { useDatabase } from '../contexts/DatabaseContext';

export function useDatabaseInit() {
  const { db, isReady } = useDatabase();
  return { db, isReady };
}
