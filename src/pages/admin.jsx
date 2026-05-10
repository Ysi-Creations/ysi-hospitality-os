import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Admin({ venue }) {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      const venueOrders = (data || []).filter(
        (order) => order.venue_id === venue?.id
      );
      setOrders(venueOrders);
    }
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

    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markPaid = async (tableNumber) => {
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("table_number", tableNumber)
      .neq("status", "paid");

    loadOrders();
  };

  // Group orders by table
  const grouped = orders.reduce((acc, order) => {
    if (!acc[order.table_number]) acc[order.table_number] = [];
    acc[order.table_number].push(order);
    return acc;
  }, {});

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {/* Venue Logo */}
      {venue?.logo && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={venue.logo}
            alt={venue.name}
            style={{ height: 80, objectFit: "contain" }}
          />
        </div>
      )}

      <h1 style={{ color: venue?.theme_color || "#000" }}>
        📊 {venue?.name} Admin
      </h1>

      {Object.keys(grouped).length === 0 && <p>No orders yet...</p>}

      {Object.entries(grouped).map(([table, items]) => {
        const total = items.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const isPaid = items.every((o) => o.status === "paid");

        return (
          <div
            key={table}
            style={{
              border: `2px solid ${venue?.theme_color || "#000"}`,
              padding: 15,
              marginBottom: 15,
              borderRadius: 8,
            }}
          >
            <h2>Table {table}</h2>

            {items.map((o) => (
              <div key={o.id}>
                <p>
                  {o.items?.map((i) =>
                    i.category === "food" ? `🍔 ${i.name}` : `🥤 ${i.name}`
                  ).join(", ")}
                </p>
                <p>£{o.total_price}</p>
              </div>
            ))}

            <h3>Total: £{total}</h3>
            <p>Status: {isPaid ? "PAID ✅" : "UNPAID ❌"}</p>

            {!isPaid && (
              <button
                onClick={() => markPaid(table)}
                style={{
                  backgroundColor: venue?.theme_color || "#000",
                  color: "#fff",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                Mark Table as Paid
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
