import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Bar({ venue }) {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    if (!venue?.id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .neq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) return console.log(error);

    // STRICT DRINK FILTER
    const barOrders = (data || [])
      .map((order) => ({
        ...order,
        items: (order.items || []).filter(
          (i) => String(i.station || "").toLowerCase() === "bar"
        ),
      }))
      .filter((order) => order.items.length > 0);

    setOrders(barOrders);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("bar-live-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markReady = async (id) => {
    await supabase.from("orders").update({ status: "ready" }).eq("id", id);
    loadOrders();
  };

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        fontFamily: "Arial",
        backgroundColor: "#e7b94f",
      }}
    >
      {/* Banner */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img
          src="/mamas-banner.png"
          alt="Mama's Jamaican Kitchen"
          style={{ width: "100%", maxWidth: 700, borderRadius: 12 }}
        />
      </div>

      <h1 style={{ color: "#000", marginBottom: 20, textAlign: "center" }}>🍹 Bar Orders</h1>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 18 }}>No drink orders at the moment.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: 10, fontWeight: "bold" }}>Table: {order.table_number}</div>
            {order.items.map((i, idx) => (
              <div key={idx} style={{ paddingLeft: 10 }}>
                🥤 {i.name} ({i.price} L.E)
              </div>
            ))}
            <button
              onClick={() => markReady(order.id)}
              style={{
                marginTop: 10,
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Mark Ready
            </button>
          </div>
        ))
      )}

      <footer style={{ marginTop: 40, textAlign: "center", color: "#777" }}>
        © {venue?.name || "Mama's Jamaican Kitchen"} <br /> Powered by Ysi Creations
      </footer>
    </div>
  );
}
