const path = require('path');
const root = path.resolve(__dirname, '../..');
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const env = { nodeEnv: process.env.NODE_ENV || 'development', port: number(process.env.API_PORT, 3000), databasePath: path.resolve(root, process.env.DATABASE_PATH || './data/mysphyro.db'), jwtSecret: process.env.JWT_SECRET || 'development-only-change-me-before-production', jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d', uploadDir: process.env.VERCEL ? '/tmp/mysphyro-uploads' : path.resolve(root, process.env.UPLOAD_DIR || './uploads'), maxFileSize: number(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024, corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean), supabaseUrl: process.env.SUPABASE_URL, supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, geminiApiKey: process.env.GEMINI_API_KEY, geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash', supabaseUploadBucket: process.env.SUPABASE_UPLOAD_BUCKET || 'documents' };
env.usesSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
if (env.nodeEnv === 'production' && (!env.usesSupabase || !env.geminiApiKey)) throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY are required in production');
module.exports = env;
