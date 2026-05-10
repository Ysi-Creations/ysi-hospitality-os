import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
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

    // Filter food items for this venue only
    const foodOrders = (data || [])
      .filter((order) => order.venue_id === venue?.id)
      .map((order) => ({
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

    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markReady = async (id) => {
    await supabase.from("orders").update({ status: "ready" }).eq("id", id);
    loadOrders();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {/* Venue Logo */}
      {venue?.logo && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={venue.logo}
            alt={venue.name}
            style={{ height: 80, objectFit: "contain" }}
          />
        </div>
      )}

      <h1 style={{ color: venue?.theme_color || "#000" }}>🍳 Kitchen Orders</h1>

      {orders.length === 0 && <p>No food orders yet...</p>}

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: `2px solid ${venue?.theme_color || "#000"}`,
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <h3>Table {o.table_number}</h3>

          {o.items.map((i, idx) => (
            <p key={idx}>🍔 {i.name}</p>
          ))}

          <p>Status: {o.status}</p>

          <button
            onClick={() => markReady(o.id)}
            style={{
              backgroundColor: venue?.theme_color || "#000",
              color: "#fff",
              padding: "8px 12px",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Mark as Ready
          </button>
        </div>
      ))}
    </div>
  );
}
