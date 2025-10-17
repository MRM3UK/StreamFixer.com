import type { Express } from "express";
import { createServer, type Server } from "http";

// StreamFixer is a client-side application using localStorage
// No API routes are required - all data operations happen in the browser

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  return httpServer;
}
