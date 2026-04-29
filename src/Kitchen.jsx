import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Kitchen() {
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log("🔍 ENV URL:", url);
      console.log("🔍 ENV KEY:", key);

      if (!url || !key) {
        setStatus("❌ Missing Vercel environment variables");
        return;
      }

      const supabase = createClient(url, key);

      setStatus("✅ Supabase initialized successfully");
    } catch (err) {
      console.error("🔥 CRASH:", err);
      setStatus("❌ Supabase crashed: " + err.message);
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Debug Mode</h1>
      <p>{status}</p>
    </div>
  );
}
