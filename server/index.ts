import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { setupRoutes } from "./routes";
import admin from 'firebase-admin';
import { createServer } from "node:http";
import { setupVite, serveStatic, log } from "./vite";
import setupFirestore from "./setup-firestore";

// Load fs and path modules at the top level
import { readFileSync } from 'fs';
import { join } from 'path';

// Setup Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Load the service account key file using fs
    const serviceAccountPath = join(process.cwd(), '.secrets', 'firebase-admin-key.json');
    const serviceAccountJson = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson)
    });
    console.log("Firebase Admin initialized successfully with service account");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await setupRoutes(app);

  // Create HTTP server
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Initialize Firestore with sample data if needed
  setupFirestore()
    .then(() => {
      console.log("Firestore setup complete");

      // ALWAYS serve the app on port 5000
      // this serves both the API and the client.
      // It is the only port that is not firewalled.
      const port = process.env.PORT || 5000;
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
        log(`Server is accessible at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      });
    })
    .catch(error => {
      console.error("Error during initialization:", error);

      // Start the server anyway
      const port = process.env.PORT || 5000;
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
        log(`Server is accessible at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      });
    });
})();