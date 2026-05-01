import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "food")
      .order("id", { ascending: false });

    if (!error) setOrders(data || []);
    else console.log(error);
  };

  useEffect(() => {
    loadOrders();

    // 🔥 LIVE UPDATES (IMPORTANT FOR REAL RESTAURANT USE)
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new.type === "food") {
            setOrders((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markReady = async (id) => {
    await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id);

    loadOrders();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Orders</h1>

      {orders.length === 0 && <p>No food orders yet...</p>}

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "2px solid black",
            padding: 10,
            marginBottom: 10
          }}
        >
          <h3>Table {o.table_number}</h3>

          {o.items?.map((i, idx) => (
            <p key={idx}>🍔 {i.name}</p>
          ))}

          <p>Status: {o.status}</p>

          <button onClick={() => markReady(o.id)}>
            Mark as Ready
          </button>
        </div>
      ))}
    </div>
  );
}
