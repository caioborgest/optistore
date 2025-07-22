import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://oepfwjtxvskkynhzxzhw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGZ3anR4dnNra3luaHp4emh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzUwMzMsImV4cCI6MjA2MzExMTAzM30.mV6dUpJNzhlcPTo3Lpcz0FDAwt0kYtLXmh4S5zOVX5w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});