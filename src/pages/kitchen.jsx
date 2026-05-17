import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
  const [orders, setOrders] = useState([]);

  // LOAD KITCHEN ORDERS
  const loadOrders = async () => {
    try {
      if (!venue?.id) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("venue_id", venue.id)
        .neq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) return console.log(error);

      // Filter only kitchen items
      const kitchenOrders = (data || [])
        .map((order) => ({
          ...order,
          items: (order.items || []).filter(
            (i) => String(i.station || "").toLowerCase() === "kitchen"
          ),
        }))
        .filter((order) => order.items.length > 0);

      setOrders(kitchenOrders);
    } catch (err) {
      console.log(err);
    }
  };

  // REALTIME UPDATES
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-live-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [venue]);

  // MARK ORDER READY
  const markReady = async (id) => {
    try {
      await supabase.from("orders").update({ status: "ready" }).eq("id", id);
      loadOrders();
    } catch (err) {
      console
