import React from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl"
);

export default function App() {
 const menu = [
  { id: 1, name: "Burger", price: 8 },
  { id: 2, name: "Fries", price: 4 },
  { id: 3, name: "Coke", price: 3 }
];

return (
  <div style={{ padding: 20 }}>
    <h1>YSI Hospitality</h1>

    <h3>Menu</h3>

    {menu.map((item) => (
      <div key={item.id} style={{ marginBottom: 10 }}>
        {item.name} - £{item.price}
      </div>
    ))}
  </div>
);
