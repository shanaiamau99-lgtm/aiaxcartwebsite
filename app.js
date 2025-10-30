// app.js (module)
export const SUPABASE_URL = "https://YOURPROJECT.supabase.co";      // <-- paste
export const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";            // <-- paste

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Payment QR paths (place images in img/)
export const PAYMENT = {
  gcash: { label:"GCash", qr:"img/gcash-qr.png" },
  maya:  { label:"Maya",  qr:"img/maya-qr.png" }
};
