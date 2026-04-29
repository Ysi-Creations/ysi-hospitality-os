import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Kitchen fetch error:", error);
    } else {
      setOrders(data);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <h3>Table: {order.table_number}</h3>
            <p>Status: {order.status}</p>
            <pre>{JSON.stringify(order.items, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  );
}
