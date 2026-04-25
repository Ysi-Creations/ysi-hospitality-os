import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SUPABASE (FIXED — NO SYNTAX ERRORS)
========================= */
const supabase = createClient(
  "https://yotgjvtivoyfpdwhrud.supabase.co",
  "sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl"
);

/* =========================
   APP (MINIMAL STABLE VERSION)
========================= */
export default function App() {
  const [menu] = useState([
    { id: 1, name: "Burger", price: 8, station: "kitchen" },
    { id: 2, name: "Fries", price: 4, station: "kitchen" },
    { id: 3, name: "Coke", price: 3, station: "bar" }
  ]);

  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");

  function add(item) {
    setCart((prev) => [...prev, item]);
  }

  function remove(index) {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  }

  async function checkout() {
    if (!table) return alert("Enter table number");
    if (cart.length === 0) return alert("Cart empty");

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        venue_id: "default",
        table_number: table,
        status: "pending",
        payment_status: "unpaid"
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Order failed");
    }

    const items = cart.map((i) => ({
      order_id: order.id,
      venue_id: "default",
      item_name: i.name,
      price: i.price,
      station: i.station
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemError) {
      console.error(itemError);
      alert("Order saved but items failed");
    } else {
      alert("Order sent successfully");
      setCart([]);
      setTable("");
    }
  }

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>YSI Hospitality (Stable Build)</h2>

      <input
        placeholder="Table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      <h3>Menu</h3>

      {menu.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          {item.name} - £{item.price}
          <button onClick={() => add(item)}> + </button>
        </div>
      ))}

      <h3>Cart</h3>

      {cart.map((item, i) => (
        <div key={i}>
          {item.name} - £{item.price}
          <button onClick={() => remove(i)}>X</button>
        </div>
      ))}

      <h4>Total: £{cart.reduce((s, i) => s + i.price, 0)}</h4>

      <button onClick={checkout}>Confirm Order</button>
    </div>
  );
}
