import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD ORDERS
  const loadOrders = async () => {
    if (!venue?.id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // FILTER FOOD ITEMS
    const foodOrders = (data || [])
      .map((order) => ({
        ...order,
        items: (order.items || []).filter(
          (i) =>
            String(i.category).toLowerCase() === "food"
        ),
      }))
      .filter((order) => order.items.length > 0);

    setOrders(foodOrders);
  };

  // REALTIME
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venue]);

  // MARK READY
  const markReady = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    loadOrders();
  };

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      {/* LOGO */}
      {venue?.logo && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={venue.logo}
            alt={venue.name}
            style={{
              height: 90,
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {/* TITLE */}
      <h1
        style={{
          color: venue?.theme_color || "#000",
          marginBottom: 20,
        }}
      >
        🍳 Kitchen Orders
      </h1>

      {/* EMPTY */}
      {orders.length === 0 && (
        <p>No food orders yet...</p>
      )}

      {/* ORDERS */}
      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            background: "#fff",
            border: `2px solid ${
              venue?.theme_color || "#000"
            }`,
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Table {o.table_number}</h2>

          {o.items.map((i, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 8,
              }}
            >
              🍔 {i.name}
            </div>
          ))}

          <p>Status: {o.status}</p>

          <button
            onClick={() => markReady(o.id)}
            style={{
              backgroundColor:
                venue?.theme_color || "#000",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Mark as Ready
          </button>
        </div>
      ))}

      {/* COPYRIGHT */}
      <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          color: "#777",
        }}
      >
        © {venue?.name || "Hospitality OS"} <br />
        Powered by Ysi Creations
      </footer>
    </div>
  );
}
