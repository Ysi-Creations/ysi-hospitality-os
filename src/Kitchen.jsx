import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    console.log("📡 Fetching kitchen orders...");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Kitchen fetch error:", error);
      setLoading(false);
      return;
    }

    console.log("✅ Orders received:", data);

    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Dashboard</h1>

      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <p>No orders yet</p>
      )}

      {orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>Table: {order.table_number}</h3>
          <p>Status: {order.status}</p>
          <pre>{JSON.stringify(order.items, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
