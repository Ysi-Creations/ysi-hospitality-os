import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Kitchen() {
  const [status, setStatus] = useState("starting");
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log("ENV URL:", url);
      console.log("ENV KEY:", key);

      if (!url || !key) {
        throw new Error("Missing Vercel environment variables");
      }

      const supabase = createClient(url, key);

      setStatus("Supabase connected");

      supabase.from("orders").select("*").then(({ data, error }) => {
        if (error) {
          setError("Database Error: " + error.message);
          return;
        }

        console.log("ORDERS:", data);
        setStatus("Connected to database");
      });

    } catch (err) {
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h1>❌ Kitchen Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen</h1>
      <p>{status}</p>
    </div>
  );
}
