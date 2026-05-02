import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { SummaryActivity } from '@strava/index';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private readonly DB_NAME = 'pace-ops-db';
  private readonly STORE_NAME = 'activities';
  private readonly DB_VERSION = 1;

  private async getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('activities')) {
            db.createObjectStore('activities', { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  public async saveActivities(activities: SummaryActivity[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    for (const activity of activities) {
      await store.put(activity);
    }
    await tx.done;
  }

  public async getActivities(): Promise<SummaryActivity[]> {
    const db = await this.getDB();
    return db.getAll(this.STORE_NAME);
  }

  public async clearActivities(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    await tx.objectStore(this.STORE_NAME).clear();
    await tx.done;
  }
}
