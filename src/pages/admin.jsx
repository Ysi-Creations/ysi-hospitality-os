import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayotgjvtivoyfpdwhrud.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3RnanZ0aXZveWZwZHdocnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjUyNjEsImV4cCI6MjA5MjY0MTI2MX0._sbVpoN-gtxVjrCUkqC2N3S-cerzkvmLRnKY0zv9TGs"
);

export default function Admin() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markPaid = async (tableNumber) => {
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("table_number", tableNumber)
      .neq("status", "paid");

    loadOrders();
  };

  const groupByTable = () => {
    const grouped = {};

    orders.forEach((o) => {
      if (!grouped[o.table_number]) {
        grouped[o.table_number] = [];
      }
      grouped[o.table_number].push(o);
    });

    return grouped;
  };

  const grouped = groupByTable();

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 ADMIN DASHBOARD</h1>

      {Object.keys(grouped).length === 0 && <p>No orders yet...</p>}

      {Object.entries(grouped).map(([table, items]) => {
        const total = items.reduce(
          (sum, o) => sum + (o.total_price || 0),
          0
        );

        const isPaid = items.every((o) => o.status === "paid");

        return (
          <div
            key={table}
            style={{
              border: "2px solid black",
              padding: 15,
              marginBottom: 15
            }}
          >
            <h2>Table {table}</h2>

            {items.map((o) => (
              <div key={o.id}>
                <p>
                  {o.type === "food" ? "🍔" : "🥤"}{" "}
                  {o.items?.map((i) => i.name).join(", ")}
                </p>
              </div>
            ))}

            <h3>Total: £{total}</h3>

            <p>Status: {isPaid ? "PAID ✅" : "UNPAID ❌"}</p>

            {!isPaid && (
              <button onClick={() => markPaid(table)}>
                Mark Table as Paid
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
