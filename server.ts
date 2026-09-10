import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import dotenv from "dotenv";

dotenv.config();

// Helper to retrieve active Admin Master PIN (persisted across restarts or from environment)
function getActiveAdminPin(): string | undefined {
  try {
    const pinFile = path.join(process.cwd(), ".admin_pin.secret");
    if (fs.existsSync(pinFile)) {
      const stored = fs.readFileSync(pinFile, "utf-8").trim();
      if (stored) return stored;
    }
  } catch (err) {
    console.error("[SECURITY] Error reading secret PIN file:", err);
  }
  return process.env.ADMIN_MASTER_PIN?.trim();
}

// In-memory rate limiting and lockout state
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

// In-memory cryptographically secure admin sessions store
interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
}
const adminSessions = new Map<string, AdminSession>();

// Helper to extract client IP address
function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "global";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Explicitly serve static files from public/ (PWA manifest, service worker, icons, screenshots)
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("manifest.json")) {
        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.endsWith("sw.js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.setHeader("Service-Worker-Allowed", "/");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  }));

  // CORS middleware for mobile apps (Capacitor/WebView) and remote origins
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // 1. POST /api/admin/verify-pin
  // Secure Server-side Admin PIN verification with anti-brute force rate limiting and session creation
  app.post("/api/admin/verify-pin", (req, res) => {
    const ipKey = getClientIp(req);
    const now = Date.now();

    const record = failedAttemptsMap.get(ipKey) || { count: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Account locked for ${remainingSec} seconds. (سیکورٹی لاک آؤٹ: عارضی طور پر بند ہے)`,
        retryAfterSeconds: remainingSec
      });
    }

    const { pin } = req.body || {};
    const configuredPin = getActiveAdminPin();

    // STRICT: Refuse authentication if server secret is missing (no default fallback)
    if (!configuredPin) {
      console.error("[SECURITY ALERT] ADMIN_MASTER_PIN is not configured in server environment.");
      return res.status(503).json({
        success: false,
        message: "Admin Master PIN is not configured on the server. Please set ADMIN_MASTER_PIN in server environment."
      });
    }

    const cleanedPin = typeof pin === "string" ? pin.trim() : "";

    if (cleanedPin === configuredPin) {
      // Clear rate limit record on success
      failedAttemptsMap.delete(ipKey);

      // Issue cryptographically secure random session token
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const sessionDurationMs = 8 * 60 * 60 * 1000; // 8 hours
      const expiresAt = now + sessionDurationMs;

      adminSessions.set(sessionToken, {
        token: sessionToken,
        createdAt: now,
        expiresAt,
        ip: ipKey
      });

      return res.json({
        success: true,
        adminToken: sessionToken,
        expiresIn: sessionDurationMs / 1000
      });
    } else {
      record.count += 1;
      if (record.count >= 5) {
        record.lockedUntil = now + 2 * 60 * 1000; // 2 minutes lockout
        failedAttemptsMap.set(ipKey, record);
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. Admin access locked for 120 seconds. (5 غلط کوششوں کے بعد لاک ہو گیا ہے)",
          retryAfterSeconds: 120
        });
      } else {
        failedAttemptsMap.set(ipKey, record);
        return res.status(401).json({
          success: false,
          message: `Incorrect Admin PIN. Remaining attempts: ${5 - record.count} (غلط پن کوڈ)`,
          remainingAttempts: 5 - record.count
        });
      }
    }
  });

  // 2. POST /api/admin/validate-session
  // Cryptographically verifies whether a given adminToken is active and unexpired
  app.post("/api/admin/validate-session", (req, res) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const token = bearerToken || req.body?.adminToken;

    if (!token || typeof token !== "string") {
      return res.status(401).json({ valid: false, message: "Missing session token" });
    }

    const session = adminSessions.get(token);
    const now = Date.now();

    if (!session || session.expiresAt <= now) {
      if (session) adminSessions.delete(token);
      return res.status(401).json({ valid: false, message: "Session expired or invalid" });
    }

    return res.json({ valid: true, expiresAt: session.expiresAt });
  });

  // 3. POST /api/admin/logout
  // Explicitly revokes and destroys an active admin session token
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const token = bearerToken || req.body?.adminToken;

    if (token && typeof token === "string") {
      adminSessions.delete(token);
    }

    return res.json({ success: true, message: "Admin session revoked" });
  });

  // 4. POST /api/admin/change-pin
  // Changes the server-side Admin Master PIN
  app.post("/api/admin/change-pin", (req, res) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const token = bearerToken || req.body?.adminToken;
    const { currentPin, newPin } = req.body || {};

    const session = token ? adminSessions.get(token) : null;
    const now = Date.now();
    const isSessionValid = session && session.expiresAt > now;

    const configuredPin = getActiveAdminPin();

    if (!isSessionValid && (!currentPin || currentPin.trim() !== configuredPin)) {
      return res.status(403).json({ success: false, message: "Unauthorized: Invalid credentials or expired session" });
    }

    if (!newPin || typeof newPin !== "string" || newPin.trim().length < 4) {
      return res.status(400).json({ success: false, message: "New PIN must be at least 4 characters" });
    }

    // Update in process environment and persist securely
    const cleanedNewPin = newPin.trim();
    process.env.ADMIN_MASTER_PIN = cleanedNewPin;
    try {
      const pinFile = path.join(process.cwd(), ".admin_pin.secret");
      fs.writeFileSync(pinFile, cleanedNewPin, { encoding: "utf-8", mode: 0o600 });
    } catch (err) {
      console.error("[SECURITY] Failed to persist new admin pin:", err);
    }
    console.log("[SECURITY AUDIT] Admin Master PIN successfully updated.");

    return res.json({ success: true, message: "Admin Master PIN updated successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


