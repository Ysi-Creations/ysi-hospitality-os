import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "PASTE_YOUR_ANON_KEY_HERE"
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "food")
      .order("id", { ascending: false });

    if (!error) setOrders(data);
    else console.log(error);
  };

  useEffect(() => {
    getOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (payload.new.type === "food") {
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
    <div style={{ padding: 20 }}>
      <h1>🍳 KITCHEN</h1>

      {orders.length === 0 ? (
        <p>No food orders yet...</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "2px solid black",
              padding: 15,
              marginBottom: 10
            }}
          >
            <h2>Table {order.table_number}</h2>

            <ul>
              {order.items?.map((item, i) => (
                <li key={i}>
                  🍔 {item.name} - £{item.price}
                </li>
              ))}
            </ul>

            <p>Status: {order.status}</p>

            <button
              onClick={async () => {
                await supabase
                  .from("orders")
                  .update({ status: "ready" })
                  .eq("id", order.id);

                getOrders();
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
