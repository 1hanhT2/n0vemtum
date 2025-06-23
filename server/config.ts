
export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Auth
  replitClientId: process.env.REPLIT_CLIENT_ID,
  replitClientSecret: process.env.REPLIT_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  
  // AI
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
} as const;

// Validate required environment variables in production
if (config.isProduction) {
  const requiredVars = [
    'DATABASE_URL',
    'REPLIT_CLIENT_ID', 
    'REPLIT_CLIENT_SECRET',
    'SESSION_SECRET',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }
}
