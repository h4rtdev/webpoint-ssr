import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readFromDatabase<T>(file: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeToDatabase<T>(file: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

export const DATABASE = {
  PRODUCTS_FILE: 'products.json',
  USERS_FILE: 'users.json',
  ORDERS_FILE: 'orders.json',
};
