import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
);

export default function Bar() {
  const [orders, setOrders] = useState([]);

  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "drink")
      .order("id", { ascending: false });

    if (!error) setOrders(data);
    else console.log(error);
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍹 BAR SCREEN WORKING</h1>

      {orders.length === 0 ? (
        <p>No drink orders yet...</p>
      ) : (
        orders.map((order) => (
          <div key={order.id}>
            <h2>Table {order.table_number}</h2>
            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>{item.name}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
