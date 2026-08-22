const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const usesSupabase = env.usesSupabase;
// SQLite is intentionally loaded only for the isolated test/local fallback adapter.
const sqlite = usesSupabase ? null : require('./database');
const supabase = usesSupabase ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
module.exports = { supabase, sqlite, usesSupabase };
