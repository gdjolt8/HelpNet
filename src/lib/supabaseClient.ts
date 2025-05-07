// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and public API key
const SUPABASE_URL = "https://otwsijcclthmyvmnabeu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90d3NpamNjbHRobXl2bW5hYmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NzYxNjcsImV4cCI6MjA0NzM1MjE2N30.hTG9IF45_fDCyKIvy9dmX2Tti8hq_9GlFtWTT-ssjBg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
