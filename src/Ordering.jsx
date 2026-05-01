import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "YOUR_ANON_KEY"
);

export default function Ordering() {
  const [table, setTable] = useState("");

  const menu = [
    { id: 1, name: "Burger", price: 8, type: "food" },
    { id: 2, name: "Fries", price: 4, type: "food" },
    { id: 3, name: "Coke", price: 3, type: "drink" }
  ];

  const placeOrder = async (item) => {
    if (!table) {
      alert("Enter table number");
      return;
    }

    const { error } = await supabase.from("orders").insert([
      {
        venue_id: "ysi-venue-1",
        table_number: Number(table),
        items: [{ name: item.name, price: item.price }],
        type: item.type, // ✅ THIS is correct (food or drink)
        status: "pending",
        total_price: item.price
      }
    ]);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      alert("Order placed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍽️ Menu</h1>

      <input
        placeholder="Table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      />

      {menu.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {item.name} - £{item.price}

          <button
            onClick={() => placeOrder(item)}
            style={{ marginLeft: 10 }}
          >
            Order
          </button>
        </div>
      ))}
    </div>
  );
}
