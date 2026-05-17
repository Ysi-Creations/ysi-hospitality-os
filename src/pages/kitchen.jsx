import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // ✅ ONLY SHOW FOOD ITEMS
    const foodOrders = (data || []).map((order) => ({
      ...order,
      items: (order.items || []).filter((i) => i.category === "food"),
    }))
    .filter((order) => order.items.length > 0);

    setOrders(foodOrders);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          loadOrders();
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
            marginBottom: 10,
          }}
        >
          <h3>Table {o.table_number}</h3>

          {o.items.map((i, idx) => (
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
