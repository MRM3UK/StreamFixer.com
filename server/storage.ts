// StreamFixer uses localStorage for client-side persistence
// No server-side storage is required for this application
// All playlist and channel management happens in the browser

export interface IStorage {}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
