import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // ALERT SOUND
  const playAlert = () => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.volume = 1;

    audio.play().catch(() => {
      console.log("Sound blocked until user interacts with page");
    });
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

    setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
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

  const markPaid = async (id) => {
    console.log("Updating payment:", id);

    const { data, error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", id)
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      alert("Failed to update payment");
      return;
    }

    loadOrders();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 ADMIN DASHBOARD</h1>

      <button onClick={playAlert}>
        Enable Sound
      </button>

      {orders.length === 0 && (
        <p>No orders yet...</p>
      )}

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "2px solid black",
            padding: 15,
            marginBottom: 15,
          }}
        >
          <h2>
            {o.order_type === "Takeaway"
              ? "Takeaway Order"
              : `Table ${o.table_number}`}
          </h2>

          {o.items?.length > 0 && (
            <div>
              <h3>🍳 Kitchen Items</h3>

              {o.items.map((i, idx) => (
                <p key={idx}>
                  {i.name} - {i.price} EGP
                </p>
              ))}
            </div>
          )}

          {o.drinks?.length > 0 && (
            <div>
              <h3>🍹 Drinks</h3>

              {o.drinks.map((i, idx) => (
                <p key={idx}>
                  {i.name} - {i.price} EGP
                </p>
              ))}
            </div>
          )}

          <p>
            <strong>Total:</strong>{" "}
            {o.total_price} EGP
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {o.status}
          </p>

          <p>
            <strong>Date & Time:</strong>{" "}
            {new Date(o.created_at).toLocaleString()}
          </p>

          {o.order_type === "Takeaway" && (
            <>
              <p>
                <strong>Pickup Area:</strong>{" "}
                {o.pickup_area}
              </p>

              <p>
                <strong>Landmark:</strong>{" "}
                {o.landmark}
              </p>

              {/* Customer Mobile Number - Always visible for takeaway orders */}
              {(o.mobile || o.customer_mobile || o.phone_number || o.phone || o.customer_phone) && (
                <p>
                  <strong>Customer Mobile:</strong>{" "}
                  {o.mobile || o.customer_mobile || o.phone_number || o.phone || o.customer_phone}
                </p>
              )}
            </>
          )}

          {o.status !== "paid" && (
            <button onClick={() => markPaid(o.id)}>
              Mark as Paid
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
