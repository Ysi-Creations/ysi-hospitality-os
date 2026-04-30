import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "PASTE_YOUR_ANON_KEY_HERE"
);

export default function Bar() {
  const [orders, setOrders] = useState([]);

  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "drink")
      .order("id", { ascending: false });

    if (!error) setOrders(data);
    else console.log(error);
  };

  useEffect(() => {
    getOrders();

    const channel = supabase
      .channel("bar-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new.type === "drink") {
            setOrders((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🍹 Bar Orders</h1>

      {orders.length === 0 ? (
        <p>No drink orders yet...</p>
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

            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>
                  🥤 {item.name} - £{item.price}
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
                background: "blue",
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
