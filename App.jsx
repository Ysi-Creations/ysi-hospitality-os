import React from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl"
);

export default function App() {
  return (
  <div style={{ padding: 20 }}>
    <h1>YSI Hospitality</h1>
    <p>Build fixed</p>
  </div>
);
