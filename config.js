// config.js

// ⚠️ IMPORTANT: Replace these with your actual Supabase credentials
export const SUPABASE_URL = 'https://oyavjqycsjfcnzlshdsu.supabase.co'; 
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YXZqcXljc2pmY256bHNoZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTgwMjcsImV4cCI6MjA3NTczNDAyN30.22cwyIWSBmhLefCvobdbH42cPSTnw_NmSwbwaYvyLy4';
export const TABLE_NAME = 'user_profiles'; // Your table name

// REST API Base URL for your table
export const REST_API_URL = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`;

// REST API Headers
export const API_HEADERS = (accessToken) => ({
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    // The Authorization header is required for RLS policies to work
    'Authorization': `Bearer ${accessToken}`, 
    // This header is essential to get the ID back on INSERT
    'Prefer': 'return=representation', 
});