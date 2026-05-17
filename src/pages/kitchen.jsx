import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD KITCHEN ORDERS
  const loadOrders = async () => {
    try {
      if (!venue?.id) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("venue_id", venue.id)
        .neq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) return console.log(error);

      // Filter only kitchen items
      const kitchenOrders = (data || [])
        .map((order) => ({
          ...order,
          items: (order.items || []).filter(
            (i) => String(i.station || "").toLowerCase() === "kitchen"
          ),
        }))
        .filter((order) => order.items.length > 0);

      setOrders(kitchenOrders);
    } catch (err) {
      console.log(err);
    }
  };

  // REALTIME UPDATES
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-live-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [venue]);

  // MARK ORDER READY
  const markReady = async (id) => {
    try {
      await supabase.from("orders").update({ status: "ready" }).eq("id", id);
      loadOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#e7b94f",
        padding: 20,
        fontFamily: "Arial",
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

      <h1 style={{ textAlign: "center", color: "#000", marginBottom: 20 }}>
        Kitchen Orders
      </h1>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 18 }}>No food orders at the moment.</p>
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
            <div style={{ marginBottom: 10 }}>
              <strong>Table: {order.table_number}</strong> | Total: L.E {order.total_price}
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ paddingLeft: 10 }}>
                - {item.name} ({item.price} L.E)
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
    </div>
  );
}
