import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* FIXED SUPABASE — VALID JAVASCRIPT */
const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl"
);

export default function App() {
  const [table, setTable] = useState("");

  async function testConnection() {
    const { error } = await supabase.from("orders").select("*").limit(1);

    if (error) {
      alert("Supabase error: " + error.message);
    } else {
      alert("✅ Connection working");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>YSI Hospitality</h1>

      <input
        placeholder="Table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <br /><br />

      <button onClick={testConnection}>
        Test Supabase Connection
      </button>
    </div>
  );
}
