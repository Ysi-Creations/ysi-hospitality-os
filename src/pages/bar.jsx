import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Bar({ venue }) {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    if (!venue?.id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .neq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) return console.log(error);

    const barOrders = (data || [])
      .map(order => ({
        ...order,
        items: (order.items || []).filter(i => String(i.station).toLowerCase() === "bar")
      }))
      .filter(order => order.items.length > 0);

    setOrders(barOrders);
  };

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel("bar-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markReady = async (id) => {
    await supabase.from("orders").update({ status: "ready" }).eq("id", id);
    loadOrders();
  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", fontFamily: "Arial" }}>
      {venue?.logo && <div style={{ textAlign: "center", marginBottom: 20 }}><img src={venue.logo} alt={venue.name} style={{ height: 90, objectFit: "contain" }} /></div>}
      <h1 style={{ color: venue?.theme_color || "#000", marginBottom: 20 }}>🍹 Bar Orders</h1>
      {orders.length === 0 && <p>No drink orders.</p>}
      {orders.map(o => (
        <div key={o.id} style={{ background: "#fff", border: `2px solid ${venue?.theme_color || "#000"}`, borderRadius: 10, padding: 15, marginBottom: 15, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h2>Table {o.table_number}</h2>
          {o.items.map((i, idx) => <div key={idx} style={{ marginBottom: 8 }}>🥤 {i.name}</div>)}
          <p>Status: {o.status}</p>
          <button onClick={() => markReady(o.id)} style={{ backgroundColor: venue?.theme_color || "#000", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer" }}>Mark Ready</button>
        </div>
      ))}
      <footer style={{ marginTop: 40, textAlign: "center", color: "#777" }}>© {venue?.name || "Hospitality OS"} <br /> Powered by Ysi Creations</footer>
    </div>
  );
}
