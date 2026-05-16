import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Bar({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD BAR ORDERS
  const loadOrders = async () => {
    try {
      if (!venue?.id) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("venue_id", venue.id)
        .neq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        return;
      }

      // STRICT BAR FILTER
      const filteredOrders = (data || [])
        .map((order) => ({
          ...order,
          items: (order.items || []).filter((item) => {
            const station = String(item.station || "").toLowerCase();
            return station === "bar";
          }),
        }))
        .filter((order) => order.items.length > 0);

      setOrders(filteredOrders);

    } catch (err) {
      console.log(err);
    }
  };

  // REALTIME UPDATES
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("bar-live-orders")
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
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "ready" })
        .eq("id", id);

      if (error) {
        console.log(error);
        return;
      }

      loadOrders();

    } catch (err) {
      console.log(err);
    }
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
        🍹 Bar Orders
      </h1>

      {/* EMPTY */}
      {orders.length === 0 && (
        <p>No drink orders.</p>
      )}

      {/* ORDERS */}
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            background: "#fff",
            border: `2px solid ${venue?.theme_color || "#000"}`,
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Table {order.table_number}</h2>

          {order.items.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: 8,
              }}
            >
              🥤 {item.name}
            </div>
          ))}

          <p>Status: {order.status}</p>

          <button
            onClick={() => markReady(order.id)}
            style={{
              backgroundColor: venue?.theme_color || "#000",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Mark Ready
          </button>
        </div>
      ))}

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          color: "#777",
        }}
      >
        © {venue?.name || "Hospitality OS"}
        <br />
        Powered by Ysi Creations
      </footer>
    </div>
  );
}
