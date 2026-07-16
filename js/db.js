import { openDB } from 'https://unpkg.com/idb?module';

const DB_NAME = 'CurveFinanceDB';
const STORE_NAME = 'transactions';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
}

export async function saveTransactions(transactions) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).clear(); // Clear existing
  for (const t of transactions) {
    await tx.objectStore(STORE_NAME).add(t);
  }
  await tx.done;
}

export async function getAllTransactions() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
