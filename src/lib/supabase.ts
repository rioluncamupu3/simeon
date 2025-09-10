import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Get environment variables or use development placeholders
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

// For development mode, we'll use a mock client if the URL is the example one
const isDevelopment = supabaseUrl === 'https://example.supabase.co';

if (isDevelopment) {
  console.warn('Using development mode with mock Supabase client');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// In a real application, you would create a Supabase project and use actual credentials