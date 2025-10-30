// app.js (module)
export const SUPABASE_URL = "https://qjnusrvcnlpawpsphsll.supabase.co";      // <-- paste
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbnVzcnZjbmxwYXdwc3Boc2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mjc0NzMsImV4cCI6MjA3NzQwMzQ3M30.xulwKxzyzlflUW6nORWN58QsVvHsh0uVp9tbrdNfACc";            // <-- paste

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Payment QR paths (place images in img/)
export const PAYMENT = {
  gcash: { label:"GCash", qr:"img/gcash-qr.png" },
  maya:  { label:"Maya",  qr:"img/maya-qr.png" }
};
