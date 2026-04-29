import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "#fff", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>🍳 Kitchen Display</h1>

      {orders.length === 0 ? (
        <div style={{ opacity: 0.7 }}>
          <h2>No orders yet</h2>
          <p>Waiting for new orders...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#222",
                padding: 15,
                borderRadius: 10,
                border: "2px solid #333"
              }}
            >
              <h3>Table {order.table_number}</h3>
              <p>Status: {order.status}</p>
              <p>Total: £{order.total_price}</p>

              <div>
                {order.items?.map((item, i) => (
                  <div key={i}>
                    • {item.name} (£{item.price})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
