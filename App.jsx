import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
);

import Bar from "./Bar";

export default function App() {
  return <Bar />;
}
  const [orders, setOrders] = useState([]);

  // Load orders
  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "food")
      .order("id", { ascending: false });

    if (!error) {
      setOrders(data);
    } else {
      console.log(error);
    }
  };

  // Live updates (real-time kitchen feed)
  useEffect(() => {
    console.log("KITCHEN LOADED");

    getOrders();

    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍳 Kitchen Screen</h1>

      {orders.length === 0 ? (
        <p>No food orders yet...</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "2px solid #000",
              padding: 15,
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <h2>Table {order.table_number}</h2>

            <p><strong>Status:</strong> {order.status}</p>

            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>
                  🍔 {item.name} - £{item.price}
                </li>
              ))}
            </ul>

            <button
              onClick={async () => {
                await supabase
                  .from("orders")
                  .update({ status: "ready" })
                  .eq("id", order.id);

                getOrders();
              }}
              style={{
                marginTop: 10,
                padding: 10,
                background: "green",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Mark as Ready
            </button>
          </div>
        ))
      )}
    </div>
  );
}
