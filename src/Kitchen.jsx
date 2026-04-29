import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Kitchen() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    console.log("📡 Fetching orders from Supabase...");

    const { data, error } = await supabase
      .from("orders")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // SAFE GUARDS (prevents blank screen)
  if (loading) return <h2>Loading Kitchen...</h2>;
  if (!orders) return <h2>No data received</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
            <p>Table: {order.table_number}</p>
            <p>Status: {order.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
