import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ocbxogundqqmgectmdms.supabase.co";  
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYnhvZ3VuZHFxbWdlY3RtZG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDA3NDIsImV4cCI6MjA1NjQxNjc0Mn0.thlXnEi8GRctfsSBc8afjd01D4eX0RKFv__BrrF1SWo";  

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
