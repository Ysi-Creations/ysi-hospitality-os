import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  // Fetch orders
  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setOrders(data);
    }
  };

  // Load + realtime updates
  useEffect(() => {
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
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet...</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid black",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <p><strong>Table:</strong> {order.table_number}</p>
            <p><strong>Type:</strong> {order.type}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> £{order.total_price}</p>

            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>
                  {item.name} - £{item.price}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
