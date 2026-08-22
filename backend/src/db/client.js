const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');
const sqlite = require('./database');
const supabase = env.usesSupabase ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
module.exports = { supabase, sqlite, usesSupabase: env.usesSupabase };
