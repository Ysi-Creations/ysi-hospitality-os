import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  // ALERT SOUND
  const playAlert = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.play();
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // ONLY SHOW FOOD ITEMS
    const foodOrders = (data || [])
      .map((order) => ({
        ...order,
        items: order.items || [],
      }))
      .filter((order) => order.items.length > 0);

    setOrders(foodOrders);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        () => {
          playAlert();
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markReady = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id);

    if (error) {
      console.log(error);
      alert("Error
