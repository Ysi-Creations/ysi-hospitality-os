import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Admin({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD ORDERS
  const loadOrders = async () => {
    if (!venue?.id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // Only show unpaid orders in active dashboard
    const unpaidOrders = (data || []).filter(
      (o) => o.status !== "paid"
    );

    setOrders(unpaidOrders);
  };

  // REALTIME
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

  // MARK PAID
  const markPaid = async (tableNumber) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("table_number", tableNumber)
      .eq("venue_id", venue.id)
      .neq("status", "paid");

    if (error) {
      console.log(error);
      return;
    }

    loadOrders();
  };

  // GROUP BY TABLE
  const grouped = orders.reduce((acc, order) => {
    if (!acc[order.table_number]) acc[order.table_number] = [];
    acc[order.table_number].push(order);
    return acc;
  }, {});

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      {/* LOGO */}
      {venue?.logo && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={venue.logo}
            alt={venue.name}
            style={{ height: 90, objectFit: "contain" }}
          />
        </div>
      )}

      <h1 style={{ color: venue?.theme_color || "#000", marginBottom: 20 }}>
        📊 {venue?.name} Admin
      </h1>

      {Object.keys(grouped).length === 0 && <p>No active orders.</p>}

      {Object.entries(grouped).map(([table, items]) => {
        const total = items.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

        const isPaid = items.every((o) => o.status === "paid");

        return (
          <div
            key={table}
            style={{
              background: "#fff",
              border: `2px solid ${venue?.theme_color || "#000"}`,
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h2>Table {table}</h2>

            {items.map((o) => (
              <div key={o.id} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #ddd" }}>
                <p>
                  {o.items
                    ?.map((i) =>
                      String(i.category).toLowerCase() === "food" ? `🍔 ${i.name}` : `🥤 ${i.name}`
                    )
                    .join(", ")}
                </p>
                <p>L.E {o.total_price}</p>
                <p>Status: {o.status}</p>
              </div>
            ))}

            <h3>Total: L.E {total}</h3>
            {!isPaid && (
              <button
                onClick={() => markPaid(table)}
                style={{
                  backgroundColor: venue?.theme_color || "#000",
                  color: "#fff",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Mark Table as Paid
              </button>
            )}
          </div>
        );
      })}

      <footer style={{ marginTop: 40, textAlign: "center", color: "#777" }}>
        © {venue?.name || "Hospitality OS"} <br /> Powered by Ysi Creations
      </footer>
    </div>
  );
}
