import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Bar() {
  const [orders, setOrders] = useState([]);

  // ALERT SOUND
  const playAlert = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.volume = 1;

    audio.play().catch(() => {
      console.log("Sound blocked until user interacts with page");
    });
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // ONLY SHOW DRINK ORDERS
    const drinkOrders = (data || [])
      .map((order) => ({
        ...order,
        drinks: order.drinks || [],
      }))
      .filter((order) => order.drinks.length > 0);

    setOrders(drinkOrders);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("bar-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          playAlert();
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markReady = async (id) => {
    console.log("Updating order:", id);

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id)
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("Failed to update order");
      return;
    }

    loadOrders();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍹 Bar Orders</h1>

      <button onClick={playAlert}>
        Enable Sound
      </button>

      {orders.length === 0 && (
        <p>No drink orders yet...</p>
      )}

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "2px solid black",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>
            {o.order_type === "Takeaway"
              ? "Takeaway Order"
              : `Table ${o.table_number}`}
          </h3>

          {o.drinks.map((i, idx) => (
            <p key={idx}>
              🥤 {i.name} - {i.price} EGP
            </p>
          ))}

          <p>Status: {o.status}</p>

          <p>
            Date:{" "}
            {new Date(o.created_at).toLocaleString()}
          </p>

          <button onClick={() => markReady(o.id)}>
            Mark as Ready
          </button>
        </div>
      ))}

      {/* Copyright and Branding */}
      <p style={{ textAlign: "center", marginTop: 40, fontSize: "14px", color: "#666" }}>
        © 2026 Mama's Jamaican Kitchen Meals — All Rights Reserved. Powered by Ysi Creations.
      </p>
    </div>
  );
}
