import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

const app = express();

// Security middleware
if (config.isProduction) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
  }));
}

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await testDbConnection();
    const status = dbHealthy ? 'healthy' : 'unhealthy';
    const statusCode = dbHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Request logging middleware
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
    
    // Log all requests in production, API requests in development
    if (config.isProduction || path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Include response preview for API endpoints
      if (path.startsWith("/api") && capturedJsonResponse) {
        const preview = JSON.stringify(capturedJsonResponse).slice(0, 100);
        logLine += ` :: ${preview}${preview.length === 100 ? "..." : ""}`;
      }

      // Include IP and user agent in production
      if (config.isProduction) {
        const ip = req.ip || req.connection.remoteAddress;
        logLine = `[${ip}] ${logLine}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection on startup
  const dbHealthy = await testDbConnection();
  if (!dbHealthy && config.isProduction) {
    console.error("Database connection failed - exiting");
    process.exit(1);
  }

  const server = await registerRoutes(app);

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
