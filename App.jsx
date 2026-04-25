import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
 https://yotgjvtivoyfpdwhrud.supabase.co,
 sb_publishable_jBiQXRHMmmfLZtOipmWp9A_iDJEiYMl
);

/* =========================
   APP
========================= */
export default function App() {
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");

  const menu = [
    { name: "Burger", price: 8, station: "kitchen" },
    { name: "Fries", price: 4, station: "kitchen" },
    { name: "Coke", price: 3, station: "bar" },
    { name: "Beer", price: 5, station: "bar" }
  ];

  function add(item) {
    setCart([...cart, item]);
  }

  function remove(index) {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  }

  async function checkout() {
    if (!table) return alert("Enter table number");
    if (cart.length === 0) return alert("Cart is empty");

    const { data: order } = await supabase
      .from("orders")
      .insert({
        venue_id: "DEMO_VENUE",
        table_number: table,
        status: "pending",
        payment_status: "unpaid"
      })
      .select()
      .single();

    const items = cart.map(i => ({
      order_id: order.id,
      venue_id: "DEMO_VENUE",
      item_name: i.name,
      price: i.price,
      station: i.station
    }));

    await supabase.from("order_items").insert(items);

    alert("Order sent to kitchen & bar");

    setCart([]);
  }

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>🍽️ YSI Hospitality</h1>
        <p style={{ margin: 0, opacity: 0.7 }}>Scan • Order • Enjoy</p>
      </div>

      {/* TABLE INPUT */}
      <div style={styles.tableBox}>
        <input
          style={styles.input}
          placeholder="Enter Table Number"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />
      </div>

      {/* MENU GRID */}
      <h2>Menu</h2>

      <div style={styles.grid}>
        {menu.map((item, i) => (
          <div key={i} style={styles.card}>
            <h3 style={{ margin: "5px 0" }}>{item.name}</h3>
            <p style={{ margin: 0 }}>£{item.price}</p>
            <small>{item.station}</small>

            <button style={styles.addBtn} onClick={() => add(item)}>
              Add +
            </button>
          </div>
        ))}
      </div>

      {/* CART */}
      <div style={styles.cart}>
        <h2>Cart</h2>

        {cart.length === 0 && <p>No items yet</p>}

        {cart.map((item, i) => (
          <div key={i} style={styles.cartItem}>
            <span>{item.name} - £{item.price}</span>
            <button onClick={() => remove(i)}>Remove</button>
          </div>
        ))}

        <h3>
          Total: £{cart.reduce((s, i) => s + i.price, 0)}
        </h3>

        <button style={styles.checkout} onClick={checkout}>
          Confirm Order
        </button>
      </div>
    </div>
  );
}

/* =========================
   STYLES (IMPORTANT)
========================= */
const styles = {
  page: {
    fontFamily: "Arial",
    padding: 20,
    background: "#f6f6f6",
    minHeight: "100vh"
  },

  header: {
    background: "#111",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  tableBox: {
    marginBottom: 20
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10
  },

  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },

  addBtn: {
    marginTop: 10,
    width: "100%",
    padding: 8,
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 5
  },

  cart: {
    marginTop: 30,
    padding: 15,
    background: "white",
    borderRadius: 10
  },

  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8
  },

  checkout: {
    marginTop: 10,
    width: "100%",
    padding: 12,
    background: "green",
    color: "white",
    border: "none",
    borderRadius: 8
  }
};
