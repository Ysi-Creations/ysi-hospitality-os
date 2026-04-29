import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
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
      alert("Enter table or ticket number");
      return;
    }

    const { error } = await supabase.from("orders").insert([
      {
        venue_id: "ysi-venue-1",
        table_number: Number(table),
        items: [{ name: item.name, price: item.price }],
        type: item.type,
        status: "pending",
        total_price: item.price
      }
    ]);

    if (error) {
      console.log("ERROR:", error);
      alert(error.message);
    } else {
      alert("Order placed successfully");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>YSI Hospitality OS</h1>

      <input
        placeholder="Table / Ticket number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      />

      <h3>Menu</h3>

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
