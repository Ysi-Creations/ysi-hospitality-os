import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h1>❌ Database Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h1>🍳 Kitchen</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10
            }}
          >
            <p><strong>Table:</strong> {order.table_number}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> £{order.total_price}</p>
            <pre>{JSON.stringify(order.items, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  );
}
