import { createClient } from '@supabase/supabase-js'


// only for admin users.

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export { supabaseAdmin };