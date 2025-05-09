import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Standard Supabase Client 
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Supabase Client with elevated privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);