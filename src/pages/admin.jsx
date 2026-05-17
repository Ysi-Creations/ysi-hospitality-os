import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function Admin({ venue }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!venue?.id) return;
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("venue_id", venue.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      const unpaidOrders = (data || []).filter((o) => o.status !== "paid");
      setOrders(unpaidOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        loadOrders
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [venue]);

  const markPaid = async (tableNumber) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("table_number", tableNumber)
      .eq("venue_id", venue.id)
      .neq("status", "paid");

    if (error) console.error(error);
    else loadOrders();
  };

  const grouped = orders.reduce((acc, order) => {
    const table = order.table_number;
    if (!acc[table]) acc[table] = [];
    acc[table].push(order);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCD34D" }}>
      {/* SINGLE BANNER */}
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

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          📊 ADMIN DASHBOARD — ALL ORDERS
        </h1>

        {loading ? (
          <p className="text-center text-2xl">Loading orders...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-green-700">No active orders at the moment.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([table, tableOrders]) => {
              const total = tableOrders.reduce(
                (sum, o) => sum + Number(o.total_price || 0),
                0
              );

              return (
                <div
                  key={table}
                  className="bg-white rounded-3xl shadow-xl p-8 border-4 border-green-700"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <div className="text-5xl font-bold text-green-800">
                        Table #{table}
                      </div>
                      <div className="text-2xl text-green-600 mt-2">
                        Total: ${total.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => markPaid(table)}
                      className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl text-xl font-bold transition"
                    >
                      MARK TABLE PAID
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tableOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-green-50 border border-green-200 rounded-2xl p-6"
                      >
                        <div className="text-sm text-green-600 mb-3">
                          {new Date(order.created_at).toLocaleTimeString()} • {order.status}
                        </div>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-xl py-1 flex items-center gap-3">
                            {String(item.station || "").toLowerCase() === "kitchen" ? "🍔" : "🥤"}
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-green-700">- ${Number(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
