import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "YOUR_ANON_KEY"
);

export default function Bar() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "drink")
      .order("id", { ascending: false });

    setOrders(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>🍹 Bar</h1>

      {orders.map(o => (
        <div key={o.id}>
          <h3>Table {o.table_number}</h3>
          {o.items?.map((i, idx) => (
            <p key={idx}>🥤 {i.name}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
