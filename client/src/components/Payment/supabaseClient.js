import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rcrsthmlwvdppunboesw.supabase.co/';
const SUPABASE_ANON_KEY = '<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcnN0aG1sd3ZkcHB1bmJvZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxNjE5MzksImV4cCI6MjA0MTczNzkzOX0.WQkx886qg6mDEhhvcxyECa2mDKwEr850FlTaEBp6tjE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
