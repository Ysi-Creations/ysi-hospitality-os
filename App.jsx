import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SUPABASE (ONLY EDIT THIS)
========================= */
const supabase = createClient(
  https://yotgjvtivoyfpdwhrud.supabase.co,
 sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl
);

/* =========================
   APP
========================= */
export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");
  const [venue] = useState(
    new URLSearchParams(window.location.search).get("venue") || "default"
  );

  /* LOAD MENU (from Supabase) */
  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("venue_id", venue)
      .eq("available", true);

    setMenu(data || []);
  }

  function addToCart(item) {
    setCart([...cart, item]);
  }

  function removeFromCart(index) {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  }

  /* CHECKOUT */
  async function checkout() {
    if (!table) return alert("Enter table number");
    if (cart.length === 0) return alert("Cart is empty");

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        venue_id: venue,
        table_number: table,
        status: "pending",
        payment_status: "unpaid"
      })
      .select()
      .single();

    if (error) return alert(error.message);

    const items = cart.map((i) => ({
      order_id: order.id,
      venue_id: venue,
      item_name: i.name,
      price: i.price,
      station: i.station
    }));

    await supabase.from("order_items").insert(items);

    alert("Order sent successfully");

    setCart([]);
    setTable("");
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>🍽 YSI Hospitality</h2>
        <p>Venue: {venue}</p>
      </div>

      {/* TABLE */}
      <input
        style={styles.input}
        placeholder="Table number"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />

      {/* MENU */}
      <h3>Menu</h3>

      <div style={styles.grid}>
        {menu.map((item) => (
          <div key={item.id} style={styles.card}>
            <h4>{item.name}</h4>
            <p>£{item.price}</p>
            <small>{item.station}</small>
            <button onClick={() => addToCart(item)}>Add</button>
          </div>
        ))}
      </div>

      {/* CART */}
      <h3>Cart</h3>

      {cart.map((item, i) => (
        <div key={i} style={styles.cartItem}>
          {item.name} - £{item.price}
          <button onClick={() => removeFromCart(i)}>X</button>
        </div>
      ))}

      <h4>Total: £{cart.reduce((s, i) => s + i.price, 0)}</h4>

      <button style={styles.checkout} onClick={checkout}>
        Confirm Order
      </button>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    fontFamily: "Arial",
    padding: 20,
    background: "#f4f4f4",
    minHeight: "100vh"
  },
  header: {
    background: "#111",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10
  },
  card: {
    background: "white",
    padding: 10,
    borderRadius: 10
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 5
  },
  checkout: {
    width: "100%",
    padding: 12,
    background: "green",
    color: "white",
    border: "none",
    borderRadius: 8,
    marginTop: 10
  }
};
