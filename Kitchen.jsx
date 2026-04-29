import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "YOUR_ANON_KEY"
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "food")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍳 Kitchen Screen</h1>

      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>Table / Ticket: {o.table_number}</h3>

          <p>
            {o.items?.map((i, idx) => (
              <span key={idx}>
                {i.name} (£{i.price}){" "}
              </span>
            ))}
          </p>

          <p>Status: {o.status}</p>

          <button onClick={() => updateStatus(o.id, "preparing")}>
            Preparing
          </button>

          <button onClick={() => updateStatus(o.id, "ready")}>
            Ready
          </button>
        </div>
      ))}
    </div>
  );
}
