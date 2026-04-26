import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl"
);

export default function App() {
  const [table, setTable] = useState("");

  const menu = [
    { id: 1, name: "Burger", price: 8, type: "food" },
    { id: 2, name: "Fries", price: 4, type: "food" },
    { id: 3, name: "Coke", price: 3, type: "drink" }
  ];

  const placeOrder = async (item) => {
    if (!table) {
      alert("Please enter table number");
      return;
    }

    const { data, error } = await supabase.from("orders").insert([
      {
        venue_id: "ysi-venue-1",
        table_number: Number(table),
        items: [item],
        type: item.type,
        status: "pending",
        total_price: item.price
      }
    ]);

    i
}if (error) {
  console.log("ERROR:", error);
  alert(error.message);
}
else {
      alert("Order placed!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>YSI Hospitality</h1>

      <input
        placeholder="Enter table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      <h3>Menu</h3>

      {menu.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {item.name} - £{item.price}
          <button
            style={{ marginLeft: 10 }}
            onClick={() => placeOrder(item)}
          >
            Order
          </button>
        </div>
      ))}
    </div>
  );
}
