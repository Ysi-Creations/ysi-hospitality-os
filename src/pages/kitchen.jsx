import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function Kitchen({ venue }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD KITCHEN ORDERS (FOOD ONLY)
  const loadOrders = async () => {
    if (!venue?.id) return;
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .neq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    // FILTER: ONLY FOOD items for kitchen
    const kitchenOrders = (data || [])
      .map((order) => ({
        ...order,
        items: (order.items || []).filter(
          (i) => String(i.station || "").toLowerCase() === "kitchen"
        ),
      }))
      .filter((order) => order.items.length > 0);

    setOrders(kitchenOrders);
    setLoading(false);
  };

  // REALTIME UPDATES
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-live-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        loadOrders
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markReady = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", id);

    if (error) console.error(error);
    else loadOrders();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCD34D" }}>
      {/* Banner */}
      <div className="w-full">
        <Image
          src="/mamas-banner.png"
          alt="Mama's Jamaican Kitchen"
          width={1200}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          KITCHEN ORDERS — FOOD ONLY
        </h1>

        {loading ? (
          <p className="text-center text-2xl">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-green-700">No food orders at the moment.</p>
            <p className="text-green-600 mt-4">New orders will appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-xl p-8 border-4 border-green-700"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-4xl font-bold text-green-800">
                      Table #{order.table_number}
                    </div>
                    <div className="text-xl text-green-600 mt-1">
                      Total: ${Number(order.total_price).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => markReady(order.id)}
                    className="bg-green-700 hover:bg-green-800 text-white px-10 py-4 rounded-2xl text-xl font-bold transition"
                  >
                    MARK READY
                  </button>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-green-50 border border-green-200 rounded-2xl p-6 text-2xl"
                    >
                      <span className="font-semibold">{item.name}</span>
                      {item.description && (
                        <span className="text-green-700 text-xl ml-3">- {item.description}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-green-600 mt-6">
                  Order placed: {new Date(order.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
